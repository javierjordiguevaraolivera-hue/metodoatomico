import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacidad · Método Atómico" };

export default function Page() {
  return <LegalPage slug="privacidad" title="Privacidad" />;
}
