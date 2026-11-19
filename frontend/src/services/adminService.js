import api from './api'

export async function getStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function getBookings(params = {}) {
  const { data } = await api.get('/admin/bookings', { params })
  return data.bookings
}

export async function updateBookingStatus(id, status) {
  const { data } = await api.patch(`/admin/bookings/${id}/status`, { status })
  return data
}

export async function getCustomers() {
  const { data } = await api.get('/admin/customers')
  return data.customers
}

export async function getTables(cafeId) {
  const { data } = await api.get('/admin/tables', {
    params: cafeId ? { cafeId } : {},
  })
  return data
}

export async function createTable(payload) {
  const { data } = await api.post('/admin/tables', payload)
  return data
}

export async function updateTable(id, payload) {
  const { data } = await api.put(`/admin/tables/${id}`, payload)
  return data
}

export async function getMenu(cafeId) {
  const { data } = await api.get('/admin/menu', {
    params: cafeId ? { cafeId } : {},
  })
  return data
}

export async function createMenuItem(payload) {
  const { data } = await api.post('/admin/menu', payload)
  return data
}

export async function updateMenuItem(id, payload) {
  const { data } = await api.put(`/admin/menu/${id}`, payload)
  return data
}

export async function deleteMenuItem(id) {
  await api.delete(`/admin/menu/${id}`)
}
