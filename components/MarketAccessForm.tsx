"use client";

import { FormEvent, useState } from "react";
import { type Market, t } from "@/lib/markets";
import Icon from "./Icon";

// Formulario de /us/login e /india/login: correo de compra → sesión de 2 horas → /<mercado>/members.
export default function MarketAccessForm({ market, initialEmail = "" }: { market: Market; initialEmail?: string }) {
  const d = t(market).access;
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "loading" | "notfound" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setState("error"); setMessage(d.invalid); return; }
    setState("loading"); setMessage("");
    try {
      const res = await fetch("/api/acceso", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) { window.location.href = `/${market.id}/members`; return; }
      if (res.status === 404) { setState("notfound"); return; }
      setState("error"); setMessage(res.status === 400 ? d.invalid : d.error);
    } catch {
      setState("error"); setMessage(d.offline);
    }
  }

  return (
    <form className="ac-form" onSubmit={submit} noValidate>
      <label className="ac-label" htmlFor="ac-email">{d.label}</label>
      <div className={`ac-input ${state === "notfound" || state === "error" ? "is-bad" : ""}`}>
        <span className="ac-input-ic"><Icon name="mail" /></span>
        <input
          id="ac-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus={!initialEmail}
          required
          placeholder={d.placeholder}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }}
        />
      </div>

      {state === "notfound" && (
        <div className="ac-alert" role="alert">
          <strong>{d.notFoundTitle}</strong>
          <span>{d.notFound}</span>
          <span className="ac-alert-links"><a href={`/${market.id}`}>{d.buy(market.brand)}</a></span>
        </div>
      )}
      {state === "error" && <div className="ac-alert" role="alert"><span>{message}</span></div>}

      <button type="submit" className="ac-btn" disabled={state === "loading" || !email.trim()}>
        {state === "loading" ? <span className="ac-spin" aria-label={d.checking} /> : <>{d.enter} <span aria-hidden="true">→</span></>}
      </button>
      <p className="ac-fine"><Icon name="lock" /> {d.session}</p>
    </form>
  );
}
