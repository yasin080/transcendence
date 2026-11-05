import type { ButtonHTMLAttributes } from 'react'

interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  selected: boolean
}

// Selectable pill (modes, filters). From outside, className is only for placement.
export default function ToggleChip({ selected, className = '', ...rest }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`cursor-pointer rounded-full border px-4 py-2.25 text-meta tracking-wide ${
        selected
          ? 'border-fuse-600 bg-fuse-600 text-white'
          : 'border-line-strong bg-fill-strong text-fg-secondary hover:bg-white/12'
      } ${className}`}
      {...rest}
    />
  )
}
