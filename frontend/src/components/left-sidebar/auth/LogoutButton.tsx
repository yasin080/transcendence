import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../../../auth/useAuth'
import Button from '../../ui/Button'
import { LogoutIcon } from '../../ui/icons'

type LogoutButtonProps = {
  compact?: boolean
}

/**
 * Log out of the session and return to the landing page.
 */
export default function LogoutButton({ compact = false }: LogoutButtonProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    // logout() clears the local state even if the request fails: no catch needed
    await logout()
    void navigate('/', { replace: true })
  }

  const label = pending ? 'Logging out…' : 'Log out'

  return (
    <Button
      variant="secondary"
      size={compact ? 'iconLg' : 'md'}
      onClick={() => void handleLogout()}
      disabled={pending}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      className={compact ? '' : 'w-full'}
    >
      {compact ? <LogoutIcon /> : label}
    </Button>
  )
}
