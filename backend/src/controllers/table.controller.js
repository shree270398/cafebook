import * as cafeService from '../services/cafe.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertUuid } from '../utils/assertUuid.js'

export const listTables = asyncHandler(async (req, res) => {
  const cafeId = req.query.cafeId ? assertUuid(req.query.cafeId, 'cafe id') : null
  const tables = await cafeService.getTables(cafeId)
  res.json({ tables })
})
