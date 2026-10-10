import type { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
}

export default function Modal({ children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-void/72 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-109 rounded-2xl border border-line bg-surface px-8 pt-7.5 pb-7 font-body text-white">
        {children}
      </div>
    </div>
  )
}