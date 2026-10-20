import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

import { LobbyIcon, TrophyIcon, UserIcon, UsersIcon } from './left-sidebar/ui/Icons'

type TabBarProps = {
  friendsOpen: boolean
  onFriendsOpenChange: (open: boolean) => void
}

const TAB = 'flex flex-col items-center justify-center gap-1 text-2xs font-bold'

// Navegación en móvil: sustituye a las dos barras laterales por debajo de md
export default function TabBar({ friendsOpen, onFriendsOpenChange }: TabBarProps) {
  // Pulsar una pestaña cierra Amigos, aunque la URL no cambie (ya estás en esa página)
  const closeFriends = () => onFriendsOpenChange(false)

  return (
    <nav className="grid h-16 flex-none grid-cols-4 border-t border-white/8 bg-surface-1 md:hidden">
      <TabLink to="/lobby" label="Lobby" icon={<LobbyIcon />} friendsOpen={friendsOpen} onClick={closeFriends} />
      <TabLink to="/leaderboard" label="Leaderboard" icon={<TrophyIcon />} friendsOpen={friendsOpen} onClick={closeFriends} />
      <button
        type="button"
        aria-pressed={friendsOpen}
        onClick={() => onFriendsOpenChange(!friendsOpen)}
        className={`${TAB} cursor-pointer ${friendsOpen ? 'text-fuse-600' : 'text-fg-muted'}`}
      >
        <UsersIcon />
        Friends
      </button>
      <TabLink to="/profile" end label="Profile" icon={<UserIcon />} friendsOpen={friendsOpen} onClick={closeFriends} />
    </nav>
  )
}

type TabLinkProps = {
  to: string
  end?: boolean
  label: string
  icon: ReactNode
  friendsOpen: boolean
  onClick: () => void
}

function TabLink({ to, end, label, icon, friendsOpen, onClick }: TabLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      // Con Amigos abierto, la pestaña activa es Friends aunque la URL sea otra
      className={({ isActive }) => `${TAB} ${isActive && !friendsOpen ? 'text-fuse-600' : 'text-fg-muted'}`}
    >
      {icon}
      {label}
    </NavLink>
  )
}
