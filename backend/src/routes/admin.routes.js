import { Router } from 'express'
import * as controller from '../controllers/admin.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'
import { validate } from '../middleware/validate.js'
import {
  adminBookingsQuerySchema,
  createMenuItemSchema,
  createTableSchema,
  updateBookingStatusSchema,
  updateMenuItemSchema,
  updateTableSchema,
} from '../validators/admin.validator.js'

const router = Router()

// Every admin route is protected server-side, not just in the UI.
router.use(requireAuth, requireAdmin)

router.get('/stats', controller.stats)
router.get('/bookings', validate(adminBookingsQuerySchema, 'query'), controller.listBookings)
router.patch(
  '/bookings/:id/status',
  validate(updateBookingStatusSchema),
  controller.updateBookingStatus,
)
router.get('/customers', controller.listCustomers)

router.get('/tables', controller.listTables)
router.post('/tables', validate(createTableSchema), controller.createTable)
router.put('/tables/:id', validate(updateTableSchema), controller.updateTable)

router.get('/menu', controller.listMenu)
router.post('/menu', validate(createMenuItemSchema), controller.createMenuItem)
router.put('/menu/:id', validate(updateMenuItemSchema), controller.updateMenuItem)
router.delete('/menu/:id', controller.deleteMenuItem)

export default router
