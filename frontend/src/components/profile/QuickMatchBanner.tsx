import Button from '../ui/Button.tsx'

interface QuickMatchBannerProps {
  onPlay: () => void
}

// Banner del perfil propio: invita a jugar para subir las estadísticas.
// Mismo aspecto que el hero del Lobby (candidato a compartir en una revisión).
export default function QuickMatchBanner({ onPlay }: QuickMatchBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      {/* Capas de fondo: imagen y velo para que el texto se lea */}
      <div className="absolute inset-0 bg-[url(/arena.webp)] bg-cover bg-center opacity-55" />
      <div className="absolute inset-0 bg-linear-95 from-void/96 via-void/80 via-44% to-void/15" />

      {/* Contenido */}
      <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-7 py-6.5">
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow">Quick match</p>
          <h2 className="mt-2 display-heading">Push those numbers up</h2>
          <p className="mt-2 text-body-muted">Every finished match counts towards your stats.</p>
        </div>

        <Button variant="arcade" size="xl" pulse onClick={onPlay}>
          Play now
        </Button>
      </div>
    </div>
  )
}