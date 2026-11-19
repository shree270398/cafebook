import { supabaseAdmin, supabaseAnon } from '../config/supabase.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export const PROFILE_FIELDS = 'id, full_name, email, phone, role, created_at'

export function normaliseSession(session) {
  if (!session) return null
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
  }
}

export async function getProfileById(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Could not load your profile.')
  return data
}

/** Create the profile row if the auth trigger did not run for some reason. */
export async function ensureProfile(authUser) {
  const existing = await getProfileById(authUser.id)
  if (existing) return existing

  const metadata = authUser.user_metadata || {}
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: authUser.id,
        full_name: metadata.full_name || (authUser.email || 'Guest').split('@')[0],
        email: authUser.email || `${authUser.id}@cafebook.local`,
        phone: metadata.phone || null,
        role: 'customer',
      },
      { onConflict: 'id' },
    )
    .select(PROFILE_FIELDS)
    .single()

  if (error) throw new ApiError(500, 'Could not set up your profile.')
  return data
}

export async function register({ fullName, email, password, phone }) {
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone: phone || null },
  })

  if (createError) {
    if (/already|registered|exists/i.test(createError.message)) {
      throw ApiError.conflict('An account with this email already exists.')
    }
    throw new ApiError(400, createError.message || 'Could not create the account.')
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: created.user.id,
        full_name: fullName,
        email,
        phone: phone || null,
        role: 'customer',
      },
      { onConflict: 'id' },
    )
    .select(PROFILE_FIELDS)
    .single()

  if (profileError) {
    throw new ApiError(500, 'Account created, but the profile could not be saved.')
  }

  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  })

  return {
    user: profile,
    session: loginError ? null : normaliseSession(loginData.session),
  }
}

export async function login({ email, password }) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })

  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw ApiError.unauthorized('Email or password is incorrect.')
    }
    if (/email not confirmed/i.test(error.message)) {
      throw new ApiError(403, 'Please confirm your email address before signing in.')
    }
    throw ApiError.unauthorized(error.message || 'Could not sign in.')
  }

  const profile = await ensureProfile(data.user)
  return { user: profile, session: normaliseSession(data.session) }
}

export async function refresh(refreshToken) {
  const { data, error } = await supabaseAnon.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error || !data.session) {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.')
  }

  const profile = data.user ? await ensureProfile(data.user) : null
  return { user: profile, session: normaliseSession(data.session) }
}

export async function updateProfile(userId, { fullName, phone }) {
  const patch = {}
  if (fullName !== undefined) patch.full_name = fullName
  if (phone !== undefined) patch.phone = phone || null

  if (Object.keys(patch).length === 0) {
    return getProfileById(userId)
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFILE_FIELDS)
    .single()

  if (error) throw new ApiError(500, 'Could not update your profile.')
  return data
}

/** Revoke the current Supabase session (best effort). */
export async function logout(accessToken) {
  if (!accessToken) return
  try {
    await fetch(`${env.supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  } catch {
    // The frontend clears its local session regardless.
  }
}
