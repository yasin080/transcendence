import Modal from './Modal.tsx'

interface MessageModalProps {
  kicker: string
  title: string
  message: string
  buttonLabel: string
  onAction: () => void
}

export default function MessageModal({ kicker, title, message, buttonLabel, onAction }: MessageModalProps) {
  return (
    <Modal>
      <div className="text-eyebrow">{kicker}</div>
      <h3 className="mt-2.5 heading-display">{title}</h3>
      <p className="mt-3 text-body-muted">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5.5 w-full cursor-pointer rounded-xl bg-white px-5 py-3.75 text-button-label text-[#12102b] hover:bg-white/90"
      >
        {buttonLabel}
      </button>
    </Modal>
  )
}