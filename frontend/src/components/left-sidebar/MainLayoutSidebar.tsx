import { Link } from 'react-router'

import LogoutButton from './auth/LogoutButton'
import SidebarNav from './nav/SidebarNav'
import Sidebar from '../ui/Sidebar'
import LegalLinks from '../LegalLinks'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../ui/Avatar'
import { UsersIcon } from './ui/Icons'

type MainLayoutSidebarProps = {
  onOpenFriends: () => void
}

/**
 * Sidebar izquierdo del lobby: compone las piezas dentro de la carcasa genérica.
 */
export default function DashboardSidebar({ onOpenFriends }: MainLayoutSidebarProps) {
  return (
    <Sidebar
      header={<SidebarHeader />}
      footer={
        <>
          <div className="hidden xl:block">
            <LogoutButton />
          </div>
          <div className="flex justify-center xl:hidden">
            <LogoutButton compact />
          </div>
          <div className="mt-3 hidden xl:block">
            <LegalLinks/>
          </div>
        </>
      }
    >
      <SidebarNav />
      <div className="mt-1 px-3 xl:hidden">
        <button
          type="button"
          onClick={onOpenFriends}
          aria-label="Friends"
          title="Friends"
          className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-fg-secondary transition-colors hover:bg-fill-strong hover:text-white"
        >
          <UsersIcon />
        </button>
      </div>
    </Sidebar>
  )
}

function SidebarHeader() {
  const { user } = useAuth()

  return (
    <Link
      to="/profile"
      aria-label="Your profile"
      title="Your profile"
      className="flex items-center justify-center gap-3 px-4 py-6 xl:justify-start xl:px-6"
    >
      <Avatar size={44} src={user?.avatar} />
      <span className="hidden min-w-0 truncate font-semibold xl:block">{user?.username}</span>
    </Link>
  )
}

