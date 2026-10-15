import { Link } from 'react-router'
import type { FriendSummary } from '../friends/types.ts'
import Avatar from '../ui/Avatar.tsx'

interface FriendTileProps {
  friend: FriendSummary
}

// Celda de la cuadrícula "Friends of": avatar + nombre, enlaza a su perfil
export default function FriendTile({ friend }: FriendTileProps) {
  return (
    <Link
      to={`/lobby/profile/${friend.id}`}
      title={friend.username}
      className="flex min-w-0 flex-col items-center gap-2.5 rounded-xl border border-line bg-fill px-2 pt-4 pb-3.5 transition-colors hover:border-fuse-600/40 hover:bg-fill-strong"
    >
      <Avatar size={56} src={friend.avatarUrl} status={friend.status} ring="surface" />
      <span className="w-full truncate text-center text-meta">{friend.username}</span>
    </Link>
  )
}