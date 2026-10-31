import type { ReactNode } from 'react'

interface BackstageBannerProps {
  // La capa de fondo: una imagen ahora, un canvas más adelante.
  // Debe rellenar todo el marco (size-full).
  children: ReactNode
}

export default function BackstageBanner({ children }: BackstageBannerProps) {
  return (
    <div className="relative mt-6.5 -mx-4 -mb-8 h-70 min-h-45 overflow-hidden md:-mx-7">
      <div className="absolute inset-0">{children}</div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#07061a_0%,rgba(7,6,26,.55)_34%,rgba(7,6,26,.18)_66%,rgba(7,6,26,.5)_100%)]"
      />

      <div className="pointer-events-none absolute bottom-8 left-4 max-w-105 md:left-7">
        <div className="text-eyebrow">Backstage</div>
        <div className="mt-2 display-stat-sm">Sit tight. The arena is still filling.</div>
      </div>
    </div>
  )
}