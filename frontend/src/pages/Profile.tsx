import { Navigate } from 'react-router'

import { useAuth } from '../auth/useAuth'

const joined = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

export default function Profile() {
  const { user, status } = useAuth()

  if (status === 'loading') {
    return <p className="text-slate-400">Loading…</p>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-full bg-emerald-500 text-2xl font-semibold text-slate-950"
        >
          {(user.name.trim()[0] ?? '?').toUpperCase()}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-800 divide-y divide-slate-800">
        <h2 className="px-5 py-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Account
        </h2>
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Member since" value={joined.format(new Date(user.created_at))} />
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-400">{value}</span>
    </div>
  )
}
