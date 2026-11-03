import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import Checkout from "@/components/Checkout";
import Pixels from "@/components/Pixels";

// La landing es el HTML original de ATOM convertido (content/landing.html) con sus dos scripts:
// runtime.js (video de bienvenida, reels, botones) y fx.js (sonidos y mascota 3D con three.js).
const landing = fs.readFileSync(path.join(process.cwd(), "content", "landing.html"), "utf8");

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: landing }} />
      <Checkout />
      <Pixels viewContentOnScroll />
      <Script src="/landing/runtime.js" strategy="afterInteractive" />
      <Script src="/landing/fx.js" type="module" strategy="afterInteractive" />
    </>
  );
}
