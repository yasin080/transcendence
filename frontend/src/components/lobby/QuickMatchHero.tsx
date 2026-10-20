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
      <div aria-hidden="true" className="absolute inset-0 bg-linear-180 from-void/70 to-void/90 sm:bg-linear-95 sm:from-void/96 sm:via-void/80 sm:via-44% sm:to-void/15" />

      <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-5 py-6.5 sm:px-7">
        <div className="w-full min-w-0 text-center sm:w-auto sm:flex-1 sm:text-left">
          <p className="text-eyebrow">Quick match</p>
          <h2 className="mt-2 font-display text-2xl leading-[1.05] sm:text-[30px]">Drop into a live arena</h2>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {modes.map((mode) => (
              <ToggleChip key={mode} selected={mode === selectedMode} onClick={() => onSelectMode(mode)}>
                {mode}
              </ToggleChip>
            ))}
          </div>
        </div>

        <Button variant="arcade" size="xl" pulse className="w-full flex-none sm:w-auto" disabled={!canPlay} onClick={onPlay}>
          Play now
        </Button>
      </div>
    </section>
  )
}
