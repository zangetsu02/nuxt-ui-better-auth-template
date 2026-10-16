import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'
import { getPgPool } from './drivers'
import { sharedResource } from './sharedResource'

export const useDB = sharedResource(() => drizzle({ client: getPgPool(), schema }))
