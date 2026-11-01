import type { ReactNode } from 'react'

type Size = 'sm' | 'md' | 'lg'

interface SectionHeaderProps {
  title: string
  size?: Size
  count?: number
  highlight?: boolean
  children?: ReactNode
  className?: string
}

// Each size reproduces the title its screen already had
const SIZES: Record<Size, { gap: string; title: string }> = {
  sm: { gap: 'gap-2.5', title: 'text-micro-label text-fg-muted' }, // Friends panel
  md: { gap: 'gap-3.5', title: 'text-section-title' }, // Profile
  lg: { gap: 'gap-3.5', title: 'text-sm font-bold uppercase tracking-[.16em] text-fg-secondary' }, // Lobby
}

// Section title + divider line + count. className is for placement.
export default function SectionHeader({
  title,
  size = 'md',
  count,
  highlight = false,
  children,
  className = '',
}: SectionHeaderProps) {
  const { gap, title: titleClass } = SIZES[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <h2 className={`whitespace-nowrap ${highlight ? 'text-micro-label text-ember-450' : titleClass}`}>{title}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {count !== undefined &&
        (highlight ? (
          <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-fuse-600 px-1 text-2xs font-bold text-white">
            {count}
          </span>
        ) : (
          <span className="text-meta text-fg-muted">{count}</span>
        ))}
      {children}
    </div>
  )
}
