import { useState } from 'react'
import { Link } from 'react-router'

import { generateBoard } from '../game/board'
import GameCanvas from '../game/GameCanvas'

export default function Game() {
  const [board] = useState(generateBoard)

  return (
    <div className="relative h-screen overflow-hidden bg-void text-white">
      <GameCanvas board={board} />

      <Link
        to="/dashboard"
        className="absolute left-4 top-4 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-sm text-fg-secondary backdrop-blur-sm transition hover:border-line-strong hover:text-white"
      >
        ← Back to lobby
      </Link>
    </div>
  )
}
