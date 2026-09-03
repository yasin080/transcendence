import { Link, Outlet } from 'react-router'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <nav className="mx-auto max-w-4xl px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Transcendence
          </Link>
        </nav>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        <Outlet />
      </main>

      {/* The subject requires these two pages to be reachable from the app. */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-6 py-6 flex gap-6 text-sm text-slate-400">
          <Link to="/privacy" className="hover:text-slate-100">
            Política de privacidad
          </Link>
          <Link to="/terms" className="hover:text-slate-100">
            Términos de servicio
          </Link>
        </div>
      </footer>
    </div>
  )
}
