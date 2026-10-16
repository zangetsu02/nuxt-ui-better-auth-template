import type { PgSelect } from 'drizzle-orm/pg-core'
import { count } from 'drizzle-orm'

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Apply pagination to a Drizzle query builder
 * @param qb - The query builder
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Query builder with limit and offset applied
 */
export function withPagination<T extends PgSelect>(
  qb: T,
  page: number,
  pageSize: number
): T {
  return qb.limit(pageSize).offset((page - 1) * pageSize) as T
}

/**
 * Execute a query, then count how many rows it would return without pagination.
 *
 * `$dynamic()` hands back the same builder rather than a copy, so this rewrites
 * the query that was just run — `qb` must not be reused afterwards. Limit and
 * offset have to be cleared too: left in place, the count query selects zero
 * rows on every page after the first.
 *
 * @param qb - The query builder to execute
 * @returns Tuple of [results, total count]
 */
export async function queryWithCount<T extends PgSelect>(
  qb: T
): Promise<[Awaited<T>, number]> {
  const result = await qb

  const countQb = qb.$dynamic()
  // @ts-expect-error - Accessing internal Drizzle config
  countQb.config.fields = { count: count() }
  // @ts-expect-error - Accessing internal Drizzle config
  countQb.config.orderBy = []
  // @ts-expect-error - Accessing internal Drizzle config
  countQb.config.limit = undefined
  // @ts-expect-error - Accessing internal Drizzle config
  countQb.config.offset = undefined

  const [totalResult] = await countQb
  return [result, Number(totalResult?.count ?? 0)]
}

/**
 * Create pagination metadata
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}

/**
 * Create a paginated response
 * @param data - Array of data items
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param total - Total number of items
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(page, pageSize, total)
  }
}
