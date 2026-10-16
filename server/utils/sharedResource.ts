import { runtimeConfig } from './runtimeConfig'

/**
 * On a long-lived server (`node-server`) build the resource once and reuse it.
 * On any other preset each invocation is isolated, so a cached handle would be
 * useless at best and stale at worst — build a fresh one every time.
 */
export function sharedResource<T>(create: () => T): () => T {
  let instance: T | undefined

  return () => {
    if (runtimeConfig.preset !== 'node-server') {
      return create()
    }
    return instance ??= create()
  }
}
