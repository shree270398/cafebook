import { Router } from 'express'
import authRoutes from './auth.routes.js'
import cafeRoutes from './cafe.routes.js'
import tableRoutes from './table.routes.js'
import availabilityRoutes from './availability.routes.js'
import bookingRoutes from './booking.routes.js'
import adminRoutes from './admin.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/cafes', cafeRoutes)
router.use('/tables', tableRoutes)
router.use('/availability', availabilityRoutes)
router.use('/bookings', bookingRoutes)
router.use('/admin', adminRoutes)

export default router
