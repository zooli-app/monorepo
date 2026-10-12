import { notFound } from "next/navigation";
import { getForm, SERVICE_KEYS } from "@zooli/vendor-forms";
import { FormEngine } from "@/components/register/FormEngine";

export function generateStaticParams() {
  return SERVICE_KEYS.map((service) => ({ service }));
}

export default async function RegisterService({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const form = getForm(service);
  if (!form) notFound();
  return <FormEngine form={form} />;
}
