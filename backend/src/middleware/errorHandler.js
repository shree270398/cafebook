import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  let status = error.status || 500
  let message = error.message || 'Something went wrong.'
  let details = error.details

  if (error instanceof ZodError) {
    status = 422
    message = 'Please check the highlighted fields.'
    details = error.flatten().fieldErrors
  }

  if (error.type === 'entity.parse.failed') {
    status = 400
    message = 'The request body contains invalid JSON.'
  }

  if (
    status >= 500 &&
    /fetch failed|ENOTFOUND|getaddrinfo|placeholder|Invalid API key/i.test(
      `${error.message} ${error.cause?.message || ''}`,
    )
  ) {
    message =
      'Cannot reach Supabase. Check SUPABASE_URL and the API keys in backend/.env.'
  }

  if (status >= 500) {
    console.error('[error]', error)
  }

  res.status(status).json({
    message: status >= 500 && env.nodeEnv === 'production'
      ? 'Something went wrong on our side. Please try again.'
      : message,
    ...(details ? { errors: details } : {}),
  })
}

export { ApiError }
