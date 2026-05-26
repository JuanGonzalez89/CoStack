import { cn } from "@/lib/utils"

export type RoleFilterOption = "all" | "organizer" | "member" | "all_posts" | "my_posts" | "saved" | string

interface FilterOption {
  value: string
  label: string
}

interface RoleFilterBarProps {
  value: string
  onChange: (value: string) => void
  options?: FilterOption[]
  className?: string
}

const defaultOptions: FilterOption[] = [
  { value: "all", label: "Todas" },
  { value: "organizer", label: "Como organizador" },
  { value: "member", label: "Como miembro" },
]

export function RoleFilterBar({ value, onChange, options = defaultOptions, className }: RoleFilterBarProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            value === option.value
              ? "bg-zinc-800 text-zinc-50 shadow-sm"
              : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
