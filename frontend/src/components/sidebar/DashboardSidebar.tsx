import { Link } from 'react-router'

import LogoutButton from './auth/LogoutButton'
import SidebarNav from './nav/SidebarNav'
import Sidebar from './ui/Sidebar'

/**
 * Sidebar izquierdo del dashboard: compone las piezas dentro de la carcasa genérica.
 */
export default function DashboardSidebar() {
  return (
    <Sidebar
      // PLACEHOLDER: avatar con enlace al perfil (UserCard)
      header={<p className="p-6">ESTE ES EL HEADER DEL SIDEBAR. IRÁ FOTO AVATAR DE USUARIO</p>}
      footer={
        <>
          <LogoutButton />
          {/* El subject exige que estas páginas sean accesibles desde la app */}
          <div className="mt-3 flex gap-3 text-xs text-fg-faint">
            <Link to="/privacy" className="hover:text-fg-secondary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-fg-secondary">Terms of Service</Link>
          </div>
        </>
      }
    >
      <SidebarNav />
    </Sidebar>
  )
}
