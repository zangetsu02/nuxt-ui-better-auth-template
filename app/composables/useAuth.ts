import type {
  BetterAuthClientOptions,
  InferSessionFromClient
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
import type { ServerAuth } from '~~/server/utils/auth'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

const createClient = (baseURL: string, headers?: Record<string, string>) => createAuthClient({
  baseURL,
  fetchOptions: {
    headers
  },
  plugins: [
    inferAdditionalFields<ServerAuth>(),
    adminClient()
  ]
})

type AuthClient = ReturnType<typeof createClient>

/** The user exactly as Better Auth sends it to the browser, fields and all. */
export type SessionUser = NonNullable<Awaited<ReturnType<AuthClient['getSession']>>['data']>['user']

// In the browser the client must outlive the call: useAuth() runs on every route
// change, and a fresh client each time would pile up session listeners that are
// never released. On the server it cannot be shared — it captures request headers.
let browserClient: AuthClient | undefined
let sessionListenerAttached = false
// Browser only: concurrent callers wait on the same request instead of reading stale state.
let browserSessionFetch: Promise<unknown> | undefined

export function useAuth() {
  const url = useRequestURL()
  const client = import.meta.server
    ? createClient(url.origin, useRequestHeaders())
    : (browserClient ??= createClient(url.origin))

  const session = useState<InferSessionFromClient<BetterAuthClientOptions> | null>('auth:session', () => null)
  const user = useState<SessionUser | null>('auth:user', () => null)

  const loadSession = async () => {
    const { data } = await client.getSession()
    session.value = data?.session || null
    user.value = data?.user ?? null
    return data
  }

  const fetchSession = (): ReturnType<typeof loadSession> => {
    if (import.meta.server) {
      return loadSession()
    }
    browserSessionFetch ??= loadSession().finally(() => {
      browserSessionFetch = undefined
    })
    return browserSessionFetch as ReturnType<typeof loadSession>
  }

  if (import.meta.client && !sessionListenerAttached) {
    sessionListenerAttached = true
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal)
        return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    requestPasswordReset: client.requestPasswordReset,
    resetPassword: client.resetPassword,
    errorCodes: client.$ERROR_CODES,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      await client.signOut({
        fetchOptions: {
          onSuccess: async () => {
            session.value = null
            user.value = null
            if (redirectTo) {
              await reloadNuxtApp({
                path: redirectTo.toString()
              })
            }
          }
        }
      })
    },
    fetchSession,
    client
  }
}
