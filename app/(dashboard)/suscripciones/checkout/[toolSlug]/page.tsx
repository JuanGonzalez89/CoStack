import { CheckoutView } from "@/components/dashboard/checkout-view"

interface PageProps {
  params: Promise<{
    toolSlug: string
  }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { toolSlug } = await params;
  return <CheckoutView toolSlug={toolSlug} />
}
