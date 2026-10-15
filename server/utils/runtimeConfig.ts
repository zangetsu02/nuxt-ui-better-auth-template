import type { RuntimeConfig } from 'nuxt/schema'
import { config } from 'dotenv'

// Nitro auto-imports useRuntimeConfig; it is absent when this module is loaded from
// nuxt.config.ts or the better-auth CLI, hence the typeof guard below.
declare const useRuntimeConfig: (() => RuntimeConfig) | undefined

let runtimeConfigInstance: RuntimeConfig

export const generateRuntimeConfig = () => ({
  preset: process.env.NUXT_NITRO_PRESET,
  betterAuthSecret: process.env.NUXT_BETTER_AUTH_SECRET,
  // Resend
  resendApiKey: process.env.NUXT_RESEND_API_KEY,
  // DB
  databaseUrl: process.env.NUXT_DATABASE_URL,
  public: {
    baseURL: process.env.NUXT_APP_URL,
    appName: process.env.NUXT_APP_NAME,
    appEnv: process.env.NODE_ENV,
    appRepo: process.env.NUXT_APP_REPO,
    appNotifyEmail: process.env.NUXT_APP_NOTIFY_EMAIL,
    appContactEmail: process.env.NUXT_APP_CONTACT_EMAIL,
    auth: {
      redirectUserTo: '/',
      redirectGuestTo: '/sign-in'
    }
  }
})

if (typeof useRuntimeConfig !== 'undefined') {
  runtimeConfigInstance = useRuntimeConfig()
} else {
  // for cli: npm run auth:schema
  config({ quiet: true })
  runtimeConfigInstance = generateRuntimeConfig() as RuntimeConfig
}

export const runtimeConfig = runtimeConfigInstance
