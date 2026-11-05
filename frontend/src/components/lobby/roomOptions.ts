import { SNAKE, type Camera, type Settings } from '../../game/logic/settings.ts'

export interface Option<T> {
  label: string
  value: T
}

// What the host picks when creating the room; the rest of Settings comes from the base ones.
// boardSize becomes width and height (square board).
export type RoomChoices = Pick<
  Settings,
  'players' | 'tickMs' | 'food' | 'bombs' | 'pillars' | 'softWalls' | 'startLength' | 'wallHit' | 'bodyHit' | 'botMistakes' | 'camera'
> & {
  boardSize: number
}

// Numeric options from min to max: range(1, 4) → 1, 2, 3, 4
function range(min: number, max: number, step = 1, label: (n: number) => string = String): Option<number>[] {
  return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
    const value = min + i * step
    return { label: label(value), value }
  })
}

export const PLAYER_OPTIONS = range(1, 4)

// What each player sees; a spectator always sees the whole board
export const CAMERA_OPTIONS: Option<Camera>[] = [
  { label: 'Whole board', value: 'board' },
  { label: 'Follow', value: 'follow' },
  { label: 'Behind the head', value: 'head' },
]

// Odd side: with an even one, seat 2 spawns facing a pillar (pillars sit on even x and y)
export const BOARD_OPTIONS: Option<number>[] = [
  { label: 'Small', value: 21 },
  { label: 'Medium', value: 35 },
  { label: 'Large', value: 51 },
]

// tickMs: fewer milliseconds per step = faster worm, which is why it goes from 300 to 100
export const SPEED_OPTIONS = range(100, 300, 25, (ms) => `${ms} ms`).reverse()

export const FOOD_OPTIONS = range(1, 50)

export const BOMB_OPTIONS = range(1, 10)
export const BOMBS_ON = 3

// Percentage of ticks in which a bot doesn't look where it's going: higher means easier to win
export const BOT_MISTAKE_OPTIONS = range(20, 80, 5, (n) => `${n}%`)

// Share of random walls: from 0 to 0.05
export const SOFT_WALL_OPTIONS = range(0, 5, 1, (n) => `${n}%`).map(({ label, value }) => ({ label, value: value / 100 }))

// The start length grows with the board: 30% of the side (21 → 6, 35 → 10, 51 → 15)
export const maxStartLength = (boardSize: number) => Math.floor((boardSize * 3) / 10)
export const startLengthOptions = (boardSize: number) => range(1, maxStartLength(boardSize))

// A preset sets everything except players and camera; each value can be tweaked afterwards.
export interface Preset {
  label: string
  choices: Omit<RoomChoices, 'players' | 'camera'>
}

export const PRESETS: Preset[] = [
  {
    // The classic: one food, no bombs or obstacles, any crash kills
    label: 'Classic',
    choices: { boardSize: 35, tickMs: 175, food: 1, bombs: 0, pillars: false, softWalls: 0, startLength: 3, wallHit: 'die', bodyHit: 'die', botMistakes: 50 },
  },
  {
    // Intermediate: some food and bombs, and hitting another worm only stops you
    label: 'Arena',
    choices: { boardSize: 35, tickMs: 175, food: 3, bombs: 2, pillars: false, softWalls: 0.02, startLength: 3, wallHit: 'die', bodyHit: 'block', botMistakes: 40 },
  },
  {
    // Intermediate with pillars: walls stop you, so you win with bombs
    label: 'Maze',
    choices: { boardSize: 35, tickMs: 125, food: 5, bombs: 4, pillars: true, softWalls: 0, startLength: 3, wallHit: 'block', bodyHit: 'block', botMistakes: 30 },
  },
  {
    // Everything maxed out: fast, full of bombs, food and walls, and everything kills
    label: 'Hardcore',
    choices: { boardSize: 35, tickMs: 125, food: 15, bombs: 10, pillars: false, softWalls: 0.05, startLength: 6, wallHit: 'die', bodyHit: 'die', botMistakes: 20 },
  },
]

export const DEFAULT_CHOICES: RoomChoices = { players: 2, camera: 'board', ...PRESETS[0].choices }

// The preset matching the current choice; none if anything has been tweaked
export function presetOf(choices: RoomChoices): Preset | undefined {
  return PRESETS.find((preset) =>
    Object.entries(preset.choices).every(([key, value]) => choices[key as keyof RoomChoices] === value),
  )
}

// Label for a stored value: labelFor(BOARD_OPTIONS, 35) → 'Medium'
export function labelFor<T>(options: Option<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value)
}

// Full Settings the backend requires: the base ones with the choices on top
export function toSettings({ boardSize, ...rest }: RoomChoices): Settings {
  return { ...SNAKE, ...rest, width: boardSize, height: boardSize }
}

// Quick match: the chosen preset with a full room, you and three bots
export const quickMatchSettings = (preset: Preset): Settings => toSettings({ players: 4, camera: 'board', ...preset.choices })
