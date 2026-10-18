import { useEffect, useState } from 'react'

import type { Controls } from '../../game/logic/settings'
import { isTouch } from '../../game/touch'

interface CountdownOverlayProps {
  endsAt: number
  controls: Controls
  onDone: () => void
}

export default function CountdownOverlay({ endsAt, controls, onDone }: CountdownOverlayProps) {
  const [now, setNow] = useState(Date.now)
  const secondsLeft = Math.ceil((endsAt - now) / 1000)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) onDone()
  }, [secondsLeft, onDone])

  if (secondsLeft <= 0) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-void/84 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="absolute size-130 rounded-full bg-radial from-[#ff9b2f]/30 via-fuse-600/12 via-45% to-void/0 to-70%"
      />
      <div className="relative flex flex-col items-center gap-1.5 text-center text-white">
        <div className="text-eyebrow">Match starts in</div>
        <div className="display-hero text-[220px] [text-shadow:0_0_46px_color-mix(in_srgb,var(--color-fuse-600)_55%,transparent)]">
          {secondsLeft}
        </div>
        {isTouch && (
          <div className="text-body-muted">{controls === 'turn' ? 'Tap left or right to turn' : 'Swipe to change direction'}</div>
        )}
      </div>
    </div>
  )
}
