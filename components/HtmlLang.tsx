"use client";

import { useEffect } from "react";

// El <html lang> lo fija el layout principal en "es"; en /us e /india se corrige en el navegador.
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);
  return null;
}
