import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { apiGet, apiPost, type ApiFailure, type User } from '../lib/api'
import {
  AuthContext,
  type AuthStatus,
  type AuthValue,
  type Credentials,
  type Registration,
} from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Who am I? Asked once on boot. /api/user answers with a null user for
  // visitors, so this never produces an error in the console.
  useEffect(() => {
    let cancelled = false

    void apiGet<{ user: User | null }>('/api/user').then((result) => {
      if (cancelled) return

      const found = result.ok ? result.data.user : null

      setUser(found)
      setStatus(found ? 'authenticated' : 'guest')
    })

    return () => {
      cancelled = true
    }
  }, [])

  const authenticate = useCallback(
    async (path: string, payload: Credentials | Registration): Promise<ApiFailure | null> => {
      const result = await apiPost<User>(path, payload)

      if (!result.ok) return result.failure

      setUser(result.data)
      setStatus('authenticated')

      return null
    },
    [],
  )

  const login = useCallback(
    (credentials: Credentials) => authenticate('/api/login', credentials),
    [authenticate],
  )

  const register = useCallback(
    (registration: Registration) => authenticate('/api/register', registration),
    [authenticate],
  )

  const logout = useCallback(async () => {
    await apiPost('/api/logout')

    // Local state is cleared either way: a failed logout still means the user
    // asked to leave, and the next request will get a fresh session anyway.
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
