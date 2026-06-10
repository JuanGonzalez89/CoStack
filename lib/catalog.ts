import {
  MessageSquare, Pen, GitBranch, Code
} from "lucide-react"
import type { ElementType } from "react"

export interface CatalogItem {
  id: string
  name: string
  provider: string
  pricePerMonth: number
  originalPrice: number
  monthlyCost: number
  availableSeats: number
  icon: ElementType
  iconBg: string
  iconColor: string
  category: "AI" | "Design" | "IDE"
  providerUrl: string
}

const PROVIDER_URLS: Record<string, string> = {
  "GitHub": "https://github.com",
  "JetBrains": "https://jetbrains.com",
  "OpenAI": "https://chat.openai.com",
  "Figma Inc.": "https://figma.com",
  "Midjourney": "https://midjourney.com",
  "Vercel": "https://vercel.com",
  "Canva": "https://canva.com",
  "Anthropic": "https://claude.ai",
}

export const CATALOG: CatalogItem[] = [
  { id: "copilot",    name: "GitHub Copilot",   provider: "GitHub",    pricePerMonth: 5,  originalPrice: 10, monthlyCost: 10, availableSeats: 2,  icon: GitBranch,    iconBg: "bg-slate-200/50",   iconColor: "text-slate-700",   category: "AI",     providerUrl: PROVIDER_URLS["GitHub"] },
  { id: "jetbrains",  name: "All Products Pack", provider: "JetBrains", pricePerMonth: 8,  originalPrice: 28, monthlyCost: 28, availableSeats: 1,  icon: Code,         iconBg: "bg-rose-500/10",     iconColor: "text-rose-500",    category: "IDE",   providerUrl: PROVIDER_URLS["JetBrains"] },
  { id: "chatgpt",    name: "ChatGPT Team",      provider: "OpenAI",    pricePerMonth: 15, originalPrice: 30, monthlyCost: 30, availableSeats: 4,  icon: MessageSquare,iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500", category: "AI",   providerUrl: PROVIDER_URLS["OpenAI"] },
  { id: "figma",      name: "Figma Org",         provider: "Figma Inc.",pricePerMonth: 12, originalPrice: 45, monthlyCost: 45, availableSeats: 5,  icon: Pen,          iconBg: "bg-violet-500/10",   iconColor: "text-violet-500",  category: "Design", providerUrl: PROVIDER_URLS["Figma Inc."] },
  { id: "midjourney", name: "Midjourney Pro",    provider: "Midjourney",pricePerMonth: 15, originalPrice: 60, monthlyCost: 60, availableSeats: 4,  icon: Pen,          iconBg: "bg-fuchsia-500/10",  iconColor: "text-fuchsia-500", category: "AI",  providerUrl: PROVIDER_URLS["Midjourney"] },
  { id: "vercel",     name: "Vercel Pro",        provider: "Vercel",    pricePerMonth: 5,  originalPrice: 20, monthlyCost: 20, availableSeats: 4,  icon: Code,         iconBg: "bg-slate-100/10",    iconColor: "text-slate-100",  category: "IDE",   providerUrl: PROVIDER_URLS["Vercel"] },
  { id: "canva",      name: "Canva Pro Team",    provider: "Canva",     pricePerMonth: 6,  originalPrice: 30, monthlyCost: 30, availableSeats: 5,  icon: Pen,          iconBg: "bg-blue-500/10",     iconColor: "text-blue-500",    category: "Design", providerUrl: PROVIDER_URLS["Canva"] },
]

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === slug)
}
