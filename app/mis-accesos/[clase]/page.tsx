import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileRow, Help, Progress, TopBar } from "@/components/Curso";
import Icon from "@/components/Icon";
import LessonDone from "@/components/LessonDone";
import { loadBuyer } from "@/lib/buyer";
import { findLesson, LESSONS } from "@/lib/curso";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ clase: string }> }): Promise<Metadata> {
  const l = findLesson((await params).clase);
  return { title: `${l ? `${l.n} ${l.title}` : "Clase"} · Método Atómico`, robots: { index: false } };
}

// Una clase del curso: contenido, archivos, botón de completada y navegación anterior/siguiente.
export default async function Clase({ params }: { params: Promise<{ clase: string }> }) {
  const lesson = findLesson((await params).clase);
  if (!lesson) notFound();
  const { byName, done } = await loadBuyer();

  const m = lesson.module;
  const siblings = LESSONS.filter((l) => l.module === m);
  const prev = LESSONS[lesson.index - 1];
  const next = LESSONS[lesson.index + 1];
  const isDone = done.has(lesson.slug);

  return (
    <main className="ma-page ma-page-lesson">
      <TopBar back />

      <div className="ma-lessonlayout">
        <aside className="ma-side" aria-label={`Módulo ${m.n}`}>
          <div className="ma-side-head">
            <span className="ma-mod-ic"><Icon name={m.icon} /></span>
            <span><small>Módulo {m.n}</small><strong>{m.title}</strong></span>
          </div>
          <Progress value={siblings.filter((l) => done.has(l.slug)).length} total={siblings.length} label={`Avance del módulo ${m.n}`} />
          <ol className="ma-lessonlist">
            {siblings.map((l) => (
              <li key={l.slug}>
                <a href={`/mis-accesos/${l.slug}`} aria-current={l.slug === lesson.slug ? "page" : undefined} className={done.has(l.slug) ? "is-done" : ""}>
                  <span className="ma-check" aria-label={done.has(l.slug) ? "Completada" : "Pendiente"}>{done.has(l.slug) ? "✓" : ""}</span>
                  <span className="ma-ln">{l.n}</span>
                  <span className="ma-lt">{l.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="ma-lessonmain">
          <div className="ma-crumb">Módulo {m.n} · {m.title}</div>
          <h1 className="ma-ltitle"><span>{lesson.n}</span>{lesson.title}{isDone && <em className="ma-tag ma-tag-main">Completada</em>}</h1>

          <ul className="ma-points ma-points-lg">{lesson.points.map((p) => <li key={p}>{p}</li>)}</ul>

          {lesson.cmds && (
            <div className="ma-cmdbox">
              <strong>Escríbele a tu IA</strong>
              <div className="ma-cmds">{lesson.cmds.map((c) => <code key={c}>{c}</code>)}</div>
            </div>
          )}

          {lesson.files && (
            <div className="ma-lfiles">
              <h2>Archivos de esta clase</h2>
              <ul className="ma-files">{lesson.files.map((f) => <FileRow key={f.name} spec={f} file={byName.get(f.name)} />)}</ul>
            </div>
          )}

          <LessonDone key={lesson.slug} lesson={lesson.slug} done={isDone} next={next ? `/mis-accesos/${next.slug}` : "/mis-accesos"} />

          <nav className="ma-pager" aria-label="Clases">
            {prev ? <a href={`/mis-accesos/${prev.slug}`}><small>← Anterior</small>{prev.n} {prev.title}</a> : <span />}
            {next ? <a className="is-next" href={`/mis-accesos/${next.slug}`}><small>Siguiente →</small>{next.n} {next.title}</a> : <a className="is-next" href="/mis-accesos"><small>Terminaste →</small>Volver a mis accesos</a>}
          </nav>
        </article>
      </div>

      <Help />
    </main>
  );
}
