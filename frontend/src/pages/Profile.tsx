import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import FriendButton from '../components/friends/FriendButton'
import type { FriendState, FriendSummary, OnlineStatus } from '../components/friends/types'
import FriendTile from '../components/profile/FriendTile'
import { PencilIcon } from '../components/profile/icons'
import ProfileHeader from '../components/profile/ProfileHeader'
import QuickMatchBanner from '../components/profile/QuickMatchBanner'
import StatCard from '../components/profile/StatCard'
import type { ProfileEdits, ProfileUser } from '../components/profile/types'
import Button from '../components/ui/Button'
import EditProfileModal from '../components/profile/EditProfileModal'

// DATOS FALSOS (MOCK) — sustituir por la API cuando exista

// Perfil propio: lo que la sesión aún no da (bio, avatar, amigos, estadísticas)
const MOCK_ME: ProfileUser = {
  id: '',
  username: '',
  name: 'Luna García',
  avatarUrl: null,
  bio: 'texto puesto por el usuario',
  memberSince: '',
  friendCount: 7,
  stats: { played: 148, won: 63, bombs: 1240 },
}

// Lo que la API devolverá de otro jugador, visto por mí
interface MockPlayer {
  profile: ProfileUser
  status: OnlineStatus
  relation: FriendState // relación entre él y yo
  friends: FriendSummary[]
}

// Otros jugadores, por id. Ids altos para no chocar con usuarios reales de la BD local.
const MOCK_PLAYERS: Record<string, MockPlayer> = {
  '9001': {
    profile: {
      id: '9001',
      username: 'Kiro_TNT',
      avatarUrl: null,
      bio: 'Speed runner. If you can see my tail, it is already too late.',
      memberSince: '2026-05-02',
      friendCount: 0, // se calcula a partir de friends
      stats: { played: 92, won: 31, bombs: 604 },
    },
    status: 'online',
    relation: 'none',
    friends: [
      { id: '9002', username: 'Bomba_Loca', avatarUrl: null, status: 'offline' },
      { id: '9003', username: 'Boomer_92', avatarUrl: null, status: 'online' },
      { id: '9004', username: 'ex0', avatarUrl: null, status: 'online' },
      { id: '9005', username: 'Pixel_Rex', avatarUrl: null, status: 'offline' },
      { id: '9006', username: 'zeroKelvin', avatarUrl: null, status: 'online' },
      { id: '9007', username: 'Tanuki', avatarUrl: null, status: 'offline' },
    ],
  },
  '9002': {
    profile: {
      id: '9002',
      username: 'Bomba_Loca',
      avatarUrl: null,
      bio: 'New here. Still learning which end the bombs come out of.',
      memberSince: '2026-10-01',
      friendCount: 0,
      stats: { played: 6, won: 1, bombs: 58 },
    },
    status: 'offline',
    relation: 'received',
    friends: [],
  },
}

// Vive bajo RequireAuth: aquí siempre hay sesión.
export default function Profile() {
  const { user } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()

  // Provisional: estado de amistad cambiado en esta sesión, por id de jugador.
  // Con la API, cada cambio será una petición y el backend devolverá la relación.
  const [relations, setRelations] = useState<Record<string, FriendState>>({})
  const [editOpen, setEditOpen] = useState(false)
  // Provisional: lo guardado desde Edit profile (sin API todavía)
  const [ownEdits, setOwnEdits] = useState<ProfileEdits | null>(null)

  if (!user) return null

  // Sin id en la URL, o con mi propio id → mi perfil
  const isOwn = userId === undefined || userId === String(user.id)
  const player = !isOwn && userId ? MOCK_PLAYERS[userId] : undefined

  if (!isOwn && !player) {
    return (
      <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
        <h1 className="display-heading">Player not found</h1>
        <p className="text-body-muted">This player doesn't exist or has deleted their account.</p>
      </section>
    )
  }

  const friends = player?.friends ?? []

  const me: ProfileUser = {
    ...MOCK_ME,
    id: String(user.id),
    username: ownEdits?.username ?? user.username,
    name: ownEdits?.name ?? user.name ?? '',
    bio: ownEdits?.bio ?? user.bio ?? '',
    avatarUrl: ownEdits ? ownEdits.avatarUrl : user.avatar_url,
    memberSince: user.created_at,
  }
  
  const profile: ProfileUser = player ? { ...player.profile, friendCount: friends.length } : me
  const friendState: FriendState = player ? (relations[player.profile.id] ?? player.relation) : 'none'

  function setFriendState(state: FriendState) {
    if (!player) return
    setRelations((prev) => ({ ...prev, [player.profile.id]: state }))
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.5 overflow-y-auto px-7 pt-6 pb-8 *:shrink-0">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        status={player?.status}
        action={
          isOwn ? (
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
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

      {/* Solo en el perfil propio: invitación a jugar */}
      {/* Provisional: lleva al Lobby hasta que exista la partida rápida */}
      {isOwn && <QuickMatchBanner onPlay={() => void navigate('/lobby')} />}

      {/* Solo en el perfil ajeno: sus amigos */}
      {player && (
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
      {editOpen && (
        <EditProfileModal
          profile={profile}
          email={ownEdits?.email ?? user.email}
          onSave={setOwnEdits}
          onClose={() => setEditOpen(false)}
        />
      )}
    </section>
  )
}