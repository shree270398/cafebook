import { Router } from 'express'
import * as controller from '../controllers/cafe.controller.js'

const router = Router()

router.get('/', controller.getCafes)
router.get('/:id', controller.getCafe)
router.get('/:id/menu', controller.getCafeMenu)

export default router
