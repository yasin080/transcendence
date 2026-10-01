import { useState } from 'react'
import { Link, Outlet } from 'react-router'

import AuthModal from './components/AuthModal'
import UserMenu from './components/UserMenu'
import { useAuth } from './auth/useAuth'

export default function App() {
  const { user, status } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e14] text-slate-100 relative overflow-hidden">
      {/* Ambient arena glow — replaces the flat stretched texture. A radial
          spotlight plus a thin strip of the lava-tile ground at the very
          bottom gives the page depth instead of a busy repeating pattern
          behind every line of text. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(239,68,68,0.16), transparent 70%), radial-gradient(50% 40% at 85% 15%, rgba(59,130,246,0.12), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]"
        style={{
          backgroundImage: "url('/assets/tile-bg.png')",
          backgroundSize: '340px',
        }}
      />

      <div className="relative flex min-h-screen flex-col">
        <header className="border-b border-white/5 backdrop-blur-sm">
          <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-black tracking-tight"
            >
              <span className="text-2xl">💣</span>
              <span>
                TRANSCEND<span className="text-red-500">ENCE</span>
              </span>
            </Link>

            {/* Nothing is rendered while the session is still unknown, so the
                header does not flip from button to badge on every load. */}
            {status === 'authenticated' && user ? (
              <UserMenu user={user} />
            ) : status === 'guest' ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Log in
              </button>
            ) : null}
          </nav>
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
          <Outlet />
        </main>

        {/* The subject requires these two pages to be reachable from the app. */}
        <footer className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-6 flex gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-slate-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-200">
              Terms of Service
            </Link>
          </div>
        </footer>

        {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
      </div>
    </div>
  )
}
