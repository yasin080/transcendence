import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import FriendsPanel from '../components/friends/FriendsPanel'
import MainLayoutSidebar from '../components/left-sidebar/MainLayoutSidebar'
import { XIcon } from '../components/friends/icons'
import Button from '../components/ui/Button'

/**
 * Marco 2 — chasis de 3 columnas del mainlayout.
 *
 * Las tres secciones viven AQUÍ, no dentro de las páginas: así no se
 * desmontan al navegar y el panel de amigos conserva su estado (y, más
 * adelante, su suscripción a Reverb).
 */
export default function MainLayout() {
  const { pathname } = useLocation()
  // Por debajo de xl los amigos no caben como columna: se abren en un cajón
  const [friendsOpen, setFriendsOpen] = useState(false)

  useEffect(() => {
    setFriendsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!friendsOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFriendsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [friendsOpen])

  return (
    <div className="flex h-screen bg-void text-white">
      <aside className="w-19 flex-none border-r border-white/8 bg-surface-1 xl:w-67">
        <MainLayoutSidebar onOpenFriends={() => setFriendsOpen(true)} />
      </aside>

      <div className="flex flex-1 min-w-0 min-h-0">
        {/* La página de turno (Lobby, sala de espera...). La sala de espera
            no es un modal: sustituye al Lobby en este hueco. */}
        <Outlet />
      </div>

      {friendsOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-void/70 backdrop-blur-sm xl:hidden"
          onClick={() => setFriendsOpen(false)}
        />
      )}

      <aside
        className={`${friendsOpen ? 'fixed inset-y-0 right-0 z-40 w-90' : 'hidden'} flex-none border-l border-white/8 bg-surface-1 xl:static xl:block xl:w-85`}
      >
        <Button
          variant="ghost"
          size="iconLg"
          aria-label="Close friends"
          title="Close"
          className="absolute top-3 right-3 xl:hidden"
          onClick={() => setFriendsOpen(false)}
        >
          <XIcon />
        </Button>
        <FriendsPanel />
      </aside>
    </div>
  )
}
