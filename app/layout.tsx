import type { Metadata, Viewport } from "next";
import "./landing.css";
import "./checkout.css";
import "./legal.css";
import "./acceso.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.metodoatomico.lat";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Método Atómico · Tu IA hace tus videos virales",
  description: "Abre Método Atómico en Claude o ChatGPT y crea reels virales sin grabarte ni editar. Pago único, acceso de por vida.",
  openGraph: {
    title: "Método Atómico · Tu IA hace el video viral. Tú solo lo subes.",
    description: "El sistema detrás de +18 millones de vistas en 15 días. Pago único, de por vida.",
    images: ["/video/intro-metodo-atomico.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#120A2A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
