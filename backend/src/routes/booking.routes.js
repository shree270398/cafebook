import { Router } from 'express'
import * as controller from '../controllers/booking.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createBookingSchema } from '../validators/auth.validator.js'

const router = Router()

router.use(requireAuth)

router.post('/', validate(createBookingSchema), controller.createBooking)
router.get('/', controller.listBookings)
router.get('/:id', controller.getBooking)
router.patch('/:id/cancel', controller.cancelBooking)

export default router
