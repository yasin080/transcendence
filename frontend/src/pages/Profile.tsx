import { useSearchParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import EditProfileButton from '../components/profile/EditProfileButton'
import ProfileHeader from '../components/profile/ProfileHeader'
import StatCard from '../components/profile/StatCard'
import type { ProfileUser } from '../components/profile/types'

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

// Vive bajo RequireAuth: aquí siempre hay sesión.
export default function Profile() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  if (!user) return null

  // Provisional: ?view=other muestra el perfil ajeno
  const isOwn = searchParams.get('view') !== 'other'
  const profile = isOwn ? MOCK_ME : MOCK_OTHER

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6.5 overflow-y-auto px-7 pt-6 pb-8">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        status={isOwn ? undefined : 'online'}
        action={isOwn ? <EditProfileButton onClick={() => {}} /> : null}
      />

      <div className="grid grid-cols-3 gap-3.5">
        <StatCard kind="played" value={profile.stats.played} />
        <StatCard kind="won" value={profile.stats.won} />
        <StatCard kind="bombs" value={profile.stats.bombs} />
      </div>
    </section>
  )
}