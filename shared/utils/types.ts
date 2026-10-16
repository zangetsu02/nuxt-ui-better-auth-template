import type { user } from '~~/server/database/schema'

/**
 * A full row of the user table — what server code reads and writes.
 * The browser does not get this shape: see `SessionUser` in `useAuth()`, which is
 * derived from the auth client so it only ever promises fields Better Auth sends.
 */
export type User = typeof user.$inferSelect
