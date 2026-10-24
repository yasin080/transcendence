import type { ReactNode } from 'react'
import Avatar from '../ui/Avatar.tsx'
import { CalendarIcon, UsersIcon } from './icons.tsx'
import type { OnlineStatus } from '../friends/types.ts'
import type { ProfileUser } from './types.ts'

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const DEFAULT_BIO = 'No bio yet. This worm is too busy dodging bombs.'


interface ProfileHeaderProps {
  user: ProfileUser
  isOwn: boolean
  // Solo en el perfil ajeno: el propio no muestra estado
  status?: OnlineStatus
  // Lo que va a la derecha del nombre: "Edit profile" o el botón de amistad
  action?: ReactNode
}

export default function ProfileHeader({ user, isOwn, status, action }: ProfileHeaderProps) {
  const friendLabel = user.friendCount === 1 ? 'friend' : 'friends'
  const bio = user.bio.trim()

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      {/* Franja: imagen de arena + velo + fundido hacia el fondo de la tarjeta */}
      <div className="relative h-54">
        <div className="absolute inset-0 bg-[url(/arena.webp)] bg-cover bg-center opacity-55" />
        <div className="absolute inset-0 bg-linear-95 from-void/90 via-void/55 via-44% to-void/12" />
        <div className="absolute inset-x-0 bottom-0 h-17.5 bg-linear-to-t from-surface to-transparent" />
        <p className="absolute top-5.5 left-5 text-eyebrow sm:left-7">
          {isOwn ? 'Your profile' : 'Player profile'}
        </p>
      </div>

      {/* Avatar montado sobre la franja, nombre y acción */}
      <div className="relative -mt-15.5 flex flex-col items-start gap-4 px-5 sm:flex-row sm:items-end sm:gap-5.5 sm:px-7">
        <Avatar size={124} src={user.avatarUrl} status={status ?? 'none'} ring="surface" ringWidth={5} />

        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="truncate display-title max-md:text-3xl">{user.username}</h1>
          </div>
          {/* Nombre real: discreto y solo para su dueño */}
          {isOwn && user.name && <p className="mt-1.5 truncate text-meta text-fg-muted">{user.name}</p>}
        </div>

        {action && <div className="flex-none">{action}</div>}
      </div>

      {/* Bio y metadatos */}
      <div className="flex flex-col gap-3.5 px-5 pt-4 pb-6 sm:px-7">
        {bio ? (
          <p className="max-w-prose text-body-muted">{bio}</p>
        ) : (
          <p className="max-w-prose text-sm text-fg-muted italic">{DEFAULT_BIO}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-meta text-fg-muted">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <CalendarIcon />
            Member since {monthYear.format(new Date(user.memberSince))}
          </span>
          <span aria-hidden="true" className="size-0.75 rounded-full bg-current" />
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <UsersIcon />
            <span className="text-white">{user.friendCount}</span> {friendLabel}
          </span>
        </div>
      </div>
    </div>
  )
}