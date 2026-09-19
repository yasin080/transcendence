import { useNavigate, useSearchParams } from 'react-router'
import WaitingRoomHeader from '../components/waiting-room/WaitingRoomHeader.tsx'
import MatchPanel from '../components/waiting-room/MatchPanel.tsx'
import PlayerGrid from '../components/waiting-room/PlayerGrid.tsx'
import BackstageBanner from '../components/waiting-room/BackstageBanner.tsx'
import backstage from '../assets/salon.jpg'
import type { MatchSetting, Player } from '../components/waiting-room/types.ts'

//DATOS FALSOS (MOCK) - CONEXIÓN JSON / REVERB /...
const MOCK_MAX_PLAYERS = 6

const MOCK_PLAYERS: Player[] = [
  { id: 'u1', name: 'Boomer_92', isOwner: true, isBot: false, winPct: '64%', avgScore: '1 240', background: 'linear-gradient(150deg,#3b2f7a,#1b1636)', color: '#ff89a5' },
  { id: 'u2', name: 'Kiro_TNT', isOwner: false, isBot: false, winPct: '58%', avgScore: '1 106', background: 'linear-gradient(150deg,#6b3bd8,#2a1b56)', color: '#ffd7e0' },
  { id: 'u3', name: 'lunaBoom', isOwner: false, isBot: false, winPct: '71%', avgScore: '1 388', background: 'linear-gradient(150deg,#ff6f9c,#8c1f47)', color: '#fff' },

  { id: 'b1', name: 'BOT_Nova', isOwner: false, isBot: true, difficulty: 'medium' },
]

  

const MOCK_SETTINGS: MatchSetting[] = [
  { label: 'Arena', value: 'Neon Grid' },
  { label: 'Mode', value: 'Free-for-all' },
  { label: 'Rounds', value: 'Best of 3' },
  { label: 'Bomb fuse', value: '2.5 s' },
  { label: 'Speed', value: 'Fast' },
  { label: 'Power-ups', value: 'On' },
]



export default function WaitingRoom() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Provisional: /waiting-room/demo?role=guest muestra la vista de invitado.
  const isOwner = searchParams.get('role') !== 'guest'
  const playerCount = MOCK_PLAYERS.length
  const hasFreeSeat = playerCount < MOCK_MAX_PLAYERS
  const canStart = playerCount >= 2

  return (
    <div className="h-full overflow-y-auto px-7 pt-6 pb-8 font-body">
      <WaitingRoomHeader
        isOwner={isOwner}
        hasFreeSeat={hasFreeSeat}
        onAddBot={() => console.log('add bot')}
      />
      <MatchPanel
        isOwner={isOwner}
        playerCount={playerCount}
        maxPlayers={MOCK_MAX_PLAYERS}
        settings={MOCK_SETTINGS}
        canStart={canStart}
        onStart={() => console.log('start match')}
        onLeave={() => navigate('/')}
      />
      <PlayerGrid
        players={MOCK_PLAYERS}
        maxPlayers={MOCK_MAX_PLAYERS}
        isOwner={isOwner}
        onKick={(playerId) => console.log('kick', playerId)}
      />
      <BackstageBanner>
         <img src={backstage} alt="" className="size-full object-cover" />
        </BackstageBanner>
    </div>
  )
}