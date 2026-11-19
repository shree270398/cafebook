import * as cafeService from '../services/cafe.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertUuid } from '../utils/assertUuid.js'

export const getCafes = asyncHandler(async (req, res) => {
  const cafes = await cafeService.getActiveCafes()
  res.json({ cafes })
})

export const getCafe = asyncHandler(async (req, res) => {
  const cafe = await cafeService.getCafeById(assertUuid(req.params.id, 'cafe id'))
  res.json({ cafe })
})

export const getCafeMenu = asyncHandler(async (req, res) => {
  const cafeId = assertUuid(req.params.id, 'cafe id')
  const items = await cafeService.getMenu(cafeId)
  res.json({ items })
})
