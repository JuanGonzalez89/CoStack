const store = new Map<string, { virtualSeats: number; lastAddAt: number }>()

const MOCK_INTERVAL = 10_000

export function getMockState(lobbyId: string, realCount: number, totalSeats: number): { virtualSeats: number } {
  let state = store.get(lobbyId)
  const now = Date.now()

  if (!state) {
    state = { virtualSeats: 1, lastAddAt: now }
    store.set(lobbyId, state)
  }

  const elapsed = now - state.lastAddAt
  const totalCount = realCount + state.virtualSeats

  if (totalCount < totalSeats && elapsed >= MOCK_INTERVAL) {
    const slotsToAdd = Math.min(
      Math.floor(elapsed / MOCK_INTERVAL),
      totalSeats - totalCount,
    )
    state.virtualSeats += slotsToAdd
    state.lastAddAt = now
  }

  return { virtualSeats: state.virtualSeats }
}

export function clearMockState(lobbyId: string) {
  store.delete(lobbyId)
}
