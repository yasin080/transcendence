import type { SVGProps } from 'react'

// Iconos de amistad: los usa FriendButton de perfil ajeno y panel de amigos.

const stroke: SVGProps<SVGSVGElement> = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

interface IconProps {
  className?: string
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