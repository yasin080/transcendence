import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  // Without onClose the modal is blocking (it can only be left through its own button)
  onClose?: () => void
  size?: 'sm' | 'lg'
  // Title id, so screen readers announce the modal
  labelledBy?: string
}

const SIZES = {
  sm: 'max-w-109',
  lg: 'max-w-2xl',
}

export default function Modal({ children, onClose, size = 'sm', labelledBy }: ModalProps) {
  // Close with Esc
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
      // Close when clicking the backdrop, but not when clicking inside the card
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
