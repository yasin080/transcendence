import { NavLink } from 'react-router'

type NavItem = {
  to: string
  label: string
  end?: boolean
}

// Para añadir una sección: una línea aquí y su ruta en main.tsx
const items: NavItem[] = [
  { to: '/lobby', label: 'Lobby' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile', end:true },
]

// [RETOMAR] TEMPORAL: accesos a pantallas de flujo que aún no se alcanzan desde el Lobby.
// Solo se muestran en desarrollo; quitar cada uno cuando el Lobby lo enlace.
const devItems: NavItem[] = [
 
  { to: '/waiting-room/demo?role=guest', label: 'Waiting room (guest)' },
  { to: '/waiting-room/demo?preview=closed', label: 'Modal: room closed' },
  { to: '/waiting-room/demo?preview=kicked', label: 'Modal: kicked' },
  { to: '/profile', label: 'Profile (own)' },
  { to: '/profile/2', label: 'Profile: Boomer (friends)' },
  { to: '/profile/9', label: 'Profile: Bomba (received)' },
  { to: '/profile/11', label: 'Profile: BoltX (sent)' },
  { to: '/profile/13', label: 'Profile: BombJovi (none)' },
  { to: '/profile/99999', label: 'Profile: not found' },
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
