#!/usr/bin/env bash
#
# setup-vps.sh — provisiona o backend (PocketBase) atrás do nginx em um VPS Ubuntu.
# Roda UMA vez no servidor, como root. Idempotente.
#
# Arquitetura: PocketBase escuta só em 127.0.0.1:8090 (serve SPA + API + hooks)
# e o nginx faz proxy reverso do subdomínio com TLS (certbot).
# Esse modelo convive com outros sites já hospedados no mesmo VPS.
#
# Uso:  sudo DOMAIN=app.clinicacanever.com.br EMAIL=voce@dominio.com bash setup-vps.sh
#       (depois rode deploy/deploy.sh da máquina local para enviar app+migrations+hooks)
#
set -euo pipefail

DOMAIN="${DOMAIN:-app.clinicacanever.com.br}"
EMAIL="${EMAIL:-cursosdrmarciocanever@gmail.com}"
PB_VERSION="${PB_VERSION:-0.26.6}"
APP_DIR="/opt/canever-app"
SERVICE_USER="pocketbase"

echo ">> Provisionando PocketBase (proxy nginx) para: ${DOMAIN}"

# 1. Dependências
apt-get update -y
apt-get install -y unzip curl ca-certificates nginx
# certbot via apt (ou snap, conforme a distro)
command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx

# 2. Arquitetura do binário
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) PB_ARCH="amd64" ;;
  aarch64|arm64) PB_ARCH="arm64" ;;
  *) echo "Arquitetura não suportada: $ARCH" >&2; exit 1 ;;
esac

# 3. Usuário de serviço
id "$SERVICE_USER" &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"

# 4. Diretórios
mkdir -p "$APP_DIR"/{pb_data,pb_migrations,pb_hooks,pb_public}

# 5. Binário do PocketBase
if [ ! -x "$APP_DIR/pocketbase" ] || ! "$APP_DIR/pocketbase" --version 2>/dev/null | grep -q "$PB_VERSION"; then
  echo ">> Baixando PocketBase ${PB_VERSION} (${PB_ARCH})"
  tmp="$(mktemp -d)"
  curl -sSL -o "$tmp/pb.zip" \
    "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip"
  unzip -o "$tmp/pb.zip" -d "$tmp" >/dev/null
  install -m 0755 "$tmp/pocketbase" "$APP_DIR/pocketbase"
  rm -rf "$tmp"
fi
chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR"

# 6. Serviço systemd (PocketBase só no loopback)
cat > /etc/systemd/system/canever-app.service <<UNIT
[Unit]
Description=Clinica Canever - App do Paciente (PocketBase)
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${APP_DIR}
ExecStart=${APP_DIR}/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable canever-app
systemctl restart canever-app

# 7. nginx: proxy reverso (HTTP; o certbot adiciona o TLS no passo 8)
cat > /etc/nginx/sites-available/${DOMAIN} <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 50M;          # uploads de fotos

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$http_connection;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 360s;
        proxy_buffering off;           # realtime (SSE) do PocketBase
    }
}
NGINX
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
nginx -t && systemctl reload nginx

# 8. TLS via certbot (exige o DNS A do subdomínio já apontando para este VPS)
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect || {
  echo "!! certbot falhou — confirme que ${DOMAIN} resolve para o IP deste VPS e rode de novo:"
  echo "   certbot --nginx -d ${DOMAIN} --agree-tos -m ${EMAIL} --redirect"
}

echo ">> Pronto. Crie o superusuário do banco:"
echo "   sudo -u ${SERVICE_USER} ${APP_DIR}/pocketbase superuser upsert SEU_EMAIL SUA_SENHA"
echo ">> Painel do banco: https://${DOMAIN}/_/"
