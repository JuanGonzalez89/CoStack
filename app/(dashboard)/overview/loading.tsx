import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingOverview() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-2 w-full">
          <Skeleton className="h-10 w-64 bg-border/40" />
          <Skeleton className="h-4 w-96 bg-border/40" />
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-xl bg-border/40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-border/40" />
                <Skeleton className="h-8 w-32 bg-border/40" />
              </div>
            </div>
          ))}
        </div>
        
        <Skeleton className="w-full h-[300px] rounded-3xl bg-border/40" />
      </div>
    </div>
  )
}