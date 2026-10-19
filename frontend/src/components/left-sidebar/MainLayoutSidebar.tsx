import LogoutButton from './auth/LogoutButton'
import SidebarNav from './nav/SidebarNav'
import Sidebar from '../ui/Sidebar'
import LegalLinks from '../LegalLinks'

/**
 * Sidebar izquierdo del lobby: compone las piezas dentro de la carcasa genérica.
 */
export default function DashboardSidebar() {
  return (
    <Sidebar
      // PLACEHOLDER: avatar con enlace al perfil (UserCard)
      header={<p className="p-6">ESTE ES EL HEADER DEL SIDEBAR. IRÁ FOTO AVATAR DE USUARIO</p>}
      footer={
        <>
          <LogoutButton />
          <div className="mt-3">
            <LegalLinks/>
          </div>
        </>
      }
    >
      <SidebarNav />
    </Sidebar>
  )
}
