$files = git status --porcelain | ForEach-Object { $_.Substring(3) }

$customMessages = @{
    "components/dashboard/withdraw-funds-modal.tsx" = "feat: añade modal de retiro de fondos a MercadoPago y Crypto"
    "components/dashboard/config-credentials-modal.tsx" = "feat: añade modal de configuracion OAuth y validacion de credenciales"
    "components/dashboard/cancel-license-modal.tsx" = "feat: añade modal interactivo para cancelar licencia maestra"
    "components/dashboard/gestion-asientos-view.tsx" = "ux: mejora jerarquia visual, tarjetas business y agrega modales administrativos"
    "components/dashboard/success-access-card.tsx" = "ux: integra flujos condicionales para licencias business y proteccion escrow"
    "components/dashboard/seat-row.tsx" = "fix: oculta opcion de revocar para miembros que ya pagaron (assigned)"
    "components/dashboard/billing-header-cards.tsx" = "feat: integra boton de retiros en la tarjeta de saldo"
    "SPRINT_9_PLAN.md" = "docs: crea plan arquitectonico de base de datos y backend para el sprint 9"
    "sprintdetalles.md" = "docs: documenta progreso, implementaciones y correcciones del sprint 8"
    "app/(dashboard)/overview/page.tsx" = "fix: resuelve propiedad faltante isBusiness en el dashboard"
}

foreach ($file in $files) {
    if (-not [string]::IsNullOrWhiteSpace($file)) {
        # Normalize slashes for dictionary lookup
        $normalizedFile = $file -replace "\\", "/"
        
        $message = $customMessages[$normalizedFile]
        if (-not $message) {
            $fileName = Split-Path $file -Leaf
            $message = "chore: refactoriza y optimiza $fileName para el sprint 8"
        }

        git add "`"$file`""
        git commit -m $message
    }
}

git push -f origin sprint-8
