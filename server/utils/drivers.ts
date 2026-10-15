import pg from 'pg'
import { Resend } from 'resend'
import { runtimeConfig } from './runtimeConfig'
import { sharedResource } from './sharedResource'

export const getPgPool = sharedResource(() => new pg.Pool({
  connectionString: runtimeConfig.databaseUrl,
  max: 90,
  idleTimeoutMillis: 30000
}))

// Lazy: the Resend constructor throws when the API key is missing, which would break
// module import during build and `pnpm auth:schema`.
export const getResend = sharedResource(() => new Resend(runtimeConfig.resendApiKey))
