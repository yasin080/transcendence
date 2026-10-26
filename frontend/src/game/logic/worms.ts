export type Point = { x: number; y: number }

export type Worm = {
  name: string
  colour: string
  body: Point[]
  dir: Point
  wanted: Point
  alive: boolean
  /** Ticks in a row it has been blocked. */
  stuck: number
  away?: boolean
}
