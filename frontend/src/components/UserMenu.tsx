import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../auth/useAuth'
import type { User } from '../lib/api'
import Avatar from './ui/Avatar'

export default function UserMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function onLogout() {
    setOpen(false)
    await logout()
    void navigate('/')
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-fill py-1 pr-3 pl-1 text-sm font-semibold transition-colors hover:bg-fill-strong"
      >
        <Avatar size={28} src={user.avatar} />
        <span className="max-w-32 truncate">{user.username}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-line-strong bg-surface py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void navigate('/profile')
            }}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-fg-secondary hover:bg-fill-strong hover:text-white"
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-fg-secondary hover:bg-fill-strong hover:text-white"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
