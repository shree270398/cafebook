import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const requiredKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

export function checkEnv() {
  const missing = requiredKeys.filter((key) => {
    const value = process.env[key]
    return !value || value.includes('placeholder') || value.includes('your-')
  })

  if (missing.length > 0) {
    console.warn(
      `\n[config] Missing or placeholder Supabase credentials: ${missing.join(', ')}.\n` +
        '[config] The API will start, but database calls will fail until backend/.env is configured.\n',
    )
  }

  return missing.length === 0
}
