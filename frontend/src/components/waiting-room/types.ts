interface PlayerBase {
  id: string
  name: string
  isOwner: boolean
}

export interface HumanPlayer extends PlayerBase {
  isBot: false
  avatar: string | null
}

export interface BotPlayer extends PlayerBase {
  isBot: true
}

export type Player = HumanPlayer | BotPlayer

export interface MatchSetting {
  label: string
  value: string
}