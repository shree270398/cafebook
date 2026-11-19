import { Router } from 'express'
import * as controller from '../controllers/table.controller.js'

const router = Router()

router.get('/', controller.listTables)

export default router
