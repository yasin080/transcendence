import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  // Sin onClose el modal es bloqueante (solo se sale con su propio botón)
  onClose?: () => void
  size?: 'sm' | 'lg'
}

const SIZES = {
  sm: 'max-w-109',
  lg: 'max-w-2xl',
}

export default function Modal({ children, onClose, size = 'sm' }: ModalProps) {
  // Cerrar con Esc
  useEffect(() => {
    if (!onClose) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-void/72 p-4 backdrop-blur-sm"
      // Cerrar al pulsar el fondo, pero no al pulsar dentro de la tarjeta
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`w-full ${SIZES[size]} rounded-[18px] border border-white/10 bg-surface-2 px-8 pt-7.5 pb-7 font-body text-white`}>
        {children}
      </div>
    </div>
  )
}
