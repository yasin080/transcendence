import { echo } from '../../lib/echo'

// Aviso global "las amistades han cambiado". Lo lanzan las acciones de amistad
// y lo escuchan el panel y el perfil para recargarse.
const FRIENDS_CHANGED = 'friends:changed'

export function notifyFriendsChanged() {
  window.dispatchEvent(new Event(FRIENDS_CHANGED))
}

// Devuelve la función que deja de escuchar (para la limpieza de useEffect)
export function onFriendsChanged(listener: () => void): () => void {
  window.addEventListener(FRIENDS_CHANGED, listener)
  return () => window.removeEventListener(FRIENDS_CHANGED, listener)
}

// Escucha los avisos del back en el canal privado del usuario:
// si otro usuario cambia una amistad, se lanza el mismo aviso local.
// Devuelve la función que deja de escuchar (para la limpieza de useEffect)
export function listenFriendsChanged(userId: number): () => void {
  const channel = `App.Models.User.${userId}`
  echo.private(channel).listen('.friends.changed', notifyFriendsChanged)
  return () => echo.leave(channel)
}