export interface DashboardSnapshot {
  totals: {
    groups: number
    memberships: number
    payments: number
    seats: number
    posts: number
    botEvents: number
  }
  latestGroup: {
    name: string
    inviteCode: string
    members: Array<{
      role: string
      status: string
      user: { name: string | null; email: string }
    }>
    seats: Array<{
      status: string
      accessToken: string | null
      tool: { name: string; provider: string }
    }>
    payments: Array<{
      id: string
      amount: string | number
      status: string
      createdAt: string
      user: { name: string | null; email: string }
      tool: { name: string; provider: string }
      providerRef: string | null
    }>
    posts: Array<{
      id: string
      content: string
      likes: number
      reposts: number
      createdAt: string
      user: { name: string | null; email: string }
    }>
    botEvents: Array<{
      id: string
      type: string
      message: string
      createdAt: string
    }>
  } | null
}