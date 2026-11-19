import api from './api'

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function me() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function refresh(refreshToken) {
  const { data } = await api.post('/auth/refresh', { refreshToken })
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/auth/profile', payload)
  return data
}
