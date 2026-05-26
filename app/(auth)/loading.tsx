export default function AuthLoading() {
  return (
    <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm">
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-10 animate-pulse rounded-2xl bg-muted/70" />
      <div className="mt-4 h-10 animate-pulse rounded-2xl bg-muted/70" />
      <div className="mt-4 h-10 animate-pulse rounded-2xl bg-muted/70" />
      <div className="mt-6 h-12 animate-pulse rounded-2xl bg-muted/70" />
    </div>
  )
}