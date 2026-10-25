import { SNAKE, type Settings } from '../../game/logic/settings.ts'

export interface Option<T> {
  label: string
  value: T
}

// Lo que el host elige al crear la sala; el resto de Settings sale de los de base.
// boardSize se convierte en width y height (tablero cuadrado).
export type RoomChoices = Pick<
  Settings,
  'players' | 'tickMs' | 'food' | 'bombs' | 'pillars' | 'softWalls' | 'startLength' | 'wallHit' | 'bodyHit' | 'botMistakes'
> & {
  boardSize: number
}

// Opciones numéricas de min a max: range(1, 4) → 1, 2, 3, 4
function range(min: number, max: number, step = 1, label: (n: number) => string = String): Option<number>[] {
  return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
    const value = min + i * step
    return { label: label(value), value }
  })
}

export const PLAYER_OPTIONS = range(1, 4)

export const BOARD_OPTIONS: Option<number>[] = [
  { label: 'Small', value: 20 },
  { label: 'Medium', value: 35 },
  { label: 'Large', value: 50 },
]

// tickMs: menos milisegundos por paso = gusano más rápido, por eso va de 300 a 100
export const SPEED_OPTIONS = range(100, 300, 25, (ms) => `${ms} ms`).reverse()

export const FOOD_OPTIONS = range(1, 50)

export const BOMB_OPTIONS = range(1, 10)
export const BOMBS_ON = 3

// Porcentaje de ticks en que un bot no mira por dónde va: más alto, más fácil de ganar
export const BOT_MISTAKE_OPTIONS = range(20, 80, 5, (n) => `${n}%`)

// Proporción de muros rompibles: de 0 a 0.05
export const SOFT_WALL_OPTIONS = range(0, 5, 1, (n) => `${n}%`).map(({ label, value }) => ({ label, value: value / 100 }))

// El largo inicial crece con el tablero: el 30 % del lado (20 → 6, 35 → 10, 50 → 15)
export const maxStartLength = (boardSize: number) => Math.floor((boardSize * 3) / 10)
export const startLengthOptions = (boardSize: number) => range(1, maxStartLength(boardSize))

// Un preset fija todo menos el número de jugadores; luego se puede retocar cada valor.
export interface Preset {
  label: string
  choices: Omit<RoomChoices, 'players'>
}

export const PRESETS: Preset[] = [
  {
    // El clásico: una comida, sin bombas ni obstáculos, cualquier choque mata
    label: 'Classic',
    choices: { boardSize: 35, tickMs: 175, food: 1, bombs: 0, pillars: false, softWalls: 0, startLength: 3, wallHit: 'die', bodyHit: 'die', botMistakes: 50 },
  },
  {
    // Intermedio: algo de comida y bombas, y chocar con otro gusano solo frena
    label: 'Arena',
    choices: { boardSize: 35, tickMs: 175, food: 3, bombs: 2, pillars: false, softWalls: 0.02, startLength: 3, wallHit: 'die', bodyHit: 'block', botMistakes: 40 },
  },
  {
    // Intermedio con pilares: los muros frenan, así que se gana con bombas
    label: 'Maze',
    choices: { boardSize: 35, tickMs: 125, food: 5, bombs: 4, pillars: true, softWalls: 0, startLength: 3, wallHit: 'block', bodyHit: 'block', botMistakes: 30 },
  },
  {
    // Todo al máximo: rápido, lleno de bombas, comida y paredes, y todo mata
    label: 'Hardcore',
    choices: { boardSize: 35, tickMs: 125, food: 15, bombs: 10, pillars: false, softWalls: 0.05, startLength: 6, wallHit: 'die', bodyHit: 'die', botMistakes: 20 },
  },
]

export const DEFAULT_CHOICES: RoomChoices = { players: 2, ...PRESETS[0].choices }

// El preset que coincide con lo elegido; ninguno si se ha retocado algo
export function presetOf(choices: RoomChoices): Preset | undefined {
  return PRESETS.find((preset) =>
    Object.entries(preset.choices).every(([key, value]) => choices[key as keyof RoomChoices] === value),
  )
}

// Etiqueta de un valor guardado: labelFor(BOARD_OPTIONS, 35) → 'Medium'
export function labelFor<T>(options: Option<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value)
}

// Settings completos que exige el backend: los de base y encima lo elegido
export function toSettings({ boardSize, ...rest }: RoomChoices): Settings {
  return { ...SNAKE, ...rest, width: boardSize, height: boardSize }
}

// Partida rápida: el preset elegido con la sala llena, tú y tres bots
export const quickMatchSettings = (preset: Preset): Settings => toSettings({ players: 4, ...preset.choices })
