#!/usr/bin/env bash
#
# deploy.sh — builda o frontend e publica tudo no VPS (rodar da máquina LOCAL).
#
# Envia para o servidor:
#   - o build do frontend (dist/)        -> /opt/canever-app/pb_public/
#   - as migrations (pocketbase/migrations) -> /opt/canever-app/pb_migrations/
#   - os hooks (pocketbase/hooks)        -> /opt/canever-app/pb_hooks/
# e reinicia o serviço.
#
# Uso:
#   SSH_HOST=root@SEU_IP DOMAIN=app.clinicacanever.com.br bash deploy/deploy.sh
#
set -euo pipefail

SSH_HOST="${SSH_HOST:?Defina SSH_HOST, ex: root@123.45.67.89}"
DOMAIN="${DOMAIN:-app.clinicacanever.com.br}"
APP_DIR="/opt/canever-app"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_ROOT"

echo ">> 1/4 Build do frontend (VITE_POCKETBASE_URL=https://${DOMAIN})"
VITE_POCKETBASE_URL="https://${DOMAIN}" corepack pnpm build

echo ">> 2/4 Enviando frontend para o servidor"
rsync -az --delete dist/ "${SSH_HOST}:${APP_DIR}/pb_public/"

echo ">> 3/4 Enviando migrations e hooks"
rsync -az --delete pocketbase/migrations/ "${SSH_HOST}:${APP_DIR}/pb_migrations/"
rsync -az --delete pocketbase/hooks/      "${SSH_HOST}:${APP_DIR}/pb_hooks/"

echo ">> 4/4 Ajustando permissões e reiniciando o serviço"
ssh "$SSH_HOST" "chown -R pocketbase:pocketbase ${APP_DIR} && systemctl restart canever-app && sleep 2 && systemctl is-active canever-app"

echo ">> Deploy concluído. App em: https://${DOMAIN}"
