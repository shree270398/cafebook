import api from './api'

export async function getCafes() {
  const { data } = await api.get('/cafes')
  return data.cafes
}

export async function getCafe(id) {
  const { data } = await api.get(`/cafes/${id}`)
  return data.cafe
}

export async function getMenu(cafeId) {
  const { data } = await api.get(`/cafes/${cafeId}/menu`)
  return data.items
}
