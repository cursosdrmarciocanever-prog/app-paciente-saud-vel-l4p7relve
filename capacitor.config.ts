import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.clinicacanever.app',
  appName: 'Clínica Canever',
  // App empacota o build da web (pasta dist). Rode `pnpm build` antes de `npx cap sync`.
  webDir: 'dist',
  ios: {
    // Permite cookies/escopo do PocketBase em produção
    limitsNavigationsToAppBoundDomains: false,
  },
}

export default config
