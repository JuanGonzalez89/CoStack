import { CATALOG } from "@/lib/catalog"

export const TOOLS = CATALOG.map((t) => ({
  slug: t.id,
  name: t.name,
  provider: t.provider,
  monthlyCost: t.monthlyCost,
  marketPrice: t.originalPrice,
}))
