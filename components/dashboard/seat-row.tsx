import { User, MoreHorizontal, Copy, Trash2, Share, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from './status-badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { StatusBadgeStatus } from '@/features/dashboard/contracts'
import { cn } from '@/lib/utils'

interface SeatRowProps {
  name: string
  status: StatusBadgeStatus | 'free'
  isOrganizer?: boolean
  email?: string
}

export function SeatRow({ name, status, isOrganizer = false, email }: SeatRowProps) {
  const isFree = status === 'free'
  
  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors rounded-xl mx-2 my-1">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
          isFree ? "bg-white/5 text-slate-500 border border-dashed border-white/10" : "bg-cyan-500/20 text-cyan-200"
        )}>
          {isFree ? "—" : name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className={cn("text-sm", isFree ? "text-zinc-500 italic" : "text-zinc-50 font-medium")}>
            {name}
          </span>
          {isOrganizer && email && !isFree && (
            <span className="text-xs text-zinc-500">{email}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isFree ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800">
            Libre
          </span>
        ) : (
          <StatusBadge status={status as StatusBadgeStatus} />
        )}

        {isOrganizer && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800 text-zinc-300">
              {isFree ? (
                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer">
                  <Share className="mr-2 h-4 w-4" />
                  Publicar
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Email
                  </DropdownMenuItem>
                  {status === 'blocked' && (
                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer text-emerald-500 focus:text-emerald-400">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Liberar
                    </DropdownMenuItem>
                  )}
                  {status !== 'assigned' && status !== 'blocked' && (
                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer text-red-500 focus:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Revocar
                    </DropdownMenuItem>
                  )}
                  {status === 'assigned' && (
                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer text-amber-500 focus:text-amber-400">
                      <Share className="mr-2 h-4 w-4" />
                      Reportar Incidencia
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
