/**
 * Creates (or repairs) the CafeBook administrator account.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Required in backend/.env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (optional)
 *
 * Run database/schema.sql first so the profiles table and trigger exist.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = (process.env.ADMIN_EMAIL || 'admin@cafebook.com').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || 'CafeBook@123'
const fullName = process.env.ADMIN_NAME || 'CafeBook Admin'

if (!url || !serviceRoleKey || url.includes('placeholder') || serviceRoleKey.includes('placeholder')) {
  console.error(
    '\n[seed:admin] Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env first.\n',
  )
  process.exit(1)
}

if (password.length < 8) {
  console.error('\n[seed:admin] ADMIN_PASSWORD must be at least 8 characters.\n')
  process.exit(1)
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
})

async function findUserByEmail(targetEmail) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find(
      (user) => user.email?.toLowerCase() === targetEmail.toLowerCase(),
    )
    if (found) return found
    if (data.users.length < 200) return null
  }
  return null
}

async function main() {
  let user = await findUserByEmail(email)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw error
    user = data.user
    console.log(`[seed:admin] Created auth user ${email}.`)
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata || {}), full_name: fullName },
    })
    if (error) throw error
    console.log(`[seed:admin] Updated existing auth user ${email}.`)
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
      email,
      role: 'admin',
    },
    { onConflict: 'id' },
  )

  if (profileError) {
    throw new Error(
      `${profileError.message}\nDid you run database/schema.sql in the Supabase SQL Editor?`,
    )
  }

  console.log('\nAdministrator ready.')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
  console.log('  Role:     admin\n')
}

main().catch((error) => {
  console.error('\n[seed:admin] Failed:', error.message, '\n')
  process.exit(1)
})
