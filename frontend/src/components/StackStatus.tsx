import { useEffect, useState } from 'react'

import { echo } from '../lib/echo'

type Check = { ok: boolean; value: string }

type Health = {
  status: string
  checks: Record<string, Check>
  laravel: string
}

type Probe =
  | { state: 'loading' }
  | { state: 'ok'; health: Health }
  | { state: 'error'; message: string }

const LABELS: Record<string, string> = {
  database: 'Database (MariaDB)',
  redis: 'Redis',
  gameloop: 'Game loop',
  queue: 'Queue worker',
  backup: 'Last backup',
}

export default function StackStatus() {
  const [api, setApi] = useState<Probe>({ state: 'loading' })
  const [socket, setSocket] = useState('connecting')

  useEffect(() => {
    let cancelled = false

    const check = () =>
      fetch('/api/health')
        .then((res) => {
          // 503 still carries the report: it just says something is down.
          if (!res.ok && res.status !== 503) throw new Error(`HTTP ${res.status}`)
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

    check()
    const timer = setInterval(check, 5000)

    return () => {
      cancelled = true
      clearInterval(timer)
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
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Status</h1>

      <div className="divide-y divide-line rounded-xl border border-line-strong bg-fill text-sm">
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
        {Object.entries(LABELS).map(([key, label]) => {
          const check = api.state === 'ok' ? api.health.checks[key] : undefined
          return <StatusRow key={key} label={label} value={check?.value ?? '—'} ok={check?.ok ?? false} />
        })}
        <StatusRow label="WebSocket (Reverb)" value={socket} ok={socket === 'connected'} />
      </div>
    </section>
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
