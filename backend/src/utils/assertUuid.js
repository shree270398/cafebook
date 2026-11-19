import { ApiError } from '../utils/ApiError.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function assertUuid(value, label = 'id') {
  if (!UUID_PATTERN.test(value || '')) {
    throw ApiError.badRequest(`Invalid ${label}.`)
  }
  return value
}
