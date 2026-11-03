"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Botón de "clase completada": guarda en /api/progreso y, al marcarla, lleva a la siguiente clase.
export default function LessonDone({ lesson, done, next }: { lesson: string; done: boolean; next?: string }) {
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
      setError("No pudimos guardar tu avance. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ma-done-wrap">
      <button type="button" className={state ? "ma-done is-done" : "ma-done"} onClick={toggle} disabled={busy} aria-pressed={state}>
        <span className="ma-done-box" aria-hidden="true">{state ? "✓" : ""}</span>
        {state ? "Clase completada" : "Marcar como completada"}
      </button>
      {error && <span className="ma-done-err" role="alert">{error}</span>}
    </div>
  );
}
