import { ApiError } from '../utils/ApiError.js'

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(ApiError.unauthorized())
  }

  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Administrator access is required.'))
  }

  next()
}
