import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../../../auth/useAuth'
import Button from '../../ui/Button'

/**
 * Log out of the session and return to the landing page.
 */
export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    // logout() clears the local state even if the request fails: no catch needed
    await logout()
    void navigate('/', { replace: true })
  }

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={() => void handleLogout()}
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Logging out…' : 'Log out'}
    </Button>
  )
}
