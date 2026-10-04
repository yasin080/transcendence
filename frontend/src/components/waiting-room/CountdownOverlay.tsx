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
        className="absolute size-130 rounded-full bg-[radial-gradient(circle,rgba(255,155,47,.3)_0%,rgba(255,46,91,.12)_45%,rgba(7,6,26,0)_70%)]"
      />
      <div className="relative flex flex-col items-center gap-1.5 text-center text-white">
        <div className="text-eyebrow">Match starts in</div>
        <div className="display-hero text-[220px] [text-shadow:0_0_46px_rgba(255,46,91,.55)]">
          {n}
        </div>
      </div>
    </div>
  )
}