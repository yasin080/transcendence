import { Outlet } from 'react-router'
import FriendsPanel from '../components/friends/FriendsPanel'
import MainLayoutSidebar from '../components/left-sidebar/MainLayoutSidebar'

/**
 * Marco 2 — chasis de 3 columnas del mainlayout.
 *
 * Las tres secciones viven AQUÍ, no dentro de las páginas: así no se
 * desmontan al navegar y el panel de amigos conserva su estado (y, más
 * adelante, su suscripción a Reverb).
 */
export default function MainLayout() {
  return (
    <div className="flex h-screen bg-void text-white">
      <aside className="w-19 flex-none border-r border-white/8 bg-surface-1 xl:w-67">
        <MainLayoutSidebar />
      </aside>

      <div className="flex flex-1 min-w-0 min-h-0">
        {/* La página de turno (Lobby, sala de espera...). La sala de espera
            no es un modal: sustituye al Lobby en este hueco. */}
        <Outlet />
      </div>

      <aside className="w-85 flex-none border-l border-white/8 bg-surface-1">
        <FriendsPanel />
      </aside>
    </div>
  )
}
