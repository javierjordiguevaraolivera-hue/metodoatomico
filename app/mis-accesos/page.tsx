import type { Metadata } from "next";
import { FileRow, Help, Progress, TopBar } from "@/components/Curso";
import Icon from "@/components/Icon";
import { loadBuyer } from "@/lib/buyer";
import { COURSE_FILES, LESSONS, MODULES } from "@/lib/curso";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis accesos · Método Atómico", robots: { index: false } };

const label = (name: string) => name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");

// Panel del curso: avance total, la clase que sigue y los módulos con sus clases (cada clase tiene su página).
export default async function MisAccesos() {
  const { session, name, files, done } = await loadBuyer();
  const slugs = (lessons: typeof LESSONS) => lessons.filter((l) => done.has(l.slug)).length;
  const total = LESSONS.length;
  const completed = slugs(LESSONS);
  const next = LESSONS.find((l) => !done.has(l.slug));
  const extra = files.filter((f) => !COURSE_FILES.has(f.name)).sort((a, b) => a.name.localeCompare(b.name));
  const minutes = Math.max(1, Math.round((session.exp - Date.now()) / 60000));

  return (
    <main className="ma-page">
      <TopBar />

      <section className="ma-hero">
        <img className="ma-mascot" src="/landing/atomin-celebra.webp" alt="" width={140} height={140} />
        <div className="ma-hero-txt">
          <div className="ac-kicker">Tu acceso</div>
          <h1 className="ma-title">{name ? `¡Hola, ${name}!` : "¡Hola!"} Bienvenido a <span>Método Atómico</span></h1>
          <p className="ma-sub">Entraste como <strong>{session.email}</strong>.</p>
          <div className="ma-hero-prog">
            <span>{completed === total ? "¡Terminaste el curso!" : `Llevas ${Math.round((completed / total) * 100)} % del curso`}</span>
            <Progress value={completed} total={total} label="Avance del curso" />
          </div>
          {next && (
            <a className="ma-continue" href={`/mis-accesos/${next.slug}`}>
              <span><small>{completed ? "Continúa con" : "Empieza con"}</small>{next.n} {next.title}</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
          <p className="ma-session"><Icon name="clock" /> Tu sesión vence en {minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`}. Después vuelves a entrar con tu correo.</p>
        </div>
      </section>

      <section className="ma-block">
        <h2>Tus módulos</h2>
        <div className="ma-modgrid">
          {MODULES.map((m) => {
            const lessons = LESSONS.filter((l) => l.module === m);
            const d = slugs(lessons);
            return (
              <article key={m.n} className={d === lessons.length ? "ma-modcard is-done" : "ma-modcard"}>
                <header>
                  <span className="ma-mod-ic"><Icon name={m.icon} /></span>
                  <span><small>Módulo {m.n}</small><strong>{m.title}</strong></span>
                  {d === lessons.length && <span className="ma-modcheck"><Icon name="circle-check" /></span>}
                </header>
                <Progress value={d} total={lessons.length} label={`Avance del módulo ${m.n}`} />
                <ol className="ma-lessonlist">
                  {lessons.map((l) => (
                    <li key={l.slug}>
                      <a href={`/mis-accesos/${l.slug}`} className={done.has(l.slug) ? "is-done" : next?.slug === l.slug ? "is-next" : ""}>
                        <span className="ma-check" aria-label={done.has(l.slug) ? "Completada" : "Pendiente"}>{done.has(l.slug) ? "✓" : ""}</span>
                        <span className="ma-ln">{l.n}</span>
                        <span className="ma-lt">{l.title}</span>
                        {l.files?.length ? <span className="ma-lf"><Icon name="download" /></span> : null}
                      </a>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      {extra.length > 0 && (
        <section className="ma-block">
          <h2>Más archivos</h2>
          <ul className="ma-files">{extra.map((f) => <FileRow key={f.name} spec={{ name: f.name, title: label(f.name) }} file={f} />)}</ul>
        </section>
      )}

      <Help />
    </main>
  );
}
