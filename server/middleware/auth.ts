export default defineEventHandler(async (event) => {
  const path = event.path

  if (path.startsWith('/sign-in') || path.startsWith('/sign-up') || path.startsWith('/api/auth')) {
    return
  }
})
