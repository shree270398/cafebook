import { supabaseAdmin } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'
import { PROFILE_FIELDS } from './auth.service.js'
import { getMenu, getTables } from './cafe.service.js'
import { sweepExpiredBookings } from './booking.service.js'
import { todayInTimezone } from '../utils/time.js'

const ADMIN_BOOKING_SELECT =
  '*, cafe_tables ( table_number, capacity ), cafes ( name ), profiles ( full_name, email, phone )'

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled', 'completed'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
}

function unwrap(result, message) {
  if (result.error) {
    console.error('[admin]', result.error)
    throw new ApiError(500, message)
  }
  return result
}

export async function resolveCafeId(cafeId) {
  if (cafeId) return cafeId

  const { data, error } = await supabaseAdmin
    .from('cafes')
    .select('id')
    .eq('is_active', true)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Could not load the cafe.')
  if (!data) throw ApiError.notFound('No active cafe found.')
  return data.id
}

async function hydrateAdminBooking(id) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(ADMIN_BOOKING_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new ApiError(500, 'Could not load the booking.')
  return data
}

export async function getDashboardStats() {
  await sweepExpiredBookings()

  const { data: cafe, error: cafeError } = await supabaseAdmin
    .from('cafes')
    .select('id, timezone')
    .eq('is_active', true)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  if (cafeError) throw new ApiError(500, 'Could not load the dashboard.')

  const timezone = cafe?.timezone || 'Asia/Kolkata'
  const today = todayInTimezone(timezone)

  const countBooking = (status) =>
    supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', status)

  const results = await Promise.all([
    countBooking('pending'),
    countBooking('confirmed'),
    countBooking('cancelled'),
    countBooking('completed'),
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),
    supabaseAdmin
      .from('cafe_tables')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabaseAdmin
      .from('bookings')
      .select(ADMIN_BOOKING_SELECT)
      .eq('booking_date', today)
      .order('start_time'),
    supabaseAdmin
      .from('bookings')
      .select(ADMIN_BOOKING_SELECT)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const failed = results.find((result) => result.error)
  if (failed) {
    console.error('[admin] stats', failed.error)
    throw new ApiError(500, 'Could not load the dashboard.')
  }

  const [pending, confirmed, cancelled, completed, customers, tables, todayBookings, recentBookings] =
    results

  const counts = {
    pending: pending.count || 0,
    confirmed: confirmed.count || 0,
    cancelled: cancelled.count || 0,
    completed: completed.count || 0,
    customers: customers.count || 0,
    tables: tables.count || 0,
  }

  return {
    stats: {
      ...counts,
      total: counts.pending + counts.confirmed + counts.cancelled + counts.completed,
    },
    today,
    todayBookings: todayBookings.data || [],
    recentBookings: recentBookings.data || [],
  }
}

export async function listAllBookings({ status, date } = {}) {
  await sweepExpiredBookings()

  let query = supabaseAdmin
    .from('bookings')
    .select(ADMIN_BOOKING_SELECT)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(300)

  if (status) query = query.eq('status', status)
  if (date) query = query.eq('booking_date', date)

  const { data, error } = await query
  if (error) throw new ApiError(500, 'Could not load bookings.')
  return data || []
}

export async function updateBookingStatus(id, status) {
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Could not load the booking.')
  if (!booking) throw ApiError.notFound('Booking not found.')

  if (booking.status === status) {
    return hydrateAdminBooking(id)
  }

  const allowed = ALLOWED_TRANSITIONS[booking.status] || []
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `A ${booking.status} booking cannot be marked as ${status}.`,
    )
  }

  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (updateError) throw new ApiError(500, 'Could not update the booking status.')
  return hydrateAdminBooking(id)
}

export async function listCustomers() {
  const [customersResult, bookingsResult] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('role', 'customer')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('bookings').select('user_id, status'),
  ])

  const customers = unwrap(customersResult, 'Could not load customers.').data || []
  const bookings = unwrap(bookingsResult, 'Could not load customer bookings.').data || []

  const counts = new Map()
  for (const booking of bookings) {
    const current = counts.get(booking.user_id) || { total: 0, active: 0 }
    current.total += 1
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      current.active += 1
    }
    counts.set(booking.user_id, current)
  }

  return customers.map((customer) => ({
    ...customer,
    booking_count: counts.get(customer.id)?.total || 0,
    active_booking_count: counts.get(customer.id)?.active || 0,
  }))
}

export async function listAdminTables(cafeId) {
  const resolvedCafeId = await resolveCafeId(cafeId)
  const tables = await getTables(resolvedCafeId, { includeInactive: true })
  return { cafeId: resolvedCafeId, tables }
}

export async function createTable(input) {
  const cafeId = await resolveCafeId(input.cafeId)

  const { data, error } = await supabaseAdmin
    .from('cafe_tables')
    .insert({
      cafe_id: cafeId,
      table_number: input.tableNumber,
      capacity: input.capacity,
      is_active: input.isActive ?? true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw ApiError.conflict('A table with that number already exists.')
    }
    throw new ApiError(500, 'Could not create the table.')
  }

  return data
}

export async function updateTable(id, input) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('cafe_tables')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (findError) throw new ApiError(500, 'Could not load the table.')
  if (!existing) throw ApiError.notFound('Table not found.')

  const patch = {}
  if (input.tableNumber !== undefined) patch.table_number = input.tableNumber
  if (input.capacity !== undefined) patch.capacity = input.capacity
  if (input.isActive !== undefined) patch.is_active = input.isActive

  const { data, error } = await supabaseAdmin
    .from('cafe_tables')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw ApiError.conflict('A table with that number already exists.')
    }
    throw new ApiError(500, 'Could not update the table.')
  }

  return data
}

export async function listAdminMenu(cafeId) {
  const resolvedCafeId = await resolveCafeId(cafeId)
  const items = await getMenu(resolvedCafeId, { includeUnavailable: true })
  return { cafeId: resolvedCafeId, items }
}

export async function createMenuItem(input) {
  const cafeId = await resolveCafeId(input.cafeId)

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert({
      cafe_id: cafeId,
      item_name: input.itemName,
      description: input.description || '',
      price: input.price,
      category: input.category,
      image_url: input.imageUrl || null,
      is_available: input.isAvailable ?? true,
    })
    .select()
    .single()

  if (error) throw new ApiError(500, 'Could not create the menu item.')
  return data
}

export async function updateMenuItem(id, input) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('menu_items')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (findError) throw new ApiError(500, 'Could not load the menu item.')
  if (!existing) throw ApiError.notFound('Menu item not found.')

  const patch = {}
  if (input.itemName !== undefined) patch.item_name = input.itemName
  if (input.description !== undefined) patch.description = input.description
  if (input.price !== undefined) patch.price = input.price
  if (input.category !== undefined) patch.category = input.category
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl || null
  if (input.isAvailable !== undefined) patch.is_available = input.isAvailable

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new ApiError(500, 'Could not update the menu item.')
  return data
}

export async function deleteMenuItem(id) {
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw new ApiError(500, 'Could not delete the menu item.')
  if (!data || data.length === 0) throw ApiError.notFound('Menu item not found.')
}
