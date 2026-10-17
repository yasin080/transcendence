import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { apiPost } from './api'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

// Reverb sits behind the same nginx that serves the page, so it is reached on
// the page's own host, port and protocol — from localhost or from the LAN alike.
export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: window.location.hostname,
  wsPort: Number(window.location.port) || 443,
  wssPort: Number(window.location.port) || 443,
  forceTLS: window.location.protocol === 'https:',
  enabledTransports: ['ws', 'wss'],
  channelAuthorization: {
    customHandler: async (
      { socketId, channelName }: { socketId: string; channelName: string },
      callback: (error: Error | null, auth: { auth: string } | null) => void,
    ) => {
      const result = await apiPost<{ auth: string }>('/api/broadcasting/auth', {
        socket_id: socketId,
        channel_name: channelName,
      })
      if (result.ok) callback(null, result.data)
      else callback(new Error(result.failure.message), null)
    },
  },
})
