import { useEffect, useState } from 'react'

interface CountdownOverlayProps {
  from: number
  onDone: () => void
}

export default function CountdownOverlay({ from, onDone }: CountdownOverlayProps) {
  const [n, setN] = useState(from)

  useEffect(() => {
    if (n <= 1) {
      const t = setTimeout(onDone, 1000)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setN((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [n, onDone])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-void/84 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="absolute size-130 rounded-full bg-radial from-[#ff9b2f]/30 via-fuse-600/12 via-45% to-void/0 to-70%"
      />
      <div className="relative flex flex-col items-center gap-1.5 text-center text-white">
        <div className="text-eyebrow">Match starts in</div>
        <div className="display-hero text-[220px] [text-shadow:0_0_46px_color-mix(in_srgb,var(--color-fuse-600)_55%,transparent)]">
          {n}
        </div>
      </div>
    </div>
  )
}