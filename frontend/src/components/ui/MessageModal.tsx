import Modal from './Modal.tsx'
import Button from './Button.tsx'

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
      <h3 className="mt-2.5 display-heading">{title}</h3>
      <p className="mt-3 text-body-muted">{message}</p>
        <Button variant="light" size="md" onClick={onAction} className="mt-5.5 w-full">
          {buttonLabel}
        </Button>
    </Modal>
  )
}