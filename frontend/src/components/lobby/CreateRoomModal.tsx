import Modal from '../ui/Modal.tsx'

interface CreateRoomModalProps {
  onClose: () => void
}

// [RETOMAR] Formulario aún decorativo (sin estado); se conecta en otro paso
export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  return (
    <Modal size="lg" onClose={onClose}>
      <h3 className="font-display text-xl">Create custom match</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-[18px]">
        <label>
          <span className="block mb-[7px] text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Room name</span>
          <input
            defaultValue="serpientitas"
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
    </Modal>
  )
}
