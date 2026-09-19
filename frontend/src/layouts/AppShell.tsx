import { Outlet } from 'react-router'

/**
 * Marco PROVISIONAL: columna izquierda | centro | columna derecha.
 * Las laterales las hará otra persona. El centro cambia según la ruta.
 */
export default function AppShell() {
  return (
    <div className="grid h-screen min-w-[1180px] grid-cols-[268px_minmax(560px,1fr)_340px] bg-[#07061a] text-white">
      <aside className="border-r border-white/15 bg-[#120e2c] p-4 text-xs text-slate-400">
        Columna izquierda (268px)
      </aside>

      <main className="min-h-0 min-w-0">
        <Outlet />
      </main>

      <aside className="border-l border-white/15 bg-[#120e2c] p-4 text-xs text-slate-400">
        Columna derecha (340px)
      </aside>
    </div>
  )
}