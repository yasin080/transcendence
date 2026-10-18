import { SNAKE, type Settings } from '../../game/logic/settings.ts'

export interface Option<T> {
  label: string
  value: T
}

// Lo que el host elige al crear la sala; el resto de Settings sale de SNAKE.
// boardSize se convierte en width y height (tablero cuadrado).
export type RoomChoices = Pick<Settings, 'players' | 'tickMs' | 'food' | 'wrap' | 'pillars'> & {
  boardSize: number
}

export const PLAYER_OPTIONS: Option<number>[] = [1, 2, 3, 4].map((n) => ({ label: String(n), value: n }))

export const BOARD_OPTIONS: Option<number>[] = [
  { label: 'Small', value: 20 },
  { label: 'Medium', value: 30 },
  { label: 'Large', value: 45 },
]

// tickMs: menos milisegundos por paso = gusano más rápido
export const SPEED_OPTIONS: Option<number>[] = [
  { label: 'Slow', value: 200 },
  { label: 'Normal', value: 150 },
  { label: 'Fast', value: 100 },
]

export const FOOD_OPTIONS: Option<number>[] = [1, 5, 15].map((n) => ({ label: String(n), value: n }))

export const DEFAULT_CHOICES: RoomChoices = {
  players: 2,
  boardSize: 30,
  tickMs: 150,
  food: 1,
  wrap: false,
  pillars: false,
}

// Etiqueta de un valor guardado: labelFor(BOARD_OPTIONS, 30) → 'Medium'
export function labelFor<T>(options: Option<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value)
}

// Settings completos que exige el backend: SNAKE de base y encima lo elegido
export function toSettings({ boardSize, ...rest }: RoomChoices): Settings {
  return { ...SNAKE, ...rest, width: boardSize, height: boardSize }
}
