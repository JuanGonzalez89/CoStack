import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCatalog() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64 bg-border/40" />
        <Skeleton className="h-4 w-full max-w-xl bg-border/40" />
        <Skeleton className="h-4 w-3/4 max-w-lg bg-border/40" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl bg-border/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col p-6 rounded-2xl border border-border bg-card overflow-hidden h-[240px]"
          >
            <div className="flex items-start gap-4 mb-6">
              <Skeleton className="w-14 h-14 rounded-2xl bg-border/40 shrink-0" />
              <div className="pt-1 w-full space-y-2">
                <Skeleton className="h-3 w-16 bg-border/40" />
                <Skeleton className="h-5 w-32 bg-border/40" />
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border flex items-end justify-between mb-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-border/40" />
                <Skeleton className="h-8 w-20 bg-border/40" />
              </div>
              <Skeleton className="h-6 w-16 rounded-lg bg-border/40" />
            </div>
            
            <Skeleton className="w-full h-12 rounded-xl bg-border/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
