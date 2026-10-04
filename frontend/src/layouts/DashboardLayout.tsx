import { Outlet } from 'react-router'

import DashboardSidebar from '../components/sidebar/DashboardSidebar'

/**
 * Marco 2 — chasis de 3 columnas del dashboard.
 *
 * Las tres secciones viven AQUÍ, no dentro de las páginas: así no se
 * desmontan al navegar y el chat no pierde su suscripción a Reverb.
 *
 * PLACEHOLDER: medidas tomadas del diario (sección 5). El contenido de cada
 * sección está por construir.
 */
export default function DashboardLayout() {
  return (
    <div className="flex h-screen min-w-[1180px] bg-void text-white">
      <aside className="w-[268px] flex-none border-r border-white/8 bg-surface-1">
        <DashboardSidebar />
      </aside>

      <div className="flex flex-1 min-w-[560px] min-h-0">
        {/* La página de turno (Lobby, sala de espera...). La sala de espera
            no es un modal: sustituye al Lobby en este hueco. */}
        <Outlet />
      </div>

      <aside className="w-[340px] flex-none border-l border-white/8 bg-surface-1">
        {/* amigos + chat */}
      </aside>
    </div>
  )
}
