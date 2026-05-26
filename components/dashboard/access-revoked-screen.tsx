import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccessRevokedScreenProps {
  title?: string
  description?: string
  ctaHref?: string
}

export function AccessRevokedScreen({
  title = "Acceso temporalmente revocado",
  description = "La cuenta quedó limitada hasta resolver el pago pendiente o volver a habilitar el grupo.",
  ctaHref = "/billetera?status=overdue",
}: AccessRevokedScreenProps) {
  return (
    <section className="flex min-h-[42vh] items-center justify-center rounded-3xl border border-border bg-card px-6 py-10 shadow-sm">
      <div className="max-w-lg space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-600">Acceso bloqueado</p>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild className="rounded-xl bg-red-600 text-white hover:bg-red-500">
            <Link href={ctaHref}>Ir a billetera</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}