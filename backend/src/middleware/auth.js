import { supabaseAdmin } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'
import { ensureProfile } from '../services/auth.service.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null

    if (!token) {
      throw ApiError.unauthorized()
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data?.user) {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.')
    }

    const profile = await ensureProfile(data.user)

    req.user = profile
    req.authUser = data.user
    req.token = token
    next()
  } catch (error) {
    next(error)
  }
}
