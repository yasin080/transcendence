/**
 * Lobby — página por defecto de la columna central del dashboard.
 *
 * Solo maquetación: textos y salas de prueba escritos a mano, sin estado.
 * Secciones: 1. cabecera · 2. partida rápida · 3. salas abiertas · 4. crear partida
 */
export default function Lobby() {
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

      {/* ─── 2. Partida rápida (hero) ─── */}
      <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-surface-2">
        {/* Capas de fondo: la imagen y un degradado para que el texto se lea */}
        <div className="absolute inset-0 bg-[url(/arena.webp)] bg-cover bg-position-[58%_62%] opacity-55" />
        <div className="absolute inset-0 bg-linear-95 from-void/96 via-void/80 via-44% to-void/15" />

        {/* Contenido: lleva `relative` para quedar por encima de las capas */}
        <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-7 py-[26px]">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-ember-450">Quick match</p>
            <h2 className="mt-2 font-display text-[30px] leading-[1.05]">Drop into a live arena</h2>

            {/* Modos: el primero aparece seleccionado */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="px-4 py-[9px] rounded-full border border-fuse-600 bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer">Chaos</button>
              <button className="px-4 py-[9px] rounded-full border border-white/14 bg-white/6 text-[13px] font-bold tracking-[.04em] text-white/70 cursor-pointer">Duos</button>
              <button className="px-4 py-[9px] rounded-full border border-white/14 bg-white/6 text-[13px] font-bold tracking-[.04em] text-white/70 cursor-pointer">Teams 4v4</button>
            </div>
          </div>

          <button className="flex-none px-[38px] py-5 rounded-2xl border-b-4 border-fuse-900 bg-linear-to-b from-fuse-500 via-fuse-600 via-55% to-fuse-700 font-display text-xl uppercase cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5">
            Play now
          </button>
        </div>
      </div>

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
              <div className="truncate text-[15px] font-bold">Neon Grid #14</div>
              <div className="text-xs text-white/45">hosted by Kiro_TNT</div>
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
              <div className="text-xs text-white/45">no bombs first 30s</div>
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
              <div className="text-xs text-white/45">ranked · Gold+</div>
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

      {/* ─── 4. Crear partida ─── */}
      <div className="mt-[26px] px-6 py-[22px] rounded-[18px] border border-white/10 bg-linear-160 from-[rgba(58,38,110,.45)] to-[rgba(16,13,40,.7)]">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-xl">Create custom match</h3>
          <span className="text-[13px] text-white/50">Your rules, your friends, your chaos.</span>
        </div>

        {/* Campos en rejilla de 2 columnas */}
        <div className="grid grid-cols-2 gap-4 mt-[18px]">
          <label>
            <span className="block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Room name</span>
            <input
              defaultValue="Boomer's arena"
              className="w-full px-3.5 py-3 rounded-[11px] border border-white/14 bg-surface-input text-sm text-white outline-none"
            />
          </label>

          <div>
            <span className="block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Map</span>
            <div className="flex gap-2">
              <button className="flex-1 px-1.5 py-3 rounded-[11px] border border-fuse-600 bg-fuse-600 text-[13px] font-bold text-white cursor-pointer">Neon Grid</button>
              <button className="flex-1 px-1.5 py-3 rounded-[11px] border border-white/14 bg-white/6 text-[13px] font-bold text-white/70 cursor-pointer">Emerald</button>
              <button className="flex-1 px-1.5 py-3 rounded-[11px] border border-white/14 bg-white/6 text-[13px] font-bold text-white/70 cursor-pointer">Brick Yard</button>
            </div>
          </div>

          <label>
            <span className="block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Max players — 12</span>
            <input type="range" min={4} max={24} step={2} defaultValue={12} className="w-full accent-fuse-600" />
          </label>

          <label>
            <span className="block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Blast radius — 3</span>
            <input type="range" min={1} max={6} step={1} defaultValue={3} className="w-full accent-ember-600" />
          </label>
        </div>

        {/* Interruptores + botón de crear */}
        <div className="flex flex-wrap items-center gap-2.5 mt-[18px]">
          <button className="inline-flex items-center gap-[9px] px-4 py-2.5 rounded-full border border-white/12 bg-white/5 text-[13px] font-semibold text-white/60 cursor-pointer">
            <span className="relative w-[30px] h-[17px] flex-none rounded-full bg-white/20">
              <span className="absolute top-0.5 left-0.5 size-[13px] rounded-full bg-white" />
            </span>
            Friendly fire
          </button>
          <button className="inline-flex items-center gap-[9px] px-4 py-2.5 rounded-full border border-fuse-600/50 bg-fuse-600/16 text-[13px] font-semibold text-white cursor-pointer">
            <span className="relative w-[30px] h-[17px] flex-none rounded-full bg-fuse-600">
              <span className="absolute top-0.5 left-[15px] size-[13px] rounded-full bg-white" />
            </span>
            Power-ups
          </button>
          <button className="inline-flex items-center gap-[9px] px-4 py-2.5 rounded-full border border-white/12 bg-white/5 text-[13px] font-semibold text-white/60 cursor-pointer">
            <span className="relative w-[30px] h-[17px] flex-none rounded-full bg-white/20">
              <span className="absolute top-0.5 left-0.5 size-[13px] rounded-full bg-white" />
            </span>
            Private room
          </button>

          <button className="ml-auto px-[30px] py-3.5 rounded-xl bg-white font-display text-[15px] uppercase text-[#12102b] cursor-pointer hover:bg-fuse-100">
            Create room
          </button>
        </div>
      </div>

    </section>
  )
}
