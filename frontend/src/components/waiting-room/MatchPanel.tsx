import type { MatchSetting } from './types.ts'
import waitingRoom from '../../assets/waiting-room.png'
import Button from '../ui/Button.tsx'

interface MatchPanelProps {
  isOwner: boolean
  settings: MatchSetting[]
  canStart: boolean
  onStart: () => void
  onLeave: () => void
}

export default function MatchPanel({ isOwner, settings, canStart, onStart, onLeave }: MatchPanelProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-line bg-surface md:aspect-21/9 md:max-h-120 xl:grid xl:aspect-auto xl:max-h-none xl:grid-cols-[1fr_auto]">
      <div className="relative aspect-video md:absolute md:inset-0 md:aspect-auto xl:relative xl:inset-auto xl:col-start-1 xl:row-start-1 xl:aspect-auto xl:h-[clamp(20rem,42vh,32rem)]">
        <img src={waitingRoom} alt="" className="size-full object-cover object-[center_35%]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-surface to-transparent md:h-1/2 md:from-void/95 md:via-void/60 xl:h-1/3"
        />
      </div>

      {/* At xl this wrapper disappears (contents) and its children join the parent grid */}
      <div className="relative flex flex-wrap items-end gap-x-8 gap-y-5 px-5 pb-6 sm:px-7 md:absolute md:inset-x-0 md:bottom-0 xl:contents">
        <div className="min-w-0 flex-1 xl:col-start-2 xl:row-start-1 xl:border-l xl:border-line xl:px-4 xl:py-5">
          <div className="text-eyebrow">Match settings</div>
          <div className="mt-3 flex flex-wrap gap-2 xl:flex-col xl:flex-nowrap xl:gap-1.5">
            {settings.map((s) => (
              <SettingChip key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-none flex-col gap-3 sm:w-auto sm:flex-row sm:items-center xl:relative xl:col-start-1 xl:row-start-1 xl:self-end xl:justify-self-start xl:p-7">
          {isOwner && (
            <Button
              onClick={onStart}
              disabled={!canStart}
              className="w-full sm:w-auto motion-safe:enabled:animate-boom-pulse"
            >
              Start match
            </Button>
          )}
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onLeave}>
            Leave room
          </Button>
        </div>
      </div>
    </section>
  )
}

function SettingChip({ label, value }: MatchSetting) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-void/70 py-1.75 pr-3 pl-2.25 leading-[1.15] backdrop-blur-sm xl:flex-row xl:items-center xl:justify-between xl:gap-4 xl:px-2.5 xl:py-1.5">
      <span className="text-micro-label text-fg-muted">{label}</span>
      <span className="text-meta">{value}</span>
    </div>
  )
}
