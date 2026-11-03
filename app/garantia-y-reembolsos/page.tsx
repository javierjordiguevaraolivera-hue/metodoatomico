import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Garantía y reembolsos · Método Atómico" };

export default function Page() {
  return <LegalPage slug="garantia-y-reembolsos" title="Garantía y reembolsos" />;
}
