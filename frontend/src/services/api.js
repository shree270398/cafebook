import axios from 'axios'

const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  : '/api'
const STORAGE_KEY = 'cafebook.session'

export const getSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setSession = (session) => {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const clearSession = () => localStorage.removeItem(STORAGE_KEY)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    const status = error.response?.status
    const url = String(original.url || '')
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (status === 401 && !original._retry && !isAuthRequest) {
      original._retry = true
      const session = getSession()

      if (session?.refresh_token) {
        try {
          refreshPromise =
            refreshPromise ||
            api.post('/auth/refresh', { refreshToken: session.refresh_token })

          const { data } = await refreshPromise
          refreshPromise = null

          setSession(data.session)
          window.dispatchEvent(new CustomEvent('cafebook:session', { detail: data.session }))

          if (!original.headers) original.headers = {}
          original.headers.Authorization = `Bearer ${data.session.access_token}`
          return api(original)
        } catch (refreshError) {
          refreshPromise = null
          clearSession()
          window.dispatchEvent(new Event('cafebook:logout'))
          return Promise.reject(refreshError)
        }
      }

      clearSession()
      window.dispatchEvent(new Event('cafebook:logout'))
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message

  if (error?.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again in a moment.'
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Cannot reach the CafeBook server. Please check that the API is running and try again.'
  }

  return error?.message || fallback
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || null
}

export default api
