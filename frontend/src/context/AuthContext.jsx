import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService.js'
import { clearSession, getSession, setSession } from '../services/api.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSessionState] = useState(() => getSession())
  const [loading, setLoading] = useState(() => Boolean(getSession()))

  const applySession = useCallback((nextSession) => {
    setSessionState(nextSession)
    setSession(nextSession)
  }, [])

  useEffect(() => {
    let active = true
    const stored = getSession()

    if (!stored) {
      setLoading(false)
      return undefined
    }

    ;(async () => {
      try {
        const data = await authService.me()
        if (active) {
          setUser(data.user)
          setSessionState(getSession())
        }
      } catch {
        if (active) {
          setUser(null)
          setSessionState(null)
          clearSession()
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      setSessionState(null)
      setLoading(false)
    }
    const handleSession = (event) => setSessionState(event.detail)

    window.addEventListener('cafebook:logout', handleLogout)
    window.addEventListener('cafebook:session', handleSession)
    return () => {
      window.removeEventListener('cafebook:logout', handleLogout)
      window.removeEventListener('cafebook:session', handleSession)
    }
  }, [])

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials)
      applySession(data.session)
      setUser(data.user)
      return data
    },
    [applySession],
  )

  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload)
      if (data.session) {
        applySession(data.session)
        setUser(data.user)
      }
      return data
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Local session is cleared even if the revoke call fails.
    }
    applySession(null)
    setUser(null)
  }, [applySession])

  const updateProfile = useCallback(async (payload) => {
    const data = await authService.updateProfile(payload)
    setUser(data.user)
    return data.user
  }, [])

  const refreshUser = useCallback(async () => {
    const data = await authService.me()
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, session, loading, login, register, logout, updateProfile, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
