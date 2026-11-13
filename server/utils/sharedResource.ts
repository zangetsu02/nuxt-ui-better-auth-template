/**
 * Build the resource on first use and reuse it. On a long-lived server this keeps one
 * DB pool / auth instance; on serverless, warm invocations reuse it instead of opening
 * a new pool per call that is never closed.
 */
export function sharedResource<T>(create: () => T): () => T {
  let instance: T | undefined
  return () => instance ??= create()
}
