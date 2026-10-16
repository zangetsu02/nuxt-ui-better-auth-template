import type { H3Event } from 'h3'
import type { User } from '~~/shared/utils/types'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, openAPI } from 'better-auth/plugins'
import { v7 as uuidv7 } from 'uuid'
import * as schema from '../database/schema'
import { useDB } from './db'
import { getResend } from './drivers'
import { runtimeConfig } from './runtimeConfig'
import { sharedResource } from './sharedResource'

export const createBetterAuth = () => betterAuth({
  baseURL: runtimeConfig.public.baseURL,
  trustedOrigins: [runtimeConfig.public.baseURL],
  secret: runtimeConfig.betterAuthSecret,
  database: drizzleAdapter(
    useDB(),
    {
      provider: 'pg',
      schema
    }
  ),
  advanced: {
    database: {
      generateId: () => {
        return uuidv7()
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const response = await getResend().emails.send({
        from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`
      })
      if (response.error) {
        console.error(`Failed to send reset password email: ${response.error.message}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  plugins: [
    ...(runtimeConfig.public.appEnv === 'development' ? [openAPI()] : []),
    admin()
  ]
})

export const useServerAuth = sharedResource(createBetterAuth)

export type ServerAuth = ReturnType<typeof createBetterAuth>

// The Better Auth CLI (`pnpm auth:schema`) resolves the config by importing this
// file and reading an export named `auth`. Do not rename or remove it.
export const auth = useServerAuth()

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuth = useServerAuth()
  const session = await serverAuth.api.getSession({
    headers
  })
  return session
}

export const requireAuth = async (event: H3Event) => {
  const session = await getAuthSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  return session.user as User
}
