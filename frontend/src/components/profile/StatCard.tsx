import type { ReactNode } from 'react'
import { BombIcon, GamepadIcon, TrophyIcon } from './icons.tsx'

export type StatKind = 'played' | 'won' | 'bombs'

// Todo lo que cambia según el tipo de tarjeta, en un solo sitio.
// accent es una clase de color de texto: el icono, su caja y el brillo la heredan.
const KINDS: Record<StatKind, { label: string; accent: string; icon: ReactNode }> = {
  played: { label: 'Matches played', accent: 'text-fuse-300', icon: <GamepadIcon /> },
  won: { label: 'Matches won', accent: 'text-gold', icon: <TrophyIcon /> },
  bombs: { label: 'Bombs exploded', accent: 'text-fuse-600', icon: <BombIcon /> },
}

interface StatCardProps {
  kind: StatKind
  value: number
}

export default function StatCard({ kind, value }: StatCardProps) {
  const { label, accent, icon } = KINDS[kind]

  return (
    <div className="relative flex min-w-0 flex-col gap-6.5 overflow-hidden rounded-2xl border border-line bg-fill px-6 pt-6 pb-7">
      {/* Brillo decorativo. Literal: 14 % del color de acento, sin token (efecto puntual) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 -right-10 size-37.5 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,currentColor_14%,transparent),transparent_70%)] ${accent}`}
      />

      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 flex-none place-items-center rounded-xl border border-current/25 bg-current/10 ${accent}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-micro-label text-fg-secondary">{label}</span>
      </div>

      <div className="display-stat-lg">{value.toLocaleString('en-US')}</div>
    </div>
  )
}