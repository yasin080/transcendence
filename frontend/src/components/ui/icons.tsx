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

export function BotIcon({ className = 'size-4.25 text-mint' }: IconProps) {
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

export function PlusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ClockIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function CheckIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function UserMinusIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 19c.8-3.3 3.4-5 6.5-5s5.7 1.7 6.5 5M16 11h5" />
    </svg>
  )
}

export function XIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function SearchIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" {...stroke} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
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

// Google logo: uses the brand's official colors, not the theme tokens.
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.69A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.69V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.98l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}
