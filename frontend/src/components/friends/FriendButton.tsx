import Button from '../ui/Button.tsx'
import { CheckIcon, ClockIcon, PlusIcon, UserMinusIcon } from '../ui/icons.tsx'
import type { FriendState } from './types.ts'

// Friend button. Holds no state: the parent passes it in
// and is told what the user clicks.
interface FriendButtonProps {
  state: FriendState
  onAdd: () => void
  onAccept: () => void
  onDecline: () => void
  onRemove: () => void
  busy?: boolean
}

export default function FriendButton({ state, onAdd, onAccept, onDecline, onRemove, busy = false }: FriendButtonProps) {
  switch (state) {
    case 'none':
      return (
        <Button variant="primary" size="md" onClick={onAdd} disabled={busy}>
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
          <Button variant="primary" size="md" onClick={onAccept} disabled={busy}>
            <CheckIcon />
            Accept
          </Button>
          <Button variant="secondary" size="md" onClick={onDecline} disabled={busy}>
            Decline
          </Button>
        </div>
      )

    case 'friends':
      return (
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={busy}>
          <UserMinusIcon />
          Remove friend
        </Button>
      )
  }
}