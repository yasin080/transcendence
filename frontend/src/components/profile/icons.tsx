import type { SVGProps } from 'react'

const stroke: SVGProps<SVGSVGElement> = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

interface IconProps {
  className?: string
}

export function GamepadIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <rect x="2.5" y="7" width="19" height="11" rx="4.5" />
      <path d="M7 10.5v4M5 12.5h4" />
      <circle cx="15.5" cy="11.5" r=".9" fill="currentColor" />
      <circle cx="17.5" cy="13.8" r=".9" fill="currentColor" />
    </svg>
  )
}

export function TrophyIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8.5 20h7" />
    </svg>
  )
}

export function BombIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="10.5" cy="14" r="6.5" />
      <path d="M15 9.5l2-2M17 7.5c.5-1.8 2-2.6 3.5-2.2" />
      <path d="M20.5 2.5v1.2M22.3 4.3h-1.2" />
    </svg>
  )
}

export function PencilIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function CalendarIcon({ className = 'size-3.5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

export function UsersIcon({ className = 'size-3.5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  )
}