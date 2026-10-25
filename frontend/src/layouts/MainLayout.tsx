import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import FriendsPanel from '../components/friends/FriendsPanel'
import MainLayoutSidebar from '../components/left-sidebar/MainLayoutSidebar'
import { XIcon } from '../components/friends/icons'
import Button from '../components/ui/Button'
import TabBar from '../components/TabBar'


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
    <div className="flex h-dvh flex-col bg-void text-white md:flex-row">
      <aside className="group hidden w-19 flex-none overflow-hidden border-r border-white/8 bg-surface-1 transition-[width] duration-150 md:block xl:hover:w-67">
        <MainLayoutSidebar onOpenFriends={() => setFriendsOpen(true)} />
      </aside>

      <div className="flex flex-1 min-w-0 min-h-0">
        <Outlet />
      </div>

      {friendsOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 hidden bg-void/70 backdrop-blur-sm md:block xl:hidden"
          onClick={() => setFriendsOpen(false)}
        />
      )}

      <aside
        className={`${friendsOpen ? 'fixed inset-x-0 top-0 bottom-16 z-40 md:bottom-0 md:left-auto md:w-90 bg-void' : 'hidden'} flex-none border-l border-white/8 xl:static xl:block xl:w-85 xl:bg-surface-1`}
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

      <TabBar friendsOpen={friendsOpen} onFriendsOpenChange={setFriendsOpen} />
    </div>
  )
}
