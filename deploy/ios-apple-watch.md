# App iOS (Capacitor) + Apple Watch (HealthKit) — passo a passo

A parte de **código já está pronta** no projeto:
- Capacitor configurado (`capacitor.config.ts`, appId `br.com.clinicacanever.app`)
- Plugin `capacitor-health` (HealthKit no iOS / Health Connect no Android)
- Serviço `src/services/appleHealth.ts` (lê treinos do Apple Watch e sincroniza)
- Botão **"Sincronizar Apple Watch"** na tela **Atividade Física** (aparece só no app nativo iOS)

Falta a parte que **exige o Xcode** (só roda no seu Mac). Siga os passos abaixo.

## 0. Pré-requisitos (você)
1. **Xcode** instalado pela App Store (vários GB).
   Depois, no terminal: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
2. **CocoaPods**: `sudo gem install cocoapods` (ou `brew install cocoapods`)
3. **Conta Apple Developer** (US$ 99/ano): https://developer.apple.com/programs/
   (necessária para HealthKit em dispositivo real e para TestFlight/App Store)

## 1. Gerar o projeto iOS (uma vez)
Na pasta do projeto:
```bash
pnpm build
npx cap add ios
npx cap sync ios
```

## 2. Abrir no Xcode
```bash
npx cap open ios
```

## 3. Configurar no Xcode
No projeto (alvo **App**), aba **Signing & Capabilities**:
1. **Team**: selecione seu time da conta Apple Developer; marque **Automatically manage signing**.
2. **Bundle Identifier**: `br.com.clinicacanever.app`
3. Clique **+ Capability** → adicione **HealthKit**.

Na aba **Info** (ou no arquivo `App/Info.plist`), adicione duas chaves:
- `Privacy - Health Share Usage Description` (`NSHealthShareUsageDescription`)
  → *"Usamos seus dados de atividade do Apple Watch para registrar seus treinos e acompanhar sua evolução."*
- `Privacy - Health Update Usage Description` (`NSHealthUpdateUsageDescription`)
  → *"Permite registrar treinos no app Saúde."*

## 4. Rodar no seu iPhone
1. Conecte o iPhone (que tenha o Apple Watch pareado) via cabo.
2. No topo do Xcode, selecione seu iPhone como destino.
3. Clique em **▶ Run**. (Na 1ª vez, no iPhone: Ajustes → Geral → VPN e Gerenciamento de Dispositivos → confie no seu certificado de desenvolvedor.)

## 5. Testar a integração
No app, vá em **Atividade Física** → **Sincronizar Apple Watch** → conceda as permissões de Saúde.
Os treinos do Apple Watch (corrida, caminhada, musculação, etc.) entram como atividades, sem duplicar nas próximas sincronizações.

## 6. Atualizar o app depois de mudanças na web
Sempre que mudar o código web:
```bash
pnpm build
npx cap sync ios
```
(e rode de novo pelo Xcode)

## 7. Distribuir para testers (TestFlight)
No Xcode: **Product → Archive** → **Distribute App → App Store Connect → Upload**.
Depois, no App Store Connect, libere no **TestFlight** para os pacientes-piloto.

---

### Observações
- O botão "Sincronizar Apple Watch" **só aparece no app iOS nativo** — no navegador/PWA ele fica oculto (HealthKit não existe na web).
- Para **Android**, o mesmo plugin usa o **Health Connect** (Google) — fica para uma etapa seguinte.
- Quando for compilar e aparecer algum erro de versão/pod, me chame que eu ajusto.
