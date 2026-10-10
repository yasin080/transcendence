import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'light' | 'arcade' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  pulse?: boolean
}

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40'

// La tipografía va en cada variante: arcade usa la fuente display.
const variants: Record<Variant, string> = {
  primary: 'text-button-label bg-fuse-600 text-white enabled:hover:bg-fuse-650',
  secondary: 'text-button-label border border-white/40 bg-white/30 text-white enabled:hover:bg-white/50',
  light: 'text-button-label bg-white text-surface enabled:hover:bg-white/90',
  arcade:
    'border-b-4 border-fuse-900 bg-linear-to-b from-fuse-500 via-fuse-600 via-55% to-fuse-700 font-display text-xl uppercase text-white enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5',
  ghost:
    'text-meta border border-line-strong bg-fill text-fg-secondary enabled:hover:bg-fill-strong enabled:hover:text-white',
  }

const sizes: Record<Size, string> = {
  sm: 'rounded-lg px-3.5 py-2',
  md: 'rounded-xl px-5 py-3.75',
  lg: 'rounded-2xl px-8 py-4.75',
  xl: 'rounded-2xl px-9.5 py-5',
}

// Por fuera, className solo para colocación (margen, ancho). Nunca colores ni padding.
export default function Button({
  variant = 'primary',
  size = 'lg',
  pulse = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${pulse ? 'glow-pulse' : ''} ${className}`}
      {...rest}
    />
  )
}
