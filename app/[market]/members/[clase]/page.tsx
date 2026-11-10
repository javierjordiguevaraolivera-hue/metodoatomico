import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Progress } from "@/components/Curso";
import Icon from "@/components/Icon";
import { MarketFileRow, MarketFooter, MarketTopBar } from "@/components/MarketCurso";
import MarketLessonDone from "@/components/MarketLessonDone";
import { loadMarketBuyer } from "@/lib/buyer-market";
import { courseFor } from "@/lib/curso-market";
import { getMarket, t } from "@/lib/markets";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ market: string; clase: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { market, clase } = await params;
  const m = getMarket(market);
  const l = m ? courseFor(m.id).findLesson(clase) : null;
  return { title: `${l ? `${l.n} ${l.title}` : "Lesson"} · Atomic Method`, robots: { index: false } };
}

// Una clase del curso de /us e /india: contenido, archivos, botón de completada y anterior/siguiente.
export default async function Lesson({ params }: P) {
  const { market, clase } = await params;
  const m = getMarket(market);
  if (!m) notFound();
  const { LESSONS, findLesson } = courseFor(m.id);
  const lesson = findLesson(clase);
  if (!lesson) notFound();
  const d = t(m).members;
  const { byName, done } = await loadMarketBuyer(m);

  const mod = lesson.module;
  const siblings = LESSONS.filter((l) => l.module === mod);
  const prev = LESSONS[lesson.index - 1];
  const next = LESSONS[lesson.index + 1];
  const isDone = done.has(lesson.slug);
  const base = `/${m.id}/members`;

  return (
    <main className="ma-page ma-page-lesson">
      <MarketTopBar market={m} back />

      <div className="ma-lessonlayout">
        <aside className="ma-side" aria-label={`${d.module} ${mod.n}`}>
          <div className="ma-side-head">
            <span className="ma-mod-ic"><Icon name={mod.icon} /></span>
            <span><small>{d.module} {mod.n}</small><strong>{mod.title}</strong></span>
          </div>
          <Progress value={siblings.filter((l) => done.has(l.slug)).length} total={siblings.length} label={d.moduleProgress(mod.n)} />
          <ol className="ma-lessonlist">
            {siblings.map((l) => (
              <li key={l.slug}>
                <a href={`${base}/${l.slug}`} aria-current={l.slug === lesson.slug ? "page" : undefined} className={done.has(l.slug) ? "is-done" : ""}>
                  <span className="ma-check" aria-label={done.has(l.slug) ? d.done : d.pending}>{done.has(l.slug) ? "✓" : ""}</span>
                  <span className="ma-ln">{l.n}</span>
                  <span className="ma-lt">{l.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="ma-lessonmain">
          <div className="ma-crumb">{d.module} {mod.n} · {mod.title}</div>
          <h1 className="ma-ltitle"><span>{lesson.n}</span>{lesson.title}{isDone && <em className="ma-tag ma-tag-main">{d.done}</em>}</h1>

          <ul className="ma-points ma-points-lg">{lesson.points.map((p) => <li key={p}>{p}</li>)}</ul>

          {lesson.cmds && (
            <div className="ma-cmdbox">
              <strong>{d.askAi}</strong>
              <div className="ma-cmds">{lesson.cmds.map((c) => <code key={c}>{c}</code>)}</div>
            </div>
          )}

          {lesson.files && (
            <div className="ma-lfiles">
              <h2>{d.files}</h2>
              <ul className="ma-files">{lesson.files.map((f) => <MarketFileRow key={f.name} market={m} spec={f} file={byName.get(f.name)} />)}</ul>
            </div>
          )}

          <MarketLessonDone
            key={lesson.slug}
            lesson={lesson.slug}
            done={isDone}
            next={next ? `${base}/${next.slug}` : base}
            labels={{ markDone: d.markDone, isDone: d.isDone, saveError: d.saveError }}
          />

          <nav className="ma-pager" aria-label={d.lesson}>
            {prev ? <a href={`${base}/${prev.slug}`}><small>← {d.prev}</small>{prev.n} {prev.title}</a> : <span />}
            {next
              ? <a className="is-next" href={`${base}/${next.slug}`}><small>{d.next} →</small>{next.n} {next.title}</a>
              : <a className="is-next" href={base}><small>{d.finished}</small>{d.backToAccess}</a>}
          </nav>
        </article>
      </div>

      <MarketFooter market={m} />
    </main>
  );
}
