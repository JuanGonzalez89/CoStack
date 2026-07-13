import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function now(): string {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

/** Formatea un monto con separador de miles "." y decimales "," (ej: 10000 -> "10.000"). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value)
}
