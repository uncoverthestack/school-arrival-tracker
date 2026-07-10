import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db = null

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set.\n' +
      '  Supabase: Project Settings → Database → Connection string → URI\n' +
      '  AWS RDS / self-hosted: postgresql://user:pass@host:5432/dbname\n' +
      '  Add to .env.local for local dev, and to Vercel env vars for deployment.'
    )
  }
  const client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Required for PgBouncer (Supabase uses it by default on port 6543)
    prepare: false,
  })
  return drizzle(client, { schema })
}

// Lazy singleton — doesn't connect until first query
export const db = new Proxy({}, {
  get(_, prop) {
    if (!_db) _db = createDb()
    return _db[prop]
  }
})
