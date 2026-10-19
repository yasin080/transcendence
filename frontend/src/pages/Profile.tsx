import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { acceptRequest, removeFriendship, sendRequest } from '../components/friends/api'
import FriendButton from '../components/friends/FriendButton'
import type { FriendState } from '../components/friends/types'
import { fetchProfile, type ProfileData } from '../components/profile/api'
import EditProfileModal from '../components/profile/EditProfileModal'
import FriendTile from '../components/profile/FriendTile'
import { PencilIcon } from '../components/profile/icons'
import ProfileHeader from '../components/profile/ProfileHeader'
import QuickMatchBanner from '../components/profile/QuickMatchBanner'
import StatCard from '../components/profile/StatCard'
import Button from '../components/ui/Button'
import { onFriendsChanged } from '../components/friends/events'

// Vive bajo RequireAuth: aquí siempre hay sesión.
export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<ProfileData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  

  // Sin id en la URL → mi perfil
  const targetId = userId ?? (user ? String(user.id) : null)

  const load = useCallback(async () => {
    if (!targetId) return
    const profile = await fetchProfile(targetId)
    setData(profile)
    setNotFound(profile === null)
  }, [targetId])

  useEffect(() => {
    setData(null)
    setNotFound(false)
    void load()
  }, [load])

  // Recarga cuando cambia cualquier amistad (por ejemplo, desde el panel)
  useEffect(() => onFriendsChanged(() => void load()), [load])

  // Lanza la acción; el aviso de amistades recarga el perfil
  async function act(action: (userId: string) => Promise<FriendState | null>) {
    if (!data) return
    await action(data.profile.id)
  }

  if (!user) return null

  if (notFound) {
    return (
      <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-7 text-center">
        <h1 className="display-heading">Player not found</h1>
        <p className="text-body-muted">This player doesn't exist or has deleted their account.</p>
      </section>
    )
  }

  if (!data) return null // cargando

  const { isOwn, friendState, friends, profile } = data

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.5 overflow-y-auto px-7 pt-6 pb-8 *:shrink-0">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        // [RETOMAR] estado online real con Reverb
        status={isOwn ? undefined : 'offline'}
        action={
          isOwn ? (
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
              Edit profile
            </Button>
          ) : (
            <FriendButton
              state={friendState}
              onAdd={() => void act(sendRequest)}
              onAccept={() => void act(acceptRequest)}
              onDecline={() => void act(removeFriendship)}
              onRemove={() => void act(removeFriendship)}
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

      {editOpen && (
        <EditProfileModal
          profile={profile}
          email={user.email}
          onSaved={() => {
            void load()
            void refreshUser()
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </section>
  )
}