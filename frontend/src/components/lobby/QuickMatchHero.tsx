import Button from '../ui/Button.tsx'
import ToggleChip from '../ui/ToggleChip.tsx'

interface QuickMatchHeroProps<M extends string> {
  modes: readonly M[]
  selectedMode: M
  onSelectMode: (mode: M) => void
  canPlay?: boolean
  onPlay: () => void
}

export default function QuickMatchHero<M extends string>({
  modes,
  selectedMode,
  onSelectMode,
  canPlay = true,
  onPlay,
}: QuickMatchHeroProps<M>) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-line bg-surface">
      {/* Capas de fondo: la imagen y un degradado para que el texto se lea */}
      <div aria-hidden="true" className="absolute inset-0 bg-[url(/assets/background.png)] bg-cover bg-center opacity-55" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-95 from-void/96 via-void/80 via-44% to-void/15" />

      <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-7 py-6.5">
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow">Quick match</p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05]">Drop into a live arena</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {modes.map((mode) => (
              <ToggleChip key={mode} selected={mode === selectedMode} onClick={() => onSelectMode(mode)}>
                {mode}
              </ToggleChip>
            ))}
          </div>
        </div>

        <Button variant="arcade" size="xl" pulse className="flex-none" disabled={!canPlay} onClick={onPlay}>
          Play now
        </Button>
      </div>
    </section>
  )
}
