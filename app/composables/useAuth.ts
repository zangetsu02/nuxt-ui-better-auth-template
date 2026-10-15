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

export function useAuth() {
  const url = useRequestURL()
  const client = import.meta.server
    ? createClient(url.origin, useRequestHeaders())
    : (browserClient ??= createClient(url.origin))

  const session = useState<InferSessionFromClient<BetterAuthClientOptions> | null>('auth:session', () => null)
  const user = useState<SessionUser | null>('auth:user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true
    const { data } = await client.getSession()
    session.value = data?.session || null
    user.value = data?.user ?? null
    sessionFetching.value = false
    return data
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
