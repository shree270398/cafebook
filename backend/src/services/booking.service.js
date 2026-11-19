import { supabaseAdmin } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'
import {
  nowTimeInTimezone,
  todayInTimezone,
  toTimeString,
} from '../utils/time.js'
import { getCafeById, getTables } from './cafe.service.js'

const BOOKING_SELECT =
  '*, cafe_tables ( table_number, capacity ), cafes ( name, address )'

// SQLSTATE (CBxxx) -> HTTP answer. The database is the source of truth.
const ERROR_MAP = {
  CB001: [404, 'Cafe not found.'],
  CB002: [404, 'That table is no longer available.'],
  CB003: [400, 'That table is too small for your group.'],
  CB004: [400, 'The selected date has already passed.'],
  CB005: [400, 'That time has already passed today. Choose a later slot.'],
  CB006: [400, 'That time is outside our opening hours.'],
  CB007: [400, 'Choose one of the available 30-minute time slots.'],
  CB008: [409, 'You already have an active booking for this slot.'],
  CB009: [409, 'Someone just booked that table. Please pick another one.'],
  CB010: [404, 'Booking not found.'],
  CB011: [403, 'You can only cancel your own bookings.'],
  CB012: [409, 'This booking can no longer be cancelled.'],
  CB013: [409, 'This booking has already started and cannot be cancelled.'],
  CB014: [400, 'Bookings can be made up to 60 days in advance.'],
  CB015: [400, 'Please choose a valid number of guests.'],
}

function mapBookingError(error) {
  const code = error?.code
  if (code && ERROR_MAP[code]) {
    const [status, message] = ERROR_MAP[code]
    return new ApiError(status, message)
  }

  const message = String(error?.message || '')
  const matched = Object.entries(ERROR_MAP).find(([key]) => message.includes(key))
  if (matched) {
    return new ApiError(matched[1][0], matched[1][1])
  }

  if (code === '23P01') {
    return ApiError.conflict('Someone just booked that table. Please pick another one.')
  }
  if (code === '23505') {
    return ApiError.conflict('You already have an active booking for this slot.')
  }

  return new ApiError(500, 'Could not complete the booking. Please try again.')
}

export async function sweepExpiredBookings() {
  try {
    await supabaseAdmin.rpc('complete_past_bookings')
  } catch {
    // Housekeeping only — listing still works.
  }
}

async function hydrateBooking(id, { withCustomer = false } = {}) {
  const select = withCustomer
    ? `${BOOKING_SELECT}, profiles ( full_name, email, phone )`
    : BOOKING_SELECT

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(select)
    .eq('id', id)
    .single()

  if (error) throw new ApiError(500, 'Could not load the booking.')
  return data
}

export async function createBooking(userId, { cafeId, tableId, bookingDate, startTime, guests }) {
  const { data, error } = await supabaseAdmin.rpc('create_booking', {
    p_user_id: userId,
    p_cafe_id: cafeId,
    p_table_id: tableId,
    p_booking_date: bookingDate,
    p_start_time: toTimeString(startTime) || startTime,
    p_guests: guests,
  })

  if (error) throw mapBookingError(error)
  return hydrateBooking(data.id)
}

export async function listUserBookings(userId) {
  await sweepExpiredBookings()

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(200)

  if (error) throw new ApiError(500, 'Could not load your bookings.')
  return data || []
}

export async function getBookingForUser(id, user) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Could not load the booking.')
  if (!data) throw ApiError.notFound('Booking not found.')
  // Do not reveal that someone else's booking exists.
  if (data.user_id !== user.id && user.role !== 'admin') {
    throw ApiError.notFound('Booking not found.')
  }
  return data
}

export async function cancelBooking(id, userId) {
  const { error } = await supabaseAdmin.rpc('cancel_booking', {
    p_booking_id: id,
    p_user_id: userId,
  })

  if (error) throw mapBookingError(error)
  return hydrateBooking(id)
}

export async function getAvailability({ cafeId, date, time, guests }) {
  const cafe = await getCafeById(cafeId)
  const startTime = toTimeString(time)

  if (!startTime) throw ApiError.badRequest('Choose a valid time.')

  const slot = cafe.time_slots.find((item) => item.startTime === startTime)
  if (!slot) {
    throw ApiError.badRequest('Choose one of the available 30-minute time slots.')
  }

  const today = todayInTimezone(cafe.timezone)
  const now = nowTimeInTimezone(cafe.timezone)

  if (date < today) {
    throw ApiError.badRequest('The selected date has already passed.')
  }
  if (date === today && startTime <= now) {
    throw ApiError.badRequest('That time has already passed today. Choose a later slot.')
  }

  const [tables, bookedResult] = await Promise.all([
    getTables(cafeId),
    supabaseAdmin
      .from('bookings')
      .select('table_id')
      .eq('cafe_id', cafeId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])
      .lt('start_time', slot.endTime)
      .gt('end_time', startTime),
  ])

  if (bookedResult.error) throw new ApiError(500, 'Could not check availability.')

  const bookedTableIds = new Set((bookedResult.data || []).map((row) => row.table_id))

  return {
    date,
    startTime,
    endTime: slot.endTime,
    guests,
    tables: tables.map((table) => ({
      ...table,
      capacity_ok: table.capacity >= guests,
      is_available: !bookedTableIds.has(table.id) && table.capacity >= guests,
    })),
  }
}
