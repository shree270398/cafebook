import api from './api'

export async function getAvailability(params) {
  const { data } = await api.get('/availability', { params })
  return data
}

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', payload)
  return data
}

export async function getMyBookings() {
  const { data } = await api.get('/bookings')
  return data.bookings
}

export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/cancel`)
  return data
}
