import { getMigrations } from 'better-auth/db'

export default defineEventHandler(async (_event) => {
  const serverAuth = useServerAuth()
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(serverAuth.options)

  if (!toBeCreated.length && !toBeAdded.length) {
    return `No migrations to run`
  }
  await runMigrations()

  return 'Database migrations ran successfully'
})
