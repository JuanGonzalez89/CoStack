import {
  MessageSquare, Pen, GitBranch, Code, Sparkles, NotebookPen
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
  /**
   * "live" = tiene provisioning escalable y funciona para usuarios reales
   *          (API oficial o link de invitación, sin cookies/Playwright).
   * "soon" = todavía no tiene un provider escalable; se muestra como
   *          "Próximamente" y no se puede comprar.
   */
  status: "live" | "soon"
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
  "Hugging Face": "https://huggingface.co",
  "Notion": "https://notion.so",
}

export const CATALOG: CatalogItem[] = [
  // status "soon": el plan Team de Hugging Face se factura mensual y por asiento sin
  // descuento por volumen ni opcion anual (a diferencia de Canva/Notion), asi que no
  // encaja con el modelo de negocio de CoStack. El provisioner sigue implementado
  // (ver lib/provisioner/providers/huggingface.ts) como prueba tecnica, pero no se vende.
  { id: "huggingface",name: "HuggingChat Premium",provider: "Hugging Face",pricePerMonth: 5, originalPrice: 20, monthlyCost: 20, availableSeats: 3, icon: Sparkles, iconBg: "bg-amber-500/10", iconColor: "text-amber-500", category: "AI", providerUrl: PROVIDER_URLS["Hugging Face"], status: "soon" },
  { id: "copilot",    name: "GitHub Copilot",   provider: "GitHub",    pricePerMonth: 5,  originalPrice: 10, monthlyCost: 10, availableSeats: 2,  icon: GitBranch,    iconBg: "bg-slate-200/50",   iconColor: "text-slate-700",   category: "AI",     providerUrl: PROVIDER_URLS["GitHub"], status: "soon" },
  { id: "canva",      name: "Canva Pro Team",    provider: "Canva",     pricePerMonth: 6,  originalPrice: 30, monthlyCost: 30, availableSeats: 3,  icon: Pen,          iconBg: "bg-blue-500/10",     iconColor: "text-blue-500",    category: "Design", providerUrl: PROVIDER_URLS["Canva"], status: "live" },
  { id: "notion",     name: "Notion Team",       provider: "Notion",    pricePerMonth: 7,  originalPrice: 20, monthlyCost: 20, availableSeats: 4,  icon: NotebookPen,  iconBg: "bg-zinc-400/10",     iconColor: "text-zinc-300",    category: "Design", providerUrl: PROVIDER_URLS["Notion"], status: "live" },
  { id: "jetbrains",  name: "All Products Pack", provider: "JetBrains", pricePerMonth: 8,  originalPrice: 28, monthlyCost: 28, availableSeats: 1,  icon: Code,         iconBg: "bg-rose-500/10",     iconColor: "text-rose-500",    category: "IDE",   providerUrl: PROVIDER_URLS["JetBrains"], status: "soon" },
  { id: "chatgpt",    name: "ChatGPT Team",      provider: "OpenAI",    pricePerMonth: 15, originalPrice: 30, monthlyCost: 30, availableSeats: 4,  icon: MessageSquare,iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500", category: "AI",   providerUrl: PROVIDER_URLS["OpenAI"], status: "soon" },
  { id: "figma",      name: "Figma Org",         provider: "Figma Inc.",pricePerMonth: 12, originalPrice: 45, monthlyCost: 45, availableSeats: 5,  icon: Pen,          iconBg: "bg-violet-500/10",   iconColor: "text-violet-500",  category: "Design", providerUrl: PROVIDER_URLS["Figma Inc."], status: "soon" },
  { id: "midjourney", name: "Midjourney Pro",    provider: "Midjourney",pricePerMonth: 15, originalPrice: 60, monthlyCost: 60, availableSeats: 4,  icon: Pen,          iconBg: "bg-fuchsia-500/10",  iconColor: "text-fuchsia-500", category: "AI",  providerUrl: PROVIDER_URLS["Midjourney"], status: "soon" },
  { id: "vercel",     name: "Vercel Pro",        provider: "Vercel",    pricePerMonth: 5,  originalPrice: 20, monthlyCost: 20, availableSeats: 4,  icon: Code,         iconBg: "bg-slate-100/10",    iconColor: "text-slate-100",  category: "IDE",   providerUrl: PROVIDER_URLS["Vercel"], status: "soon" },
]

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === slug)
}

/**
 * Comisión de CoStack sobre cada transacción (modelo de negocio del TFI: 5-8%).
 * Se muestra desglosada en el checkout y se suma al total que paga el miembro.
 */
export const COMMISSION_RATE = 0.08

/** Redondea a 2 decimales para montos de dinero. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface CheckoutPricing {
  base: number
  commission: number
  commissionRate: number
  total: number
}

/** Desglosa el precio que ve/paga el miembro: fracción de la licencia + comisión CoStack. */
export function computeCheckoutPricing(basePrice: number): CheckoutPricing {
  const commission = round2(basePrice * COMMISSION_RATE)
  return {
    base: round2(basePrice),
    commission,
    commissionRate: COMMISSION_RATE,
    total: round2(basePrice + commission),
  }
}

/** Slugs de herramientas con provisioning escalable y funcional. */
export const LIVE_SLUGS = CATALOG.filter((t) => t.status === "live").map((t) => t.id)

/** true si la herramienta se puede comprar/provisionar hoy. */
export function isToolLive(slug: string): boolean {
  return CATALOG.some((item) => item.id === slug && item.status === "live")
}
