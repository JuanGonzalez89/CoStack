export default function GroupSettingsPage() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Grupo</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Gestión del grupo</h1>
        <p className="text-sm text-muted-foreground">Acceso reservado para organizadores.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Acá van a vivir precios, miembros, herramientas y permisos. Por ahora queda como ancla estructural del Sprint 1.
      </div>
    </section>
  )
}