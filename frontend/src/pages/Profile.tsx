import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { acceptRequest, removeFriendship, sendRequest } from '../components/friends/api'
import FriendButton from '../components/friends/FriendButton'
import type { FriendState } from '../components/friends/types'
import { fetchProfile, type ProfileData } from '../components/profile/api'
import EditProfileModal from '../components/profile/EditProfileModal'
import FriendTile from '../components/profile/FriendTile'
import { PencilIcon } from '../components/ui/icons'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileBanner from '../components/profile/ProfileBanner'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import SectionHeader from '../components/ui/SectionHeader'
import { onFriendsChanged } from '../components/friends/events'
import LegalLinks from '../components/ui/LegalLinks'
import LogoutButton from '../components/left-sidebar/auth/LogoutButton'
import { useOnlineIds, withPresence } from '../components/friends/presence'

// Rendered under RequireAuth: there is always a session here.
export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { userId } = useParams()

  const [data, setData] = useState<ProfileData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const onlineIds = useOnlineIds()

  // No id in the URL → my own profile
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
  
  // Reload when any friendship changes (e.g. from the friends panel)
  useEffect(() => onFriendsChanged(() => void load()), [load])

  // Runs a friend action; busy blocks repeated clicks while the request is in flight
  async function act(action: (userId: string) => Promise<FriendState | null>) {
    if (!data || busy) return
    setBusy(true)
    try {
      const state = await action(data.profile.id)
      if (state) setData((prev) => (prev ? { ...prev, friendState: state } : prev))
    } finally {
      setBusy(false)
    }
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

  if (!data) return null // loading

  const { isOwn, friendState, profile } = data
  const friends = withPresence(data.friends, onlineIds)

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.5 overflow-y-auto px-4 pt-6 pb-8 *:shrink-0 md:px-7">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        status={isOwn ? undefined : onlineIds.has(profile.id) ? 'online' : 'offline'}
        action={
          isOwn ? (
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-3.5" />
              Edit profile
            </Button>
          ) : (
            <FriendButton
              state={friendState}
              busy={busy}
              onAdd={() => void act(sendRequest)}
              onAccept={() => void act(acceptRequest)}
              onDecline={() => void act(removeFriendship)}
              onRemove={() => void act(removeFriendship)}
            />
          )
        }
      />

      {isOwn && <ProfileBanner />}

      {/* Other players' profiles only: their friends */}
      {!isOwn && (
        <div className="flex flex-col gap-3">
          <SectionHeader title={`Friends of ${profile.username}`} count={friends.length} />

          {friends.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(--spacing(21),1fr))] gap-3">
              {friends.map((friend) => (
                <FriendTile key={friend.id} friend={friend} />
              ))}
            </div>
          ) : (
            <EmptyState title={`${profile.username} has no friends yet`} />
          )}
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-2">
        {isOwn && (
          <div className="w-full md:hidden">
            <LogoutButton />
          </div>
        )}
        <LegalLinks />
      </div>

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