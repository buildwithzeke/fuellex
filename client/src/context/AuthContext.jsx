import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth'
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearToken,
} from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [token, setTokenState] = useState(getToken)
  const [loading, setLoading] = useState(Boolean(getToken()))

  // Restore the profile when a token exists on first load.
  useEffect(() => {
    const storedToken = getToken()
    if (!storedToken) return
    let active = true
    authService
      .getProfile()
      .then((profile) => {
        if (!active) return
        setUser(profile)
        setStoredUser(profile)
      })
      .catch(() => {
        if (!active) return
        clearToken()
        setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const { token: nextToken, user: nextUser } = await authService.login(email, password)
    setToken(nextToken)
    setStoredUser(nextUser)
    setTokenState(nextToken)
    setUser(nextUser)
    return nextUser
  }

  const register = async (name, email, password) => {
    // The public register endpoint doesn't issue a token — sign in right after.
    await authService.register(name, email, password)
    const { token: nextToken, user: nextUser } = await authService.login(email, password)
    setToken(nextToken)
    setStoredUser(nextUser)
    setTokenState(nextToken)
    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === 'ADMIN',
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
