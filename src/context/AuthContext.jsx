import { useEffect, useState, startTransition } from 'react'
import AuthContext from './auth-context'
import authService from '../services/authService'
import http from '../services/http'
import { getStoredAuth, clearStoredAuth, setStoredAuth } from '../utils/storage'

function normalizeRole(role) {
  return typeof role === 'string' ? role.toUpperCase() : ''
}

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.jwt ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.jwt ||
    null
  )
}

function buildSession(payload) {
  const token = extractToken(payload)
  const user = payload?.user || payload?.profile || payload?.data?.user || null
  const normalizedRole = normalizeRole(
    user?.role || payload?.role || payload?.authorities?.[0] || payload?.userRole,
  )

  return {
    token,
    user: user ? { ...user, role: normalizedRole } : null,
    role: normalizedRole,
  }
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth()
  const [auth, setAuth] = useState(() => storedAuth)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [pendingPasswordChange, setPendingPasswordChange] = useState(
    () => storedAuth?.pendingPasswordChange || null,
  )

  useEffect(() => {
    http.setToken(auth?.token || null)
    setBootstrapping(false)
  }, [auth?.token])

  async function refreshProfile() {
    if (!auth?.token) {
      return null
    }

    const profile = await authService.getProfile()
    const nextAuth = {
      ...auth,
      user: profile,
      role: normalizeRole(profile?.role),
    }

    startTransition(() => {
      setAuth(nextAuth)
      setStoredAuth({ ...nextAuth, pendingPasswordChange })
    })

    return profile
  }

  async function login(credentials) {
    setLoading(true)

    try {
      const response = await authService.login(credentials)
      const requiresPasswordChange = Boolean(response?.requiresPasswordChange)
      const responseToken = extractToken(response)

      if (requiresPasswordChange && !responseToken) {
        const pendingState = {
          userId: response?.userId,
          login: credentials?.email,
          email: credentials?.email,
          requiresPasswordChange: true,
          firstLogin: true,
        }

        setPendingPasswordChange(pendingState)
        clearStoredAuth()
        setStoredAuth({ token: null, user: null, role: '', pendingPasswordChange: pendingState })
        return { requiresPasswordChange: true, userId: response?.userId }
      }

      const session = buildSession(response)
      http.setToken(session.token)

      if (!session.user && session.token) {
        try {
          const profile = await authService.getProfile()
          session.user = profile
          session.role = normalizeRole(profile?.role)
        } catch {
          // Some backends already return the user in /login.
        }
      }

      setPendingPasswordChange(null)
      startTransition(() => {
        setAuth(session)
        setStoredAuth({ ...session, pendingPasswordChange: null })
      })

      if (requiresPasswordChange) {
        return {
          requiresPasswordChange: true,
          userId: response?.userId || session?.user?.id,
        }
      }

      return { requiresPasswordChange: false, user: session.user }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    http.setToken(null)
    setPendingPasswordChange(null)
    startTransition(() => {
      setAuth({ token: null, user: null, role: '' })
      clearStoredAuth()
    })
  }

  async function changePassword(payload) {
    let response

    if (pendingPasswordChange?.requiresPasswordChange) {
      const firstAccessPayload = {
        login: payload?.login || pendingPasswordChange?.login || pendingPasswordChange?.email,
        email: payload?.login || pendingPasswordChange?.login || pendingPasswordChange?.email,
        userId: pendingPasswordChange?.userId,
        password: payload?.newPassword,
        newPassword: payload?.newPassword,
      }

      console.log('Primeiro acesso - payload enviado:', firstAccessPayload)

      response = await authService.changeFirstAccessPassword(firstAccessPayload)
      console.log('Primeiro acesso - resposta da API de troca de senha:', response)

      const session = buildSession(response)

      if (!session.token) {
        throw new Error('Nao foi possivel concluir o primeiro acesso.')
      }

      http.setToken(session.token)

      if (!session.user) {
        try {
          const profile = await authService.getProfile()
          session.user = profile
          session.role = normalizeRole(profile?.role)
        } catch {
          // Some backends may only return the token at this stage.
        }
      }

      startTransition(() => {
        setAuth(session)
        setStoredAuth({ ...session, pendingPasswordChange: null })
      })
    } else {
      response = await authService.changePassword(payload)
    }

    if (pendingPasswordChange) {
      setPendingPasswordChange(null)
    }

    return response
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user,
        token: auth?.token,
        role: auth?.role,
        isAuthenticated: Boolean(auth?.token),
        loading,
        bootstrapping,
        pendingPasswordChange,
        login,
        logout,
        refreshProfile,
        changePassword,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
