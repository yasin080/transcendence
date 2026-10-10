import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import FriendButton from '../components/friends/FriendButton'
import type { FriendState, FriendSummary } from '../components/friends/types'
import FriendTile from '../components/profile/FriendTile'
import { PencilIcon } from '../components/profile/icons'
import ProfileHeader from '../components/profile/ProfileHeader'
import StatCard from '../components/profile/StatCard'
import type { ProfileUser } from '../components/profile/types'
import Button from '../components/ui/Button'

// DATOS FALSOS (MOCK) — sustituir por la API cuando exista
const MOCK_ME: ProfileUser = {
  id: 'u1',
  username: 'lunaBoom',
  avatarUrl: null,
  bio: 'Bomb first, ask questions later. Main in Chaos mode, always hunting the longest snake in the arena.',
  memberSince: '2026-03-14',
  friendCount: 7,
  stats: { played: 148, won: 63, bombs: 1240 },
}

const MOCK_OTHER: ProfileUser = {
  id: 'u2',
  username: 'Kiro_TNT',
  avatarUrl: null,
  bio: 'Speed runner. If you can see my tail, it is already too late.',
  memberSince: '2026-05-02',
  friendCount: 1,
  stats: { played: 92, won: 31, bombs: 604 },
}

const MOCK_OTHER_FRIENDS: FriendSummary[] = [
  { id: 'u3', username: 'Boomer_92', avatarUrl: null, status: 'online' },
  { id: 'u4', username: 'ex0', avatarUrl: null, status: 'online' },
  { id: 'u5', username: 'Pixel_Rex', avatarUrl: null, status: 'offline' },
  { id: 'u6', username: 'ash_fuse', avatarUrl: null, status: 'offline' },
  { id: 'u7', username: 'zeroKelvin', avatarUrl: null, status: 'online' },
  { id: 'u8', username: 'Tanuki', avatarUrl: null, status: 'offline' },
]

// Comprueba que un texto (p. ej. de la URL) es un FriendState válido
function isFriendState(value: string | null): value is FriendState {
  return value === 'none' || value === 'sent' || value === 'received' || value === 'friends'
}

// Vive bajo RequireAuth: aquí siempre hay sesión.
export default function Profile() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  // Provisional: ?friend=received (etc.) fija el estado inicial de amistad
  const friendParam = searchParams.get('friend')
  const [friendState, setFriendState] = useState<FriendState>(
    isFriendState(friendParam) ? friendParam : 'none',
  )

  if (!user) return null

  const isOwn = searchParams.get('view') !== 'other'
  // Provisional: &empty muestra el estado vacío de la cuadrícula
  const friends = searchParams.has('empty') ? [] : MOCK_OTHER_FRIENDS
  // El contador de la cabecera sale de la lista, para que siempre coincidan
  const profile = isOwn ? MOCK_ME : { ...MOCK_OTHER, friendCount: friends.length }

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.5 overflow-y-auto px-7 pt-6 pb-8">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        status={isOwn ? undefined : 'online'}
        action={
          isOwn ? (
            <Button variant="ghost" size="sm">
              <PencilIcon />
              Edit profile
            </Button>
          ) : (
            <FriendButton
              state={friendState}
              onAdd={() => setFriendState('sent')}
              onAccept={() => setFriendState('friends')}
              onDecline={() => setFriendState('none')}
              onRemove={() => setFriendState('none')}
            />
          )
        }
      />

      {/* Estadísticas: título de sección + tarjetas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3.5">
          <h2 className="text-section-title">Stats</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <StatCard kind="played" value={profile.stats.played} />
          <StatCard kind="won" value={profile.stats.won} />
          <StatCard kind="bombs" value={profile.stats.bombs} />
        </div>
      </div>

            {/* Solo en el perfil ajeno: sus amigos */}
      {!isOwn && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <h2 className="whitespace-nowrap text-section-title">Friends of {profile.username}</h2>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <span className="text-meta text-fg-muted">{friends.length}</span>
          </div>

          {friends.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(--spacing(21),1fr))] gap-3">
              {friends.map((friend) => (
                <FriendTile key={friend.id} friend={friend} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line-strong p-7 text-center text-body-muted">
              {profile.username} has no friends yet
            </p>
          )}
        </div>
      )}
    </section>
  )
}