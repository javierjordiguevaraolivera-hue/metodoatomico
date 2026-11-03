"use client";

import { FormEvent, useState } from "react";
import Icon from "./Icon";

// Formulario de /acceso: correo de compra → sesión de 2 horas → /mis-accesos.
export default function AccessForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "loading" | "notfound" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading"); setMessage("");
    try {
      const res = await fetch("/api/acceso", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { window.location.href = "/mis-accesos"; return; }
      if (data.error === "no-encontrado") { setState("notfound"); return; }
      setState("error"); setMessage(data.error || "No pudimos revisar tu acceso. Intenta de nuevo.");
    } catch {
      setState("error"); setMessage("Revisa tu conexión e intenta de nuevo.");
    }
  }

  return (
    <form className="ac-form" onSubmit={submit} noValidate>
      <label className="ac-label" htmlFor="ac-email">Correo con el que compraste</label>
      <div className={`ac-input ${state === "notfound" || state === "error" ? "is-bad" : ""}`}>
        <span className="ac-input-ic"><Icon name="mail" /></span>
        <input
          id="ac-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus={!initialEmail}
          required
          placeholder="tucorreo@gmail.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }}
        />
      </div>

      {state === "notfound" && (
        <div className="ac-alert" role="alert">
          <strong>No encontramos una compra con ese correo.</strong>
          <span>Revisa que sea el mismo que usaste al pagar. Si acabas de pagar en efectivo o transferencia, puede tardar unos minutos.</span>
          <span className="ac-alert-links">
            <a href="/">Comprar Método Atómico</a>
            <a href="https://ig.me/m/metodoatomico_" target="_blank" rel="noopener">Pedir ayuda por Instagram</a>
          </span>
        </div>
      )}
      {state === "error" && <div className="ac-alert" role="alert"><span>{message}</span></div>}

      <button type="submit" className="ac-btn" disabled={state === "loading" || !email.trim()}>
        {state === "loading" ? <span className="ac-spin" aria-label="Revisando" /> : <>Entrar a mi acceso <span aria-hidden="true">→</span></>}
      </button>
      <p className="ac-fine"><Icon name="lock" /> Tu sesión dura 2 horas. Después vuelves a entrar con tu correo.</p>
    </form>
  );
}
