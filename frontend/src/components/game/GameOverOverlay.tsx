interface GameOverOverlayProps {
  kicker?: string
  title: string
}

export default function GameOverOverlay({ kicker, title }: GameOverOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center px-4">
      <div className="flex flex-col items-center gap-3 text-center text-white [text-shadow:0_4px_24px_var(--color-void)]">
        {kicker && <div className="display-heading">{kicker}</div>}
        <div className="display-hero text-7xl uppercase break-words sm:text-9xl">{title}</div>
      </div>
    </div>
  )
}
