import type { CSSProperties } from 'react'

import './animated-worm.css'

const SEGMENTS = 5

type AnimatedWormProps = { variant?: 'compact' | 'hero' }

export default function AnimatedWorm({ variant = 'compact' }: AnimatedWormProps) {
  return (
    <div
      className={`animated-worm animated-worm--${variant}`}
      role="img"
      aria-label="Animated worm, the game's character"
    >
      <img
        className="animated-worm__head"
        src="/assets/worm-head.png"
        alt=""
        aria-hidden="true"
      />
      <div className="animated-worm__body">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <img
            key={index}
            className="animated-worm__segment"
            src="/assets/worm-body.png"
            alt=""
            aria-hidden="true"
            style={
              {
                '--segment-index': index,
                '--segment-delay': `${index * -0.17}s`,
                '--segment-left': `${index * 14 - index * index * .6}%`,
                '--segment-top': `${-(index * 3 + index * index)}%`,
                '--segment-angle': `${index * -6}deg`,
                '--segment-lift': `${-6 + index * 1.25}%`,
                '--segment-tilt': `${3 - index * .65}deg`,
                '--segment-scale': `${(1 - index * .1).toFixed(2)}`,
                '--segment-z': SEGMENTS - index,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <img
        className="animated-worm__tail"
        src="/assets/worm-tail.png"
        alt=""
        aria-hidden="true"
      />
    </div>
  )
}
