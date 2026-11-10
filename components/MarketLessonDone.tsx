"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Botón de "clase completada" de /us e /india: misma API (/api/progreso) que la página principal, textos traducidos.
export default function MarketLessonDone({ lesson, done, next, labels }: {
  lesson: string;
  done: boolean;
  next?: string;
  labels: { markDone: string; isDone: string; saveError: string };
}) {
  const router = useRouter();
  const [state, setState] = useState(done);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (busy) return;
    const value = !state;
    setBusy(true);
    setError("");
    setState(value);
    try {
      const res = await fetch("/api/progreso", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lesson, done: value }) });
      if (!res.ok) throw new Error();
      if (value && next) router.push(next);
      else router.refresh();
    } catch {
      setState(!value);
      setError(labels.saveError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ma-done-wrap">
      <button type="button" className={state ? "ma-done is-done" : "ma-done"} onClick={toggle} disabled={busy} aria-pressed={state}>
        <span className="ma-done-box" aria-hidden="true">{state ? "✓" : ""}</span>
        {state ? labels.isDone : labels.markDone}
      </button>
      {error && <span className="ma-done-err" role="alert">{error}</span>}
    </div>
  );
}
