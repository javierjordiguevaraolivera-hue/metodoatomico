import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import type { IconName } from "@/lib/icons";
import { currentSession } from "@/lib/session";
import { findCustomer, findPaidOrder, listDownloads, type DownloadFile } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis accesos · Método Atómico", robots: { index: false } };

const size = (b: number | null) => (b == null ? "" : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const fileIcon = (name: string): IconName =>
  /\.(zip|rar|7z)$/i.test(name) ? "package" : /\.(mp4|mov|webm)$/i.test(name) ? "file-video" : /\.(png|jpe?g|webp|gif)$/i.test(name) ? "image" : "file-text";
const label = (name: string) => name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "monitor", title: "Ten listo tu equipo", text: "Una computadora Mac o Windows, la app de escritorio de Claude (Pro o superior) o de ChatGPT (Plus o superior) y tu clave de ElevenLabs para la voz." },
  { icon: "download", title: "Descarga la carpeta", text: "Descarga el ZIP de Método Atómico desde aquí abajo y descomprímelo donde lo encuentres fácil, por ejemplo en Documentos." },
  { icon: "folder", title: "Ábrela en tu IA", text: "En la app de escritorio, abre la carpeta de Método Atómico como proyecto y escribe «configúrame». Tu IA instala sola lo que haga falta." },
  { icon: "sparkles", title: "Haz tu primer video", text: "Escribe un tema en una frase. Tu IA investiga, escribe el guion, dibuja, pone la voz y los subtítulos. Tú apruebas el guion." },
  { icon: "play", title: "Súbelo y repite", text: "Publica el video en Instagram, TikTok y YouTube Shorts. Un video por día es lo que hace crecer la cuenta." },
];

export default async function MisAccesos() {
  const session = await currentSession();
  if (!session) redirect("/acceso");
  const [order, customer, files] = await Promise.all([
    findPaidOrder(session.email),
    findCustomer(session.email).catch(() => null),
    listDownloads().catch((err) => { console.error("mis-accesos: archivos", err); return [] as DownloadFile[]; }),
  ]);
  if (!order) redirect("/api/acceso/salir");

  const minutes = Math.max(1, Math.round((session.exp - Date.now()) / 60000));
  const name = customer?.first_name?.trim();

  return (
    <main className="ma-page">
      <header className="ma-top">
        <a href="/" aria-label="Método Atómico"><img src="/brand/metodo-atomico-logo.png" alt="Método Atómico" width={150} height={40} /></a>
        <a className="ma-out" href="/api/acceso/salir"><Icon name="log-out" /> Salir</a>
      </header>

      <section className="ma-hero">
        <img className="ma-mascot" src="/landing/atomin-celebra.webp" alt="" width={140} height={140} />
        <div>
          <div className="ac-kicker">Tu acceso</div>
          <h1 className="ma-title">{name ? `¡Hola, ${name}!` : "¡Hola!"} Bienvenido a <span>Método Atómico</span></h1>
          <p className="ma-sub">Aquí tienes todo para hacer tu primer video viral. Entraste como <strong>{session.email}</strong>.</p>
          <p className="ma-session"><Icon name="clock" /> Tu sesión vence en {minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`}. Después vuelves a entrar con tu correo.</p>
        </div>
      </section>

      <section className="ma-block">
        <h2>Tus descargas</h2>
        {files.length ? (
          <ul className="ma-files">
            {files.map((f) => (
              <li key={f.name} className="ma-file">
                <span className="ma-file-ic"><Icon name={fileIcon(f.name)} /></span>
                <span className="ma-file-txt"><strong>{label(f.name)}</strong><small>{f.name}{f.size ? ` · ${size(f.size)}` : ""}</small></span>
                <a className="ma-dl" href={`/api/descarga?f=${encodeURIComponent(f.name)}`}><Icon name="download" /> Descargar</a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ma-empty"><Icon name="package" /> Estamos preparando tus archivos. Vuelve a entrar en unos minutos o escríbenos por Instagram.</div>
        )}
      </section>

      <section className="ma-block">
        <h2>Paso a paso</h2>
        <ol className="ma-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ma-step">
              <span className="ma-step-n">{i + 1}</span>
              <span className="ma-step-ic"><Icon name={s.icon} /></span>
              <span><strong>{s.title}</strong><span>{s.text}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="ma-help">
        <div>
          <strong>¿Te trabaste?</strong>
          <span>Escríbenos y te ayudamos hasta que salga tu primer video.</span>
        </div>
        <a href="https://ig.me/m/metodoatomico_" target="_blank" rel="noopener" className="ma-help-btn"><Icon name="instagram" /> Escribir por Instagram</a>
      </section>

      <footer className="ma-foot">
        <a href="/terminos-y-condiciones">Términos y condiciones</a>
        <a href="/garantia-y-reembolsos">Garantía y reembolsos</a>
        <a href="/privacidad">Privacidad</a>
      </footer>
    </main>
  );
}
