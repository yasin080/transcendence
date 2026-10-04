import { Navigate, Outlet } from 'react-router'

import { useAuth } from './useAuth'

/**
 * Route guard: renders the nested routes for authenticated users and sends
 * guests back to the landing. This is UX only — the API must still protect
 * its own endpoints with `auth:sanctum`.
 */
export default function RequireAuth() {
  const { status } = useAuth()

  // /api/user hasn't answered yet: redirecting now would bounce a logged-in
  // user to the landing on every reload.
  if (status === 'loading') return null

  if (status === 'guest') return <Navigate to="/" replace />

  return <Outlet />
}
