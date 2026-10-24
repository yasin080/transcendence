export type Difficulty = 'easy' | 'medium' | 'hard'

interface PlayerBase {
  id: string
  name: string
  isOwner: boolean
}

export interface HumanPlayer extends PlayerBase {
  isBot: false
  winPct: string
  avgScore: string
  avatar: string | null
}

export interface BotPlayer extends PlayerBase {
  isBot: true
  difficulty: Difficulty
}

export type Player = HumanPlayer | BotPlayer

export interface Room {
  name: string
  hostName: string
  modeLabel: string
}

export interface MatchSetting {
  label: string
  value: string
}