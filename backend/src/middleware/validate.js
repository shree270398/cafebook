import { ApiError } from '../utils/ApiError.js'

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      return next(
        ApiError.unprocessable('Please check the highlighted fields.', fieldErrors),
      )
    }

    if (source === 'query') {
      req.validatedQuery = result.data
    } else {
      req[source] = result.data
    }

    next()
  }
}
