import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccessForm from "@/components/AccessForm";
import { currentSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acceso · Método Atómico", robots: { index: false } };

export default async function Acceso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await currentSession()) redirect("/mis-accesos");
  const q = await searchParams;
  const email = typeof q.email === "string" ? q.email.slice(0, 200) : "";

  return (
    <main className="ac-page">
      <div className="ac-glow" aria-hidden="true" />
      <section className="ac-card">
        <a href="/" className="ac-logo"><img src="/brand/metodo-atomico-logo.png" alt="Método Atómico" width={170} height={45} /></a>
        <img className="ac-mascot" src="/landing/atomin-saluda.webp" alt="" width={120} height={120} />
        <div className="ac-kicker">Acceso de compradores</div>
        <h1 className="ac-title">Entra a tu <span>Método Atómico</span></h1>
        <p className="ac-sub">Escribe el correo con el que pagaste y entras directo a la guía y a tus descargas.</p>
        <AccessForm initialEmail={email} />
      </section>
      <p className="ac-foot">¿Todavía no lo tienes? <a href="/">Conoce Método Atómico</a></p>
    </main>
  );
}
