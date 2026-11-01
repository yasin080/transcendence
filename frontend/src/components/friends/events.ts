import { echo } from '../../lib/echo'

// Global "friendships changed" signal. Friend actions fire it;
// the friends panel and the profile listen to it to reload.
const FRIENDS_CHANGED = 'friends:changed'

export function notifyFriendsChanged() {
  window.dispatchEvent(new Event(FRIENDS_CHANGED))
}

// Returns the unsubscribe function (for useEffect cleanup)
export function onFriendsChanged(listener: () => void): () => void {
  window.addEventListener(FRIENDS_CHANGED, listener)
  return () => window.removeEventListener(FRIENDS_CHANGED, listener)
}

// Listens to backend events on the user's private channel:
// when another user changes a friendship, fire the same local signal.
// Returns the unsubscribe function (for useEffect cleanup)
export function listenFriendsChanged(userId: number): () => void {
  const channel = `App.Models.User.${userId}`
  echo.private(channel).listen('.friends.changed', notifyFriendsChanged)
  return () => echo.leave(channel)
}