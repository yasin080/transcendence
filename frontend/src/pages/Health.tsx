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

export default function Home() {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transcendence</h1>
        <p className="mt-2 text-slate-400">
          Bomberman jugado con un gusano. La infraestructura está en pie; el juego llega después.
        </p>
      </div>

      <section className="rounded-lg border border-slate-800 divide-y divide-slate-800">
        <h2 className="px-5 py-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Estado del stack
        </h2>

        <StatusRow
          label="API (Laravel)"
          value={
            api.state === 'loading'
              ? 'comprobando…'
              : api.state === 'error'
                ? `error: ${api.message}`
                : api.health.status
          }
          ok={api.state === 'ok' && api.health.status === 'ok'}
        />
        <StatusRow
          label="Base de datos (MariaDB)"
          value={api.state === 'ok' ? api.health.database : '—'}
          ok={api.state === 'ok' && api.health.database === 'ok'}
        />
        <StatusRow
          label="Redis"
          value={api.state === 'ok' ? api.health.redis : '—'}
          ok={api.state === 'ok' && api.health.redis === 'ok'}
        />
        <StatusRow label="WebSocket (Reverb)" value={socket} ok={socket === 'connected'} />
      </section>
    </div>
  )
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-slate-300">{label}</span>
      <span className={ok ? 'font-mono text-emerald-400' : 'font-mono text-amber-400'}>
        {value}
      </span>
    </div>
  )
}
