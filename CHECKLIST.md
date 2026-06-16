# Checklist & Guia de Testes — App do Paciente (Clínica Canever)

**App:** https://app.clinicacanever.com.br
**Painel do banco (PocketBase):** https://app.clinicacanever.com.br/_/

## Contas de teste (senha: `Skip@Pass`)
| Perfil | E-mail | Abre em |
|---|---|---|
| Admin | `admin@canever.com.br` | Painel administrativo |
| Paciente | `paciente@teste.com` | Área do paciente |

> ⚠️ Senhas de teste — trocar antes do uso real.

---

## ✅ Já desenvolvido

- [x] App migrado da plataforma Skip → hospedado no VPS próprio (Hostinger) com HTTPS
- [x] Marca da Clínica Canever (sem "Skip")
- [x] Correção do bug que travava o painel admin (roles)
- [x] **App instalável no celular (PWA)** — ícone próprio, tela cheia
- [x] **Bioimpedância por CPF** — admin anexa por CPF; vincula automaticamente; fica pendente e vincula quando o paciente se cadastra
- [x] **Fotos por CPF** — mesmo esquema; aceita imagem **e PDF**
- [x] CPF no cadastro, no perfil e editável pelo admin (Usuários)
- [x] Detecção automática de **data e nome** pelo nome do arquivo (padrão `bio nome dd-mm-aa`)
- [x] **Visualizador de laudos** (PDF/imagem) na própria tela
- [x] **Métricas de composição corporal** (peso, massa muscular, massa de gordura, % gordura) + **gráfico de evolução** + diferença antes/depois
- [x] **Sub-aba "Antes e Depois"** (bioimpedância e fotos) — dois PDFs/imagens lado a lado
- [x] Features de engajamento: Atividade Física, Diário Alimentar, Hidratação, Conquistas (badges)
- [x] Endpoint + workflow n8n para automação por mensagem (pronto, à espera de canal)

## 🔲 A desenvolver / pendente

- [ ] **Pagamento real** (hoje simulado/mock) — escolher gateway (Mercado Pago/Stripe)
- [ ] **Trocar senhas de teste** (`Skip@Pass`, `senha123`)
- [ ] **Backup automático** dos dados (LGPD)
- [ ] **Privacidade dos arquivos (LGPD)** — proteger PDFs/fotos por token de acesso
- [ ] **Chat de suporte (n8n)** — configurar o webhook/secret `N8N_WEBHOOK_URL`
- [ ] **Automação WhatsApp** — via Telegram ou API oficial da Meta (Evolution ficou de lado pelo risco de banimento)
- [ ] **Monitoramento de disco + alerta**
- [ ] (Opcional) **OCR** das métricas da bioimpedância (ler números do PDF)

---

## 🧪 Guia de teste — Área do Paciente
Entre com `paciente@teste.com`.

| Aba | O que testar |
|---|---|
| **Início** | Cards de resumo; widget de **Hidratação** (+250ml salva); card "Acompanhe seus hábitos"; catálogo de injetáveis |
| **Meus Agendamentos** | Lista de consultas agendadas |
| **Progresso Clínico → Galeria** | Sub-abas **Fotos** (enviar imagem/PDF) e **Antes e Depois** (comparar 2 lado a lado) |
| **Progresso Clínico → Exames** | Enviar exame (PDF/imagem) + **Visualizar** na tela |
| **Progresso Clínico → Bioimpedância** | Sub-aba **Laudos**: enviar laudo + métricas + **gráfico de evolução**; sub-aba **Antes e Depois** |
| **Atividade Física** | Registrar atividade (desbloqueia badge) |
| **Diário Alimentar** | Registrar refeição |
| **Conquistas** | Badges desbloqueados |
| **Minhas Fotos** | Galeria de fotos (aceita PDF) |
| **Loja de Injetáveis** | Catálogo → checkout → pagamento (⚠️ **simulado**) |
| **Biblioteca de Saúde** | Artigos e vídeos (⚠️ exige assinatura ativa) |
| **Suporte** | Abrir chamado / chat (⚠️ chat depende do n8n) |
| **Minha Assinatura** | Status do plano |
| **Perfil** | Dados + **CPF** exibido |

## 🧪 Guia de teste — Painel Admin
Entre com `admin@canever.com.br`.

| Aba | O que testar |
|---|---|
| **Dashboard → Fotos** | **Anexar foto por CPF** (imagem ou PDF); ver fotos dos pacientes |
| **Dashboard → Exames / Bioimpedância / Pedidos** | Listagens por paciente |
| **Horários** | Gerenciar horários/slots de agendamento |
| **Usuários** | Listar pacientes; **Detalhes → editar CPF** (vincula pendentes) |
| **Assinaturas** | Gerenciar assinaturas; ativar bônus |
| **Conteúdos** | Criar/editar artigos e vídeos da Biblioteca |
| **Bioimpedância** | **Anexar por CPF** + métricas; lista com **pendentes**; busca por CPF |
| **Injetáveis** | Catálogo de injetáveis |
| **Suporte** | Conversas de suporte (⚠️ depende do n8n) |
