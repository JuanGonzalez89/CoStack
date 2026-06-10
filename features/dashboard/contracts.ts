export type AccessState = 'current' | 'overdue' | 'blocked'

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export type SeatStatus = PaymentStatus | 'free' | 'assigned'

export type StatusBadgeStatus = PaymentStatus | 'idle' | 'blocked' | 'free' | 'assigned'

export type ToolCardState = 'pending' | 'paying' | 'assigning' | 'assigned' | 'lobby'

export type ToolAccent = 'orange' | 'violet' | 'cyan'

export type ViewFilter = 'all' | 'organizer' | 'member'

export type CommunityFilter = 'all' | 'mine' | 'saved'

export interface DashboardMemberSnapshot {
  role: string
  status: string
  user: { name: string | null; email: string }
}

export interface DashboardSeatSnapshot {
  id: string
  status: SeatStatus
  accessToken: string | null
  tool: { slug: string; name: string; provider: string; monthlyCost: number }
}

export interface DashboardPaymentSnapshot {
  id: string
  amount: string | number
  status: PaymentStatus
  createdAt: string
  user: { name: string | null; email: string }
  tool: { slug: string; name: string; provider: string; monthlyCost: number }
  providerRef: string | null
}

export interface DashboardPostSnapshot {
  id: string
  content: string
  likes: number
  reposts: number
  createdAt: string
  user: { name: string | null; email: string }
}

export interface DashboardBotEventSnapshot {
  id: string
  type: string
  message: string
  createdAt: string
}

export interface DashboardGroupSnapshot {
  name: string
  inviteCode: string
  members: DashboardMemberSnapshot[]
  seats: DashboardSeatSnapshot[]
  payments: DashboardPaymentSnapshot[]
  posts: DashboardPostSnapshot[]
  botEvents: DashboardBotEventSnapshot[]
}

export interface DashboardSnapshot {
  totals: {
    groups: number
    memberships: number
    payments: number
    seats: number
    posts: number
    botEvents: number
  }
  latestGroup: DashboardGroupSnapshot | null
  activeGroups: DashboardGroupSnapshot[]
}

export interface ToolCardData {
  id: string
  name: string
  provider: string
  monthlyCost: number
  seatsUsed: number
  seatsTotal: number
  status: ToolCardState
  accent: ToolAccent
  iconLabel: string
  accessToken?: string | null
  providerUrl?: string
  lobbyId?: string
  lobbyFilled?: number
  lobbyTotal?: number
}

export interface SeatAccessCardData {
  seatId?: string
  accessState: AccessState
  groupName: string
  accessToken: string
}