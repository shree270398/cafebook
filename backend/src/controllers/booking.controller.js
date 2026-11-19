import * as bookingService from '../services/booking.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { assertUuid } from '../utils/assertUuid.js'

export const checkAvailability = asyncHandler(async (req, res) => {
  const availability = await bookingService.getAvailability(req.validatedQuery)
  res.json(availability)
})

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body)
  res.status(201).json({
    booking,
    message: 'Reservation created. Your table is being held until the cafe confirms it.',
  })
})

export const listBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listUserBookings(req.user.id)
  res.json({ bookings })
})

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingForUser(
    assertUuid(req.params.id, 'booking id'),
    req.user,
  )
  res.json({ booking })
})

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    assertUuid(req.params.id, 'booking id'),
    req.user.id,
  )
  res.json({ booking, message: 'Reservation cancelled. The table is available again.' })
})
