import { BilleteraPageClient } from '@/components/dashboard/billetera-page-client'

export default function BilleteraPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  return <BilleteraPageClient isOverdue={searchParams?.status === 'overdue'} />
}