import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Progress } from "@/components/Curso";
import Icon from "@/components/Icon";
import { MarketFileRow, MarketFooter, MarketTopBar } from "@/components/MarketCurso";
import { loadMarketBuyer } from "@/lib/buyer-market";
import { courseFor } from "@/lib/curso-market";
import { getMarket, t } from "@/lib/markets";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My access · Atomic Method", robots: { index: false } };

const label = (name: string) => name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");

// Panel del curso de /us e /india: avance total, la clase que sigue y los módulos (mismo diseño que /mis-accesos).
export default async function Members({ params }: { params: Promise<{ market: string }> }) {
  const m = getMarket((await params).market);
  if (!m) notFound();
  const d = t(m).members;
  const { LESSONS, MODULES, COURSE_FILES } = courseFor(m.id);
  const { session, name, files, done } = await loadMarketBuyer(m);
  const count = (lessons: typeof LESSONS) => lessons.filter((l) => done.has(l.slug)).length;
  const total = LESSONS.length;
  const completed = count(LESSONS);
  const next = LESSONS.find((l) => !done.has(l.slug));
  const extra = files.filter((f) => !COURSE_FILES.has(f.name)).sort((a, b) => a.name.localeCompare(b.name));
  const minutes = Math.max(1, Math.round((session.exp - Date.now()) / 60000));
  const left = minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;

  return (
    <main className="ma-page">
      <MarketTopBar market={m} />

      <section className="ma-hero">
        <img className="ma-mascot" src="/landing/atomin-celebra.webp" alt="" width={140} height={140} />
        <div className="ma-hero-txt">
          <div className="ac-kicker">{d.kicker}</div>
          <h1 className="ma-title">{d.hello(name)} {d.welcome} <span>{m.brand}</span></h1>
          <p className="ma-sub">{d.signedAs} <strong>{session.email}</strong>.</p>
          <div className="ma-hero-prog">
            <span>{completed === total ? d.finished : d.progress(Math.round((completed / total) * 100))}</span>
            <Progress value={completed} total={total} label={d.courseProgress} />
          </div>
          {next && (
            <a className="ma-continue" href={`/${m.id}/members/${next.slug}`}>
              <span><small>{completed ? d.continueWith : d.startWith}</small>{next.n} {next.title}</span>
              <span aria-hidden="true">→</span>
            </a>
          )}
          <p className="ma-session"><Icon name="clock" /> {d.expires(left)}</p>
        </div>
      </section>

      <section className="ma-block">
        <h2>{d.modules}</h2>
        <div className="ma-modgrid">
          {MODULES.map((mod) => {
            const lessons = LESSONS.filter((l) => l.module === mod);
            const n = count(lessons);
            return (
              <article key={mod.n} className={n === lessons.length ? "ma-modcard is-done" : "ma-modcard"}>
                <header>
                  <span className="ma-mod-ic"><Icon name={mod.icon} /></span>
                  <span><small>{d.module} {mod.n}</small><strong>{mod.title}</strong></span>
                  {n === lessons.length && <span className="ma-modcheck"><Icon name="circle-check" /></span>}
                </header>
                <Progress value={n} total={lessons.length} label={d.moduleProgress(mod.n)} />
                <ol className="ma-lessonlist">
                  {lessons.map((l) => (
                    <li key={l.slug}>
                      <a href={`/${m.id}/members/${l.slug}`} className={done.has(l.slug) ? "is-done" : next?.slug === l.slug ? "is-next" : ""}>
                        <span className="ma-check" aria-label={done.has(l.slug) ? d.done : d.pending}>{done.has(l.slug) ? "✓" : ""}</span>
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
          <h2>{d.moreFiles}</h2>
          <ul className="ma-files">{extra.map((f) => <MarketFileRow key={f.name} market={m} spec={{ name: f.name, title: label(f.name) }} file={f} />)}</ul>
        </section>
      )}

      <MarketFooter market={m} />
    </main>
  );
}
