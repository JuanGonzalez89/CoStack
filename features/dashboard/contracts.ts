export type AccessState = 'current' | 'blocked'

export type PaymentStatus = 'paid' | 'pending' | 'failed'

export type SeatStatus = PaymentStatus | 'free' | 'assigned'

export type StatusBadgeStatus = PaymentStatus | 'idle' | 'blocked' | 'free' | 'assigned'

export type ToolCardState = 'pending' | 'paying' | 'assigning' | 'assigned'

export type ToolAccent = 'orange' | 'violet' | 'cyan'

export type ViewFilter = 'all' | 'organizer' | 'member'

export type CommunityFilter = 'all' | 'mine' | 'saved'

export interface DashboardMemberSnapshot {
  role: string
  status: string
  user: { id: string; name: string | null; email: string }
}

export interface DashboardSeatSnapshot {
  id: string
  status: SeatStatus
  assigneeId?: string | null
  accessToken: string | null
  tool: { id: string; slug: string; name: string; provider: string; monthlyCost: number; marketPrice?: number | null }
}

export interface DashboardPaymentSnapshot {
  id: string
  amount: string | number
  status: PaymentStatus
  createdAt: Date | string
  user: { id: string; name: string | null; email: string }
  tool: { id: string; slug: string; name: string; provider: string; monthlyCost: number }
  providerRef: string | null
}

export interface DashboardPostSnapshot {
  id: string
  content: string
  likes: number
  reposts: number
  createdAt: Date | string
  user: { id: string; name: string | null; email: string }
}

export interface DashboardBotEventSnapshot {
  id: string
  type: string
  message: string
  createdAt: Date | string
}

export interface DashboardGroupSnapshot {
  id: string
  name: string
  inviteCode: string
  automatchEnabled?: boolean
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
  activeGroups?: DashboardGroupSnapshot[]
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
}

export interface SeatAccessCardData {
  seatId?: string
  accessState: AccessState
  groupName: string
  accessToken: string
}