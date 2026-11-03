import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Términos y condiciones · Método Atómico" };

export default function Page() {
  return <LegalPage slug="terminos-y-condiciones" title="Términos y condiciones" />;
}
