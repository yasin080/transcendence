import { useState } from 'react'
import { useNavigate } from 'react-router'
import QuickMatchHero from '../components/lobby/QuickMatchHero.tsx'
import CountdownOverlay from '../components/game/CountdownOverlay.tsx'

const GAME_MODES = ['Bomberman', 'Snake', 'Other'] as const
type GameMode = (typeof GAME_MODES)[number]

export default function Lobby() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODES[0])
  const navigate = useNavigate()
  const [countingDown, setCountingDown] = useState(false)

  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-8">

      {/* ─── 1. Cabecera: título + buscador ─── */}
      <div className="flex flex-wrap items-center gap-4 mb-[22px]">
        <h1 className="font-display text-[26px] tracking-[0.01em]">Lobby</h1>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Caja del buscador */}
          <div className="flex items-center gap-[9px] px-3.5 py-2.5 rounded-[11px] border border-white/12 bg-white/5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              placeholder="Search room or code"
              className="w-[190px] border-0 bg-transparent text-[13px] text-white outline-none"
            />
          </div>

          {/* Botón de notificaciones */}
          <button className="grid place-items-center size-[42px] rounded-[11px] border border-white/12 bg-white/5 text-white cursor-pointer hover:bg-white/12">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
              <path d="M10.5 21h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── 2. Partida rápida (hero): Play now → cuenta atrás → /game ─── */}
      <QuickMatchHero
        modes={GAME_MODES}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        canPlay={selectedMode !== 'Other'}
        onPlay={() => setCountingDown(true)}
      />

      {/* [RETOMAR] Provisional sin backend: el gameId se inventa aquí y la cuenta
          es local. Con matchmaking, el servidor enviará {gameId, startsAt} y la
          cuenta atrás se calculará desde startsAt para que todos los jugadores
          empiecen a la vez. */}
      {countingDown && (
        <CountdownOverlay
          from={3}
          onDone={() => navigate(`/game/${crypto.randomUUID()}?mode=${selectedMode.toLowerCase()}`)}
        />
      )}
          />
        )}

      {/* ─── 3. Salas abiertas (máx. 6 por página) + paginador ─── */}
      <div className="flex items-center gap-3.5 mt-[26px] mb-3">
        <h3 className="text-sm font-bold uppercase tracking-[.16em] text-white/60">Open rooms</h3>
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/40">11 rooms</span>
      </div>

      {/* Cada fila: nombre · modo · mapa · plazas · ping + botón.
          Punto verde = libre, naranja = en partida (Spectate). */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Neon Grid</div>
              <div className="text-xs text-white/45">hosted by ex0</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Free-for-all</div>
          <div className="text-[13px] text-white/72">Neon Grid</div>
          <div className="text-[13px] font-bold text-signal-500">9 / 12</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">24 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Join</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-ember-600 shadow-[0_0_10px_2px_rgba(255,155,47,.5)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Emerald Sprint</div>
              <div className="text-xs text-white/45">hosted by ex1</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Teams 4v4</div>
          <div className="text-[13px] text-white/72">Emerald Grid</div>
          <div className="text-[13px] font-bold text-ember-600">8 / 8</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">38 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Spectate</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Chaos Cellar</div>
              <div className="text-xs text-white/45">hosted by ex2</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Chaos</div>
          <div className="text-[13px] text-white/72">Cellar</div>
          <div className="text-[13px] font-bold text-signal-500">5 / 16</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">61 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Join</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Rookie Sandbox</div>
              <div className="text-xs text-white/45">hosted by ex99</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Free-for-all</div>
          <div className="text-[13px] text-white/72">Neon Grid</div>
          <div className="text-[13px] font-bold text-signal-500">3 / 12</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">19 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Join</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Tail Hunters</div>
              <div className="text-xs text-white/45">hosted by ex3</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Duos</div>
          <div className="text-[13px] text-white/72">Brick Yard</div>
          <div className="text-[13px] font-bold text-signal-500">10 / 12</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">44 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Join</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-2.5 flex-none rounded-full bg-ember-600 shadow-[0_0_10px_2px_rgba(255,155,47,.5)]" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">Midnight Bricks</div>
              <div className="text-xs text-white/45">ranked Gold+</div>
            </div>
          </div>
          <div className="text-[13px] text-white/72">Teams 3v3</div>
          <div className="text-[13px] text-white/72">Brick Yard</div>
          <div className="text-[13px] font-bold text-ember-600">6 / 6</div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-white/40">52 ms</span>
            <button className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Spectate</button>
          </div>
        </div>
      </div>

      {/* Paginador: página 1 activa */}
      <div className="flex items-center gap-2.5 mt-3.5">
        <span className="text-xs text-white/40">Showing 1–6 of 11</span>

        <div className="ml-auto flex items-center gap-1.5">
          <button className="grid place-items-center size-[34px] rounded-[10px] border border-white/12 bg-white/5 text-white/25 cursor-pointer hover:bg-white/12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button className="min-w-[34px] h-[34px] px-2.5 rounded-[10px] border border-fuse-600 bg-fuse-600 text-[13px] font-bold text-white cursor-pointer">1</button>
          <button className="min-w-[34px] h-[34px] px-2.5 rounded-[10px] border border-white/12 bg-white/5 text-[13px] font-bold text-white/60 cursor-pointer">2</button>
          <button className="grid place-items-center size-[34px] rounded-[10px] border border-white/12 bg-white/5 text-white cursor-pointer hover:bg-white/12">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>



    </section>
  )
}
