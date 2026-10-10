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