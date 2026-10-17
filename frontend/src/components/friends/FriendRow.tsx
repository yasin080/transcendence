import { Link } from 'react-router'
import Avatar from '../ui/Avatar.tsx'
import Button from '../ui/Button.tsx'
import { CheckIcon, PlusIcon, XIcon } from './icons.tsx'
import type { FriendState, FriendSummary } from './types.ts'

export type FriendRowVariant = 'friend' | 'received' | 'sent' | 'search'

interface FriendRowProps {
  user: FriendSummary
  variant: FriendRowVariant
  friendState?: FriendState // solo en 'search'
  onAdd?: () => void
  onAccept?: () => void
  onRemove?: () => void // rechazar, cancelar o eliminar
}

// Fila del panel de amigos: avatar + nombre (enlace a su perfil) + acciones de icono
export default function FriendRow({ user, variant, friendState = 'none', onAdd, onAccept, onRemove }: FriendRowProps) {
  const isSearch = variant === 'search'
  const received = variant === 'received' || (isSearch && friendState === 'received')
  const sent = variant === 'sent' || (isSearch && friendState === 'sent')
  const online = user.status === 'online'

  const meta = received ? 'Wants to be your friend' : sent ? 'Request sent' : online ? 'Online' : 'Offline'
  const metaColor = !received && !sent && online ? 'text-online' : 'text-fg-muted'
  const faded = variant === 'friend' && !online

  return (
    <div className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-fill-strong ${faded ? 'opacity-72' : ''}`}>
      <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size={38} src={user.avatarUrl} status={user.status} ring="void" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.username}</p>
          <p className={`truncate text-meta ${metaColor}`}>{meta}</p>
        </div>
      </Link>

      {received && (
        <div className="flex flex-none gap-1.5">
          <Button variant="primary" size="icon" aria-label={`Accept ${user.username}`} onClick={onAccept}>
            <CheckIcon />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Decline ${user.username}`} onClick={onRemove}>
            <XIcon />
          </Button>
        </div>
      )}

      {sent && (
        <Button variant="ghost" size="icon" aria-label={`Cancel request to ${user.username}`} onClick={onRemove}>
          <XIcon />
        </Button>
      )}

      {isSearch && friendState === 'none' && (
        <Button variant="primary" size="icon" aria-label={`Add ${user.username}`} onClick={onAdd}>
          <PlusIcon />
        </Button>
      )}
    </div>
  )
}