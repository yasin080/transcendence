import { NavLink } from 'react-router'
import type { ReactNode } from 'react'

import { LobbyIcon, UserIcon } from '../../ui/icons'

type NavItem = {
  to: string
  label: string
  end?: boolean
  icon?: ReactNode
}

// To add a section: one line here and its route in main.tsx
const items: NavItem[] = [
  { to: '/lobby', label: 'Lobby', icon: <LobbyIcon /> },
  { to: '/profile', label: 'Profile', end:true, icon: <UserIcon /> },
]

export default function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <SidebarNavLink key={item.to} {...item} />
      ))}
    </nav>
  )
}

function SidebarNavLink({ to, label, end, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        `flex min-h-12 items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors xl:group-hover:justify-start ${
          isActive
            ? 'bg-fuse-600/16 text-white'
            : 'text-fg-secondary hover:bg-fill-strong hover:text-white'
        }`
      }
    >
      {icon}
      <span className="hidden xl:group-hover:inline">{label}</span>
    </NavLink>
  )
}
