import { useEffect, useState } from 'react'

import { echo } from '../lib/echo'

type Health = {
  status: string
  database: string
  redis: string
  laravel: string
}

type Probe =
  | { state: 'loading' }
  | { state: 'ok'; health: Health }
  | { state: 'error'; message: string }

export default function StackStatus() {
  const [api, setApi] = useState<Probe>({ state: 'loading' })
  const [socket, setSocket] = useState('connecting')

  useEffect(() => {
    let cancelled = false

    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Health>
      })
      .then((health) => {
        if (!cancelled) setApi({ state: 'ok', health })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setApi({
            state: 'error',
            message: error instanceof Error ? error.message : 'unknown error',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const connection = echo.connector.pusher.connection
    const onChange = (states: { current: string }) => setSocket(states.current)

    connection.bind('state_change', onChange)
    setSocket(connection.state)

    return () => {
      connection.unbind('state_change', onChange)
    }
  }, [])

  return (
    <details className="group rounded-xl border border-line-strong bg-fill text-sm">
      <summary className="cursor-pointer select-none px-4 py-2 text-fg-muted hover:text-fg-secondary">
        Stack status
      </summary>

      <div className="divide-y divide-line border-t border-line">
        <StatusRow
          label="API (Laravel)"
          value={
            api.state === 'loading'
              ? 'checking…'
              : api.state === 'error'
                ? `error: ${api.message}`
                : api.health.status
          }
          ok={api.state === 'ok' && api.health.status === 'ok'}
        />
        <StatusRow
          label="Database (MariaDB)"
          value={api.state === 'ok' ? api.health.database : '—'}
          ok={api.state === 'ok' && api.health.database === 'ok'}
        />
        <StatusRow
          label="Redis"
          value={api.state === 'ok' ? api.health.redis : '—'}
          ok={api.state === 'ok' && api.health.redis === 'ok'}
        />
        <StatusRow label="WebSocket (Reverb)" value={socket} ok={socket === 'connected'} />
      </div>
    </details>
  )
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="text-fg-secondary">{label}</span>
      <span className={ok ? 'font-mono text-online' : 'font-mono text-ember-300'}>
        {value}
      </span>
    </div>
  )
}
