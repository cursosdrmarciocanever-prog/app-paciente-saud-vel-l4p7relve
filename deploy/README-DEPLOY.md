# Deploy — App do Paciente (Clínica Canever)

Arquitetura: **VPS Hostinger** com **nginx** (proxy reverso + TLS) na frente do
**PocketBase**, que serve ao mesmo tempo:

- o **frontend** (React/Vite, build estático em `pb_public/`)
- a **API e os hooks** de backend (`/api/...` e `/backend/v1/...`)

O PocketBase escuta apenas em `127.0.0.1:8090`; o nginx publica o subdomínio com
HTTPS (certbot/Let's Encrypt). Esse modelo convive com outros sites do mesmo VPS
(ex.: `estoque.clinicacanever.com.br`).

```
Navegador ──HTTPS──> nginx (:443, certbot) ──proxy──> PocketBase (127.0.0.1:8090)
                                                        ├── /            -> app React (pb_public)
                                                        ├── /api/...     -> API PocketBase
                                                        ├── /_/          -> painel admin do banco
                                                        └── /backend/... -> hooks (checkout, webhooks)
```

**Estado atual:** no ar em `https://app.clinicacanever.com.br` (VPS `31.97.175.179`).

## Pré-requisitos no servidor

- VPS Hostinger com **Ubuntu** (22.04 ou 24.04) e acesso **root via SSH**.
- DNS: um registro **A** para `app.clinicacanever.com.br` apontando para o **IP do VPS**.
  (Configurado no painel de DNS da Hostinger.)

## Passo a passo

### 1. Apontar o DNS

No painel de DNS do domínio, criar:

| Tipo | Nome  | Valor (Aponta para) | TTL    |
|------|-------|---------------------|--------|
| A    | `app` | `IP_DO_SEU_VPS`     | padrão |

Esperar a propagação (geralmente minutos). Testar: `ping app.clinicacanever.com.br`.

### 2. Enviar os arquivos e provisionar (rodar da máquina LOCAL)

```bash
# da raiz do projeto
SSH_HOST=root@IP_DO_VPS DOMAIN=app.clinicacanever.com.br bash deploy/deploy.sh
```

> Na primeira vez, antes do `deploy.sh`, rode o provisionamento do serviço:
> ```bash
> # copia o script e executa no servidor
> scp deploy/setup-vps.sh root@IP_DO_VPS:/root/
> ssh root@IP_DO_VPS "DOMAIN=app.clinicacanever.com.br EMAIL=cursosdrmarciocanever@gmail.com bash /root/setup-vps.sh"
> ```
> O `setup-vps.sh` baixa o PocketBase, cria o serviço `canever-app` (systemd) e o habilita.
> Depois disso, `deploy.sh` cuida dos envios e reinícios nas próximas atualizações.

### 3. Criar o superusuário do PocketBase (painel de administração do banco)

```bash
ssh root@IP_DO_VPS \
  "sudo -u pocketbase /opt/canever-app/pocketbase superuser upsert SEU_EMAIL SUA_SENHA"
```

Painel: `https://app.clinicacanever.com.br/_/`

## Contas de acesso ao APP (criadas pelas migrations/seed)

| Papel       | E-mail                       | Senha      |
|-------------|------------------------------|------------|
| Admin       | `admin@canever.com.br`       | `senha123` |
| Financeiro  | `financeiro@canever.com.br`  | `senha123` |

> ⚠️ **Trocar essas senhas após o primeiro acesso** (são senhas de teste do seed).

## Atualizações futuras

Qualquer mudança no código: rode novamente
```bash
SSH_HOST=root@IP_DO_VPS DOMAIN=app.clinicacanever.com.br bash deploy/deploy.sh
```

## Backup

O banco fica em `/opt/canever-app/pb_data/`. Para backup:
```bash
ssh root@IP_DO_VPS "tar czf - -C /opt/canever-app pb_data" > backup-$(date +%F).tar.gz
```
Recomendado agendar um backup periódico (cron) — os dados são de pacientes (LGPD).

## Observações

- **Pagamentos**: o checkout atual é **simulado** (sem gateway real). Para cobrança real,
  integrar Mercado Pago / Stripe nos hooks `pocketbase/hooks/checkout_process.js` e
  `payment_webhook.js`.
- **Dados sensíveis (LGPD)**: por serem dados de saúde, manter backups e acesso restrito.
