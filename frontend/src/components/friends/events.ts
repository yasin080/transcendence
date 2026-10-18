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