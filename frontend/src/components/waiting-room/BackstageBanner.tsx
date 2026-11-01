import type { ReactNode } from 'react'

interface BackstageBannerProps {
  children: ReactNode
}

export default function BackstageBanner({ children }: BackstageBannerProps) {
  return (
    <div className="relative mt-6.5 -mx-4 h-[clamp(11.25rem,30vw,26rem)] overflow-hidden md:-mx-7">
      <div className="absolute inset-0">{children}</div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--color-void),color-mix(in_srgb,var(--color-void)_55%,transparent)_34%,color-mix(in_srgb,var(--color-void)_18%,transparent)_66%,var(--color-void)_100%)]"
      />

      <div className="pointer-events-none absolute bottom-8 left-4 max-w-105 md:left-7">
        <div className="text-eyebrow">Backstage</div>
        <div className="mt-2 display-stat-sm">Sit tight. The arena is still filling.</div>
      </div>
    </div>
  )
}