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

export function BotIcon({ className = 'size-[17px] text-mint' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4" />
      <path d="M2 13v3" />
      <path d="M22 13v3" />
      <path d="M9.5 13v1.5" />
      <path d="M14.5 13v1.5" />
    </svg>
  )
}

export function CrownIcon({ className = 'size-4 flex-none text-gold' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M3 19h18" />
      <path d="M3 19l-1.2-11 6.2 4.6L12 4l4 8.6 6.2-4.6L21 19" />
    </svg>
  )
}

export function XIcon({ className = 'size-3 text-white/70' }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

// ANALIZE: está en uso?
export function BackIcon({ className = 'size-4 text-white/70' }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function LobbyIcon({ className = 'size-5 flex-none' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function TrophyIcon({ className = 'size-5 flex-none' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export function UserIcon({ className = 'size-5 flex-none' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

export function LogoutIcon({ className = 'size-5 flex-none' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function UsersIcon({ className = 'size-5 flex-none' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
