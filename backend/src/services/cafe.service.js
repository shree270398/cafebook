import { supabaseAdmin } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'
import { buildTimeSlots } from '../utils/time.js'

const CAFE_FIELDS =
  'id, name, description, address, phone, email, opening_time, closing_time, timezone, facilities, image_url, is_active, created_at'

export async function getActiveCafes() {
  const { data, error } = await supabaseAdmin
    .from('cafes')
    .select(CAFE_FIELDS)
    .eq('is_active', true)
    .order('name')

  if (error) throw new ApiError(500, 'Could not load cafes.')
  return data || []
}

export async function getCafeById(id) {
  const { data, error } = await supabaseAdmin
    .from('cafes')
    .select(CAFE_FIELDS)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Could not load the cafe.')
  if (!data) throw ApiError.notFound('Cafe not found.')

  return {
    ...data,
    time_slots: buildTimeSlots(data.opening_time, data.closing_time),
  }
}

export async function getMenu(cafeId, { includeUnavailable = true } = {}) {
  let query = supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('cafe_id', cafeId)
    .order('category')
    .order('item_name')

  if (!includeUnavailable) {
    query = query.eq('is_available', true)
  }

  const { data, error } = await query
  if (error) throw new ApiError(500, 'Could not load the menu.')
  return data || []
}

export async function getTables(cafeId, { includeInactive = false } = {}) {
  let query = supabaseAdmin
    .from('cafe_tables')
    .select('*')
    .order('table_number')

  if (cafeId) query = query.eq('cafe_id', cafeId)
  if (!includeInactive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw new ApiError(500, 'Could not load tables.')
  return data || []
}
