export default function SocialPanel() {
  return (
    <div className="flex flex-col h-full min-h-0">

      {/* 1. Cabecera: título + online + Add */}
      <div className="flex items-center gap-2.5 px-[18px] pt-5 pb-3.5">
        <h3 className="text-[13px] font-bold uppercase tracking-[.16em] text-white/60">Friends</h3>
        <span className="px-2 py-0.5 rounded-full bg-signal-500/14 text-[11px] font-bold text-signal-400">3 online</span>
        <button className="ml-auto px-3 py-1.5 rounded-lg border border-white/14 text-xs font-semibold text-white/70 cursor-pointer hover:bg-white/8 hover:text-white">
          Add Friend
        </button>
      </div>

	  {/* 2. Amigos */}
      <div className="flex flex-col gap-0.5 px-2.5 pb-3 max-h-[42%] min-h-0 overflow-y-auto">
        <div className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[11px] hover:bg-white/6">
          <div className="relative grid place-items-center size-[34px] flex-none rounded-[11px] bg-linear-150 from-[#6b3bd8] to-[#2a1b56] text-[13px] font-bold">
            K
            <span className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border-2 border-[#0c0a24] bg-ember-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">Kiro_TNT</div>
            <div className="truncate text-xs text-white/42">In match · Chaos Cellar</div>
          </div>
          <button className="px-[11px] py-1.5 rounded-lg bg-fuse-600/20 text-[11px] font-bold uppercase tracking-[.06em] text-fuse-300 cursor-pointer">Invite</button>
        </div>

        <div className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[11px] hover:bg-white/6">
          <div className="relative grid place-items-center size-[34px] flex-none rounded-[11px] bg-linear-150 from-[#ff6f9c] to-[#8c1f47] text-[13px] font-bold">
            L
            <span className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border-2 border-[#0c0a24] bg-signal-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">lunaBoom</div>
            <div className="truncate text-xs text-white/42">In lobby</div>
          </div>
          <button className="px-[11px] py-1.5 rounded-lg bg-signal-500/18 text-[11px] font-bold uppercase tracking-[.06em] text-signal-400 cursor-pointer">Sent</button>
        </div>

        <div className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[11px] hover:bg-white/6">
          <div className="relative grid place-items-center size-[34px] flex-none rounded-[11px] bg-linear-150 from-[#3bb0d8] to-[#153c56] text-[13px] font-bold">
            8
            <span className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border-2 border-[#0c0a24] bg-[#ffd76a]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">8bitVega</div>
            <div className="truncate text-xs text-white/42">Idle · 12 min</div>
          </div>
          <button className="px-[11px] py-1.5 rounded-lg bg-fuse-600/20 text-[11px] font-bold uppercase tracking-[.06em] text-fuse-300 cursor-pointer">Invite</button>
        </div>

        <div className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[11px] hover:bg-white/6">
          <div className="relative grid place-items-center size-[34px] flex-none rounded-[11px] bg-linear-150 from-[#4a4a68] to-[#1b1b2c] text-[13px] font-bold">
            P
            <span className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border-2 border-[#0c0a24] bg-[#5a5a72]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold text-white/45">PixelMarbles</div>
            <div className="truncate text-xs text-white/42">Offline · 2 h ago</div>
          </div>
          <button className="px-[11px] py-1.5 rounded-lg bg-white/6 text-[11px] font-bold uppercase tracking-[.06em] text-white/45 cursor-pointer">Offline</button>
        </div>

        <div className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[11px] hover:bg-white/6">
          <div className="relative grid place-items-center size-[34px] flex-none rounded-[11px] bg-linear-150 from-[#4a4a68] to-[#1b1b2c] text-[13px] font-bold">
            Z
            <span className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border-2 border-[#0c0a24] bg-[#5a5a72]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold text-white/45">ZeroFuse</div>
            <div className="truncate text-xs text-white/42">Offline · yesterday</div>
          </div>
          <button className="px-[11px] py-1.5 rounded-lg bg-white/6 text-[11px] font-bold uppercase tracking-[.06em] text-white/45 cursor-pointer">Offline</button>
        </div>
      </div>

      {/* 3. Chat */}
      <div className="flex flex-col flex-1 min-h-0 border-t border-white/8">
        <div className="px-[18px] pt-4">
          <h3 className="text-[13px] font-bold uppercase tracking-[.16em] text-white/60">Messages</h3>
        </div>

        {/* Pestañas: Global */}
        <div className="flex gap-1.5 px-4 pt-3 pb-2.5">
          <button className="px-3.5 py-[7px] rounded-full bg-fuse-600/90 text-xs font-bold uppercase tracking-[.06em] text-white cursor-pointer">Global</button>
          <button className="px-3.5 py-[7px] rounded-full bg-white/6 text-xs font-bold uppercase tracking-[.06em] text-white/60 cursor-pointer">Party</button>
          <button className="px-3.5 py-[7px] rounded-full bg-white/6 text-xs font-bold uppercase tracking-[.06em] text-white/60 cursor-pointer">Clan</button>
        </div>

        {/* Mensajes: scroll propio */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto px-4 pt-1.5 pb-3">
          <div className="flex gap-[9px]">
            <div className="grid place-items-center size-[26px] flex-none rounded-lg bg-linear-150 from-[#6b3bd8] to-[#2a1b56] text-[11px] font-bold">K</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-fuse-300">Kiro_TNT <span className="font-normal text-white/32">20:41</span></div>
              <div className="mt-0.5 text-[13px] leading-[1.45] text-white/78 wrap-break-word">anyone up for 4v4? need two more</div>
            </div>
          </div>

          <div className="flex gap-[9px]">
            <div className="grid place-items-center size-[26px] flex-none rounded-lg bg-linear-150 from-[#ff6f9c] to-[#8c1f47] text-[11px] font-bold">L</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-ember-450">lunaBoom <span className="font-normal text-white/32">20:42</span></div>
              <div className="mt-0.5 text-[13px] leading-[1.45] text-white/78 wrap-break-word">Emerald Sprint has 2 slots, come</div>
            </div>
          </div>

          <div className="flex gap-[9px]">
            <div className="grid place-items-center size-[26px] flex-none rounded-lg bg-signal-500/20 text-[11px] font-bold">S</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-signal-400">SYSTEM <span className="font-normal text-white/32">20:43</span></div>
              <div className="mt-0.5 text-[13px] leading-[1.45] text-white/78 wrap-break-word">Season 1 rewards reset in 6d 4h.</div>
            </div>
          </div>

          <div className="flex gap-[9px]">
            <div className="grid place-items-center size-[26px] flex-none rounded-lg bg-linear-150 from-[#3bb0d8] to-[#153c56] text-[11px] font-bold">8</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#7fd4ff]">8bitVega <span className="font-normal text-white/32">20:44</span></div>
              <div className="mt-0.5 text-[13px] leading-[1.45] text-white/78 wrap-break-word">hit a 212 tail last round and still lost to a chain bomb</div>
            </div>
          </div>
        </div>

        {/* Input + enviar */}
        <div className="flex gap-2 px-4 pt-3 pb-4 border-t border-white/8">
          <input
            placeholder="Message the lobby"
            className="flex-1 min-w-0 px-3.5 py-[11px] rounded-[11px] border border-white/14 bg-surface-input text-[13px] text-white outline-none"
          />
          <button className="grid place-items-center w-[42px] flex-none rounded-[11px] bg-fuse-600 text-white cursor-pointer hover:bg-fuse-650">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
