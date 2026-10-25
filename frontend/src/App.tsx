import { useState } from 'react'
import { Link, Outlet } from 'react-router'

import AuthModal from './components/AuthModal'
import LegalLinks from './components/LegalLinks'
import UserMenu from './components/UserMenu'
import Button from './components/ui/Button'
import { useAuth } from './auth/useAuth'

export default function App() {
  const { user, status } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-void text-white">
      <header className="border-b border-line">
        <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg uppercase">
            <span>
              Transcend<span className="text-fuse-600">ence</span>
            </span>
          </Link>
          {status === 'authenticated' && user ? (
            <UserMenu user={user} />
          ) : status === 'guest' ? (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Log in
            </Button>
          ) : null}
        </nav>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-2">
          <LegalLinks />
        </div>
      </footer>

      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
