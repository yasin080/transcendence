import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'light'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base = 'cursor-pointer text-button-label disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary: 'bg-fuse-600 text-white enabled:hover:bg-fuse-650',
  secondary: 'border border-white/40 bg-white/30 text-white enabled:hover:bg-white/50',
  light: 'bg-white text-surface enabled:hover:bg-white/90',
}

const sizes: Record<Size, string> = {
  md: 'rounded-xl px-5 py-3.75',
  lg: 'rounded-2xl px-8 py-4.75',
}

// Por fuera, className solo para colocación (margen, ancho). Nunca colores ni padding.
export default function Button({
  variant = 'primary',
  size = 'lg',
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
}