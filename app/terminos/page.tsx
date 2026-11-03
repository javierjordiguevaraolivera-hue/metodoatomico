import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Términos de uso · Método Atómico" };

export default function Page() {
  return <LegalPage slug="terminos" title="Términos de uso" />;
}
