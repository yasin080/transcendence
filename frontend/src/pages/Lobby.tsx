import { Link } from 'react-router'

// PROVISIONAL: accesos directos a la sala de espera y sus modales mientras el
// lobby no tenga salas reales. Quitar cuando exista "open rooms".
const PREVIEWS = [
  { to: '/waiting-room/demo', label: 'Waiting room (owner)' },
  { to: '/waiting-room/demo?role=guest', label: 'Waiting room (guest)' },
  { to: '/waiting-room/demo?preview=countdown', label: 'Modal: countdown' },
  { to: '/waiting-room/demo?preview=closed', label: 'Modal: room closed' },
  { to: '/waiting-room/demo?preview=kicked', label: 'Modal: kicked' },
]

/**
 * Columna central del dashboard. Solo el <section>: las otras dos columnas
 * las pone DashboardLayout.
 *
 * PLACEHOLDER: pendiente cabecera + buscador, hero, open rooms, paginador y
 * creación de partida.
 */
export default function Lobby() {
  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-8">
      <h1 className="font-display text-3xl text-fuse-600">Lobby</h1>

      <nav className="mt-6 flex flex-wrap gap-4 text-sm">
        {PREVIEWS.map(({ to, label }) => (
          <Link key={to} to={to} className="text-fuse-400 underline">
            {label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
