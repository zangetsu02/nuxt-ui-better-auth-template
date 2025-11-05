import { z } from 'zod'
import type { H3Event } from 'h3'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './pagination'

/**
 * Base pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
})

/**
 * Base sorting query schema
 */
export const sortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

/**
 * Parse and validate pagination parameters from query string
 * @param event - H3 event object
 * @returns Validated pagination parameters
 */
export async function getPaginationQuery(event: H3Event) {
  return await getValidatedQuery(event, paginationQuerySchema.parse)
}

/**
 * Parse and validate sorting parameters from query string
 * @param event - H3 event object
 * @returns Validated sorting parameters
 */
export async function getSortQuery(event: H3Event) {
  return await getValidatedQuery(event, sortQuerySchema.parse)
}

/**
 * Parse and validate custom query with pagination
 * @param event - H3 event object
 * @param schema - Zod schema for custom query parameters
 * @returns Validated query parameters with pagination
 */
export async function getValidatedQueryWithPagination<T extends z.ZodObject<z.ZodRawShape>>(
  event: H3Event,
  schema: T
) {
  const combinedSchema = schema.extend(paginationQuerySchema)
  return await getValidatedQuery(event, combinedSchema.parse)
}

/**
 * Parse and validate custom query with pagination and sorting
 * @param event - H3 event object
 * @param schema - Zod schema for custom query parameters
 * @returns Validated query parameters with pagination and sorting
 */
export async function getValidatedQueryWithPaginationAndSort<T extends z.ZodObject<z.ZodRawShape>>(
  event: H3Event,
  schema: T
) {
  const combinedSchema = schema.extend(paginationQuerySchema).extend(sortQuerySchema)
  return await getValidatedQuery(event, combinedSchema.parse)
}
