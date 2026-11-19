import { Router } from 'express'
import * as controller from '../controllers/booking.controller.js'
import { validate } from '../middleware/validate.js'
import { availabilityQuerySchema } from '../validators/auth.validator.js'

const router = Router()

router.get('/', validate(availabilityQuerySchema, 'query'), controller.checkAvailability)

export default router
