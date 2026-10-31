import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  // Sin onClose el modal es bloqueante (solo se sale con su propio botón)
  onClose?: () => void
  size?: 'sm' | 'lg'
  // id del título, para que los lectores de pantalla anuncien el modal
  labelledBy?: string
}

const SIZES = {
  sm: 'max-w-109',
  lg: 'max-w-2xl',
}

export default function Modal({ children, onClose, size = 'sm', labelledBy }: ModalProps) {
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
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 grid place-items-center bg-void/72 p-4 backdrop-blur-sm"
      // Cerrar al pulsar el fondo, pero no al pulsar dentro de la tarjeta
      onMouseDown={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`max-h-full w-full overflow-y-auto ${SIZES[size]} rounded-[18px] border border-white/10 bg-surface px-8 pt-7.5 pb-7 font-body text-white`}>
        {children}
      </div>
    </div>
  )
}
