import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validate(registerSchema), controller.register)
router.post('/login', validate(loginSchema), controller.login)
router.post('/refresh', validate(refreshSchema), controller.refresh)
router.get('/me', requireAuth, controller.me)
router.patch('/profile', requireAuth, validate(updateProfileSchema), controller.updateProfile)
router.post('/logout', requireAuth, controller.logout)

export default router
