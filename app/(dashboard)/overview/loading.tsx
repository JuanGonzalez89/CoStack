export default function OverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-44 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />
        <div className="h-44 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />
      </div>
      <div className="h-48 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />
    </div>
  )
}