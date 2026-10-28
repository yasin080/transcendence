// Friendship types, shared by the profile and the friends panel

export type OnlineStatus = 'online' | 'offline'

// Relationship between the viewer and another player (friend button)
export type FriendState = 'none' | 'sent' | 'received' | 'friends'

// The minimum needed to show a friend in a list or grid
export interface FriendSummary {
  id: string
  username: string
  avatarUrl: string | null // null = default avatar
  status: OnlineStatus
}

// The panel's three lists
export interface FriendsPanelData {
  friends: FriendSummary[]
  received: FriendSummary[]
  sent: FriendSummary[]
}

// A search result: the player and my relationship with them
export interface SearchResult extends FriendSummary {
  friendState: FriendState
}