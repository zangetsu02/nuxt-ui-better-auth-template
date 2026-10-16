
<h1 align="center">Nuxt 4 + Nuxt UI 4 + Drizzle ORM + Better Auth + Resend Starter Template</h1>

A starter template for building a web application with Nuxt 4, Nuxt UI 4, Drizzle ORM, PostgreSQL, Resend and Better Auth. It gives you a working email/password auth flow, a typed database layer and ready-made pagination helpers, so you can start on your actual feature set.

## ✨ Features

- 🚀 **Modern Tech Stack** - Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4
- 🔒 **Secure Auth** - Better Auth with sessions, admin plugin and CSRF/origin protection
- 💾 **Enterprise Database** - PostgreSQL with Drizzle ORM and SQL migrations
- 📧 **Email Integration** - Built-in Resend support for password reset
- 📱 **Responsive** - Mobile-first design approach
- 🎯 **Developer Experience** - ESLint + `vue-tsc` type checking

## 📦 Stack

| Package | Version |
| --- | --- |
| Nuxt | 4.6 |
| Nuxt UI | 4.11 |
| Better Auth | 1.7 |
| Drizzle ORM / Kit | 0.45 / 0.31 |
| Resend | 6.33 |
| Zod | 4.6 |
| ESLint | 10 |
| TypeScript | 5.9 |

Requires **Node.js 20+** and **pnpm 10+**.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/zangetsu02/nuxt-ui-better-auth-template
cd nuxt-ui-better-auth-template

# 2. Install dependencies
pnpm i

# 3. Setup environment variables
cp .env.example .env

# 4. Start the database
docker compose up -d

# 5. Apply database migrations
pnpm db:migrate

# 6. Start the development server
pnpm dev
```

Then open http://localhost:3000 — you will be redirected to `/sign-in`. Create an account from `/sign-up` and you are in.

## ⚙️ Environment variables

`.env.example` ships with values that match `docker-compose.yml`, so a fresh clone works out of the box.

| Variable | Purpose |
| --- | --- |
| `NUXT_NITRO_PRESET` | Set to `node-server` to reuse a single DB pool / auth instance across requests. Any other value creates them per request (serverless). |
| `NUXT_BETTER_AUTH_SECRET` | Session signing secret. **Generate a real one** with `npx auth secret` — Better Auth warns on short or low-entropy values. |
| `NUXT_RESEND_API_KEY` | Resend API key, used for the password-reset email. |
| `NUXT_DATABASE_URL` | PostgreSQL connection string. |
| `NUXT_APP_URL` | Public base URL. Becomes Better Auth's `baseURL` **and** its only trusted origin. |
| `NUXT_APP_NAME` | Used as the sender name on outgoing emails. |
| `NUXT_APP_REPO`, `NUXT_APP_NOTIFY_EMAIL`, `NUXT_APP_CONTACT_EMAIL` | Free-form app metadata exposed on the public runtime config. |

> **Note:** these variables are read at **build time** by `generateRuntimeConfig()` in `nuxt.config.ts`. If you build once and deploy the same artifact to several environments, override them at runtime using Nitro's naming convention instead (`NUXT_DATABASE_URL`, `NUXT_BETTER_AUTH_SECRET`, `NUXT_PUBLIC_BASE_URL`, `NUXT_PUBLIC_APP_NAME`, …). Getting `NUXT_PUBLIC_BASE_URL` wrong in production makes the browser's auth calls fail with `403 MISSING_OR_NULL_ORIGIN`.

## 🛠 Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server with HMR |
| `pnpm build` / `pnpm preview` | Production build / preview it |
| `pnpm lint` | ESLint over the whole project |
| `pnpm typecheck` | `vue-tsc` over app + server code |
| `pnpm auth:schema` | Regenerate the Better Auth Drizzle schema |
| `pnpm db:generate` | Generate a SQL migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |

## 🗄 Database & migrations

The auth schema lives in `server/database/schema/auth.ts`. It is **generated** by Better Auth — do not edit it by hand. Add your own tables in sibling files and export them from `server/database/schema/index.ts`.

Whenever you change Better Auth's config (adding a plugin, extra user fields, …), regenerate and migrate:

```bash
pnpm auth:schema   # rewrite server/database/schema/auth.ts, then lint-fix it
pnpm db:generate   # diff the schema against the migration history
pnpm db:migrate    # apply the new migration
```

`pnpm auth:schema` runs the Better Auth CLI (`npx auth@latest generate`). The old `@better-auth/cli` package is deprecated and no longer receives updates.

Get a typed Drizzle client with `useDB()`. On a `node-server` preset one client is built and reused; on serverless presets a fresh one is built per invocation:

```typescript
const rows = await useDB().select().from(user)
```

## 🔑 Authentication

Server side, `server/utils/auth.ts` builds the Better Auth instance and exposes two helpers:

```typescript
export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event) // throws 401 when signed out
  return { id: currentUser.id }
})
```

- `getAuthSession(event)` — returns the session or `null`
- `requireAuth(event)` — returns the user or throws a 401

Client side, `useAuth()` wraps the Better Auth Vue client:

```typescript
const { user, session, loggedIn, signIn, signUp, signOut, requestPasswordReset, resetPassword } = useAuth()
```

A global middleware (`app/middleware/auth.global.ts`) protects every page by default. Opt out or restrict a page with `definePageMeta`:

```typescript
definePageMeta({ auth: false })             // public page
definePageMeta({ auth: { only: 'guest' } }) // only for signed-out visitors
```

Pages included: `/sign-in`, `/sign-up`, `/forgot-password` and `/reset-password`. The reset flow is wired end to end — `/forgot-password` calls `requestPasswordReset`, Better Auth emails the link through Resend, and the link lands on `/reset-password` with a one-time token.

In development only, the Better Auth OpenAPI reference is served at `/api/auth/reference`.

> **Social login:** `AuthSocialButtons.vue` ships with Google and GitHub buttons, shared by the sign-in and sign-up pages, but no provider is configured on the server yet. Add a `socialProviders` block to `createBetterAuth()` in `server/utils/auth.ts` before using them.

## 📄 API Pagination

`server/utils/pagination.ts` and `server/utils/query.ts` provide helpers for paginated endpoints. Everything under `server/utils/` is auto-imported.

- Type-safe pagination on top of Drizzle query builders
- Standardized pagination metadata
- Page size validated and capped (`MAX_PAGE_SIZE`, default 100)

### Example

```typescript
// server/api/users.get.ts
import { user } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  // validates ?page= and ?pageSize=, applies defaults, rejects out-of-range values
  const { page, pageSize } = await getPaginationQuery(event)

  const qb = withPagination(useDB().select().from(user).$dynamic(), page, pageSize)
  const [data, total] = await queryWithCount(qb)

  return createPaginatedResponse(data, page, pageSize, total)
})
```

### Response Format

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Use `getValidatedQueryWithPagination(event, schema)` to merge pagination into your own Zod schema, and `getSortQuery(event)` for `?sortBy=&sortOrder=`.

## 🚢 Deploying

```bash
pnpm build
node .output/server/index.mjs
```

Behind a reverse proxy, tell Better Auth which header carries the real client IP, otherwise rate limiting falls back to a single shared bucket for everyone:

```typescript
advanced: {
  ipAddress: { ipAddressHeaders: ['x-forwarded-for'] }
}
```

## 🌟 Support

If you find this project helpful, please consider:
- Giving it a star ⭐

## 🙏 Credits
This project is built upon these amazing open source projects:
- [Nuxt](https://nuxt.com) - The Progressive Web Framework
- [Nuxt UI](https://ui.nuxt.com) - Fully styled and customizable components
- [Resend](https://resend.com/docs/dashboard/emails/introduction) - The email API for developers.
- [Better Auth](https://github.com/better-auth/better-auth) - The most comprehensive authentication framework for TypeScript
- [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm) - TypeScript ORM
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [NuxSaas](https://github.com/NuxSaaS/NuxSaaS/tree/main): For the inspiration

## 📜 License
This project is licensed under the [MIT License](LICENSE).
