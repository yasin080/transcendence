import { echo } from '../../lib/echo'

// Global advice: friendship changed, sent by friendship acts.
// FriendPanel and Profile listeninf to update.
const FRIENDS_CHANGED = 'friends:changed'

export function notifyFriendsChanged() {
  window.dispatchEvent(new Event(FRIENDS_CHANGED))
}

// Return the fuction that leave to listen (to clean of useEffect)
export function onFriendsChanged(listener: () => void): () => void {
  window.addEventListener(FRIENDS_CHANGED, listener)
  return () => window.removeEventListener(FRIENDS_CHANGED, listener)
}

// Listen the back advices in the private channel of the user:
// if other user change a friendship, it is send the same local advice.
// Return the fuction that leave to listen (to clean of useEffect)
export function listenFriendsChanged(userId: number): () => void {
  const channel = `App.Models.User.${userId}`
  echo.private(channel).listen('.friends.changed', notifyFriendsChanged)
  return () => echo.leave(channel)
}