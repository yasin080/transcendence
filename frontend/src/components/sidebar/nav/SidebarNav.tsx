import { NavLink } from 'react-router'

type NavItem = {
  to: string
  label: string
  /** Activo solo con coincidencia exacta (necesario en rutas padre como /dashboard) */
  end?: boolean
}

// Para añadir una sección: una línea aquí y su ruta en main.tsx
const items: NavItem[] = [
  { to: '/dashboard', label: 'Lobby', end: true },
  { to: '/dashboard/leaderboard', label: 'Leaderboard' },
  { to: '/dashboard/profile', label: 'Profile' },
  { to: '/dashboard/custom-match', label: 'Custom Match' },

]

// [RETOMAR] TEMPORAL: accesos a pantallas de flujo que aún no se alcanzan desde el Lobby.
// Solo se muestran en desarrollo; quitar cada uno cuando el Lobby lo enlace.
const devItems: NavItem[] = [
  { to: '/dashboard/waiting-room/demo', label: 'Waiting room' },
  { to: '/dashboard/waiting-room/demo?role=guest', label: 'Waiting room (guest)' },
  { to: '/dashboard/waiting-room/demo?preview=countdown', label: 'Modal: countdown' },
  { to: '/dashboard/waiting-room/demo?preview=closed', label: 'Modal: room closed' },
  { to: '/dashboard/waiting-room/demo?preview=kicked', label: 'Modal: kicked' },
  { to: '/game/demo', label: 'Game' },
]

export default function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <SidebarNavLink key={item.to} {...item} />
      ))}

      {import.meta.env.DEV && (
        <>
          <p className="mt-6 mb-1 px-4 text-micro-label text-fg-faint">Dev</p>
          {devItems.map((item) => (
            <SidebarNavLink key={item.to} {...item} />
          ))}
        </>
      )}
    </nav>
  )
}

function SidebarNavLink({ to, label, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${
          isActive
            ? 'bg-fuse-600/16 text-white'
            : 'text-fg-secondary hover:bg-fill-strong hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
