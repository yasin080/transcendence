import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../auth/useAuth'
import type { User } from '../lib/api'

function initial(user: User): string {
  return (user.name.trim()[0] ?? '?').toUpperCase()
}

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
        className="flex items-center gap-2 rounded-full border border-slate-800 py-1 pr-3 pl-1 text-sm transition hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-emerald-500 font-semibold text-slate-950"
        >
          {initial(user)}
        </span>
        <span className="max-w-32 truncate">{user.name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void navigate('/lobby/profile')
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
