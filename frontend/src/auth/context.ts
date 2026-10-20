import { createContext } from 'react'

import type { ApiFailure, User } from '../lib/api'

export type AuthStatus = 'loading' | 'authenticated' | 'guest'

export type Credentials = {
  email: string
  password: string
  remember?: boolean
}

export type Registration = Credentials & {
  username: string
  password_confirmation: string
}

export type AuthValue = {
  user: User | null
  status: AuthStatus
  /** Resolves to null on success, or to the failure the SPA should render. */
  login: (credentials: Credentials) => Promise<ApiFailure | null>
  register: (registration: Registration) => Promise<ApiFailure | null>
  logout: () => Promise<void>
  /** Re-reads the signed-in user, e.g. after editing the profile. */
  refreshUser: () => Promise<void>
}

// Split from the provider on purpose: a module that exports both a component
// and a non-component breaks Vite's Fast Refresh.
export const AuthContext = createContext<AuthValue | null>(null)
