import Button from '../ui/Button.tsx'
import { CheckIcon, ClockIcon, PlusIcon, UserMinusIcon } from '../ui/icons.tsx'
import type { FriendState } from './types.ts'

// Botón de amistad. No guarda estado: lo recibe del padre
// y le avisa de lo que pulsa el usuario.
interface FriendButtonProps {
  state: FriendState
  onAdd: () => void
  onAccept: () => void
  onDecline: () => void
  onRemove: () => void
}

export default function FriendButton({ state, onAdd, onAccept, onDecline, onRemove }: FriendButtonProps) {
  switch (state) {
    case 'none':
      return (
        <Button variant="primary" size="md" onClick={onAdd}>
          <PlusIcon />
          Add friend
        </Button>
      )

    case 'sent':
      return (
        <Button variant="secondary" size="md" disabled>
          <ClockIcon />
          Pending
        </Button>
      )

    case 'received':
      return (
        <div className="flex gap-2">
          <Button variant="primary" size="md" onClick={onAccept}>
            <CheckIcon />
            Accept
          </Button>
          <Button variant="secondary" size="md" onClick={onDecline}>
            Decline
          </Button>
        </div>
      )

    case 'friends':
      return (
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <UserMinusIcon />
          Remove friend
        </Button>
      )
  }
}