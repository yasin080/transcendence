import { Link } from 'react-router'

import LogoutButton from './auth/LogoutButton'
import SidebarNav from './nav/SidebarNav'
import Sidebar from '../ui/Sidebar'
import LegalLinks from '../LegalLinks'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../ui/Avatar'

/**
 * Sidebar izquierdo del lobby: compone las piezas dentro de la carcasa genérica.
 */
export default function DashboardSidebar() {
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
      <Avatar size={44} src={user?.avatar_url} />
      <span className="hidden min-w-0 truncate font-semibold xl:block">{user?.username}</span>
    </Link>
  )
}

