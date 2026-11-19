import * as adminService from '../services/admin.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertUuid } from '../utils/assertUuid.js'

export const stats = asyncHandler(async (req, res) => {
  res.json(await adminService.getDashboardStats())
})

export const listBookings = asyncHandler(async (req, res) => {
  const bookings = await adminService.listAllBookings(req.validatedQuery)
  res.json({ bookings })
})

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await adminService.updateBookingStatus(
    assertUuid(req.params.id, 'booking id'),
    req.body.status,
  )
  res.json({ booking, message: `Booking marked as ${req.body.status}.` })
})

export const listCustomers = asyncHandler(async (req, res) => {
  const customers = await adminService.listCustomers()
  res.json({ customers })
})

export const listTables = asyncHandler(async (req, res) => {
  const cafeId = req.query.cafeId ? assertUuid(req.query.cafeId, 'cafe id') : undefined
  res.json(await adminService.listAdminTables(cafeId))
})

export const createTable = asyncHandler(async (req, res) => {
  const table = await adminService.createTable(req.body)
  res.status(201).json({ table, message: 'Table added.' })
})

export const updateTable = asyncHandler(async (req, res) => {
  const table = await adminService.updateTable(
    assertUuid(req.params.id, 'table id'),
    req.body,
  )
  res.json({ table, message: 'Table updated.' })
})

export const listMenu = asyncHandler(async (req, res) => {
  const cafeId = req.query.cafeId ? assertUuid(req.query.cafeId, 'cafe id') : undefined
  res.json(await adminService.listAdminMenu(cafeId))
})

export const createMenuItem = asyncHandler(async (req, res) => {
  const item = await adminService.createMenuItem(req.body)
  res.status(201).json({ item, message: 'Menu item added.' })
})

export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await adminService.updateMenuItem(
    assertUuid(req.params.id, 'menu item id'),
    req.body,
  )
  res.json({ item, message: 'Menu item updated.' })
})

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await adminService.deleteMenuItem(assertUuid(req.params.id, 'menu item id'))
  res.status(204).end()
})
