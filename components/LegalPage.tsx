import fs from "node:fs";
import path from "node:path";
import Pixels from "./Pixels";

// Páginas legales: el texto vive en content/legal/<slug>.html.
export const LEGAL_LINKS = [
  { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
  { href: "/garantia-y-reembolsos", label: "Garantía y reembolsos" },
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
];

export default function LegalPage({ slug, title }: { slug: string; title: string }) {
  const html = fs.readFileSync(path.join(process.cwd(), "content", "legal", `${slug}.html`), "utf8");
  return (
    <div className="legal">
      <Pixels />
      <header className="legal-top">
        <a href="/" aria-label="Método Atómico, volver al inicio">
          <img src="/brand/metodo-atomico-logo.png" alt="Método Atómico" width={152} height={40} />
        </a>
        <a href="/" className="legal-back">← Volver</a>
      </header>
      <main className="legal-main">
        <h1>{title}</h1>
        <div className="legal-body" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <footer className="legal-foot">
        {LEGAL_LINKS.map((l) => <a key={l.href} href={l.href} aria-current={l.href === `/${slug}` ? "page" : undefined}>{l.label}</a>)}
        <a href="https://www.instagram.com/metodoatomico_/" target="_blank" rel="noopener">Instagram</a>
      </footer>
    </div>
  );
}
