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
      <div className="text-[11px] font-bold tracking-[.18em] text-ember-450 uppercase">{kicker}</div>
      <h3 className="mt-2.5 font-display text-2xl leading-[1.05] uppercase">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5.5 w-full cursor-pointer rounded-xl bg-white px-5 py-3.75 text-sm font-bold tracking-[.04em] text-[#12102b] uppercase hover:bg-white/90"
      >
        {buttonLabel}
      </button>
    </Modal>
  )
}