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

// Los archivos se entregan tal cual (el sistema busca los ejemplos por su nombre): aquí solo se ordenan y se explican.
const BOVEDA: Record<string, string> = {
  "plan-semana-1": "Tu plan de la semana 1",
  "elige-tu-camino": "Qué vender con tus videos",
  "primeros-clientes": "Tus primeros clientes",
  "socios-atom": "Socios",
  "proximos-30-dias": "Tus próximos 30 días",
};
type FileInfo = { order: number; title: string; tag?: string; note?: string };
function fileInfo(name: string): FileInfo {
  if (/v2\.zip$/i.test(name)) return { order: 0, title: "Sistema 2.0", tag: "Empieza aquí", note: "Descomprímelo en una carpeta nueva: es la carpeta que abres en tu IA." };
  const ej = name.match(/Ejemplo (.+)\.zip$/i);
  if (ej) return { order: 1, title: `Ejemplo: ${ej[1]}`, tag: "Obligatorio", note: "Ponlo dentro de la carpeta tal cual: sin descomprimirlo ni cambiarle el nombre." };
  const bv = name.match(/Boveda (\d+) - (.+)\.pdf$/i);
  if (bv) return { order: 10 + Number(bv[1]), title: `Bóveda ${bv[1]}: ${BOVEDA[bv[2]] ?? label(bv[2])}`, tag: "Bonus" };
  if (/ELITE\.zip$/i.test(name)) return { order: 50, title: "Sistema 1 (versión anterior)", tag: "Opcional", note: "Para empezar usa el Sistema 2.0. Este es solo si ya tenías la versión 1." };
  return { order: 40, title: label(name) };
}

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "monitor", title: "Ten listo tu equipo", text: "Una computadora Mac o Windows con la app de escritorio de Claude (pestaña Code) o de ChatGPT (Codex). En la web no funciona. Y una cuenta de ElevenLabs para la voz." },
  { icon: "download", title: "Descarga 3 archivos", text: "El Sistema 2.0 y los 2 ejemplos (estrella verde y alcohol). Los ejemplos son obligatorios: el sistema los usa como referencia de calidad en cada video." },
  { icon: "folder", title: "Arma la carpeta", text: "Descomprime el Sistema 2.0 en una carpeta nueva y mete dentro los 2 ZIP de ejemplos tal cual, sin descomprimirlos ni cambiarles el nombre." },
  { icon: "zap", title: "Ábrela en tu IA y escribe «configúrame»", text: "Claude: Code › Select folder › elige la carpeta. ChatGPT: Codex › + junto a Projects › Local › elige la carpeta (si pregunta si confías en ella, di que sí). Acepta cuando pida instalar programas; la primera vez tarda unos minutos." },
  { icon: "lock", title: "Pega tu clave de ElevenLabs", text: "Abre PEGA-AQUI-TU-CLAVE-ELEVENLABS.txt y pega tu clave después de CLAVE= (empieza con sk_). Se saca en elevenlabs.io › Developers › API Keys › Create Key, con «Restrict Key» apagado. Nunca la pegues en el chat." },
  { icon: "sparkles", title: "Haz tu primer video", text: "Escribe «Hazme un video sobre …». Te muestra 2 inicios y el guion: elige uno o escribe «adelante». Puede tardar hasta 1 hora, deja la compu encendida. El video, la portada y las descripciones quedan en la carpeta salida." },
  { icon: "play", title: "Súbelo y repite", text: "Publica el video en Instagram, TikTok y YouTube Shorts. Un video por día durante 30 días es lo que hace crecer la cuenta." },
];

export default async function MisAccesos() {
  const session = await currentSession();
  if (!session) redirect("/acceso");
  const [order, customer, files] = await Promise.all([
    findPaidOrder(session.email),
    findCustomer(session.email).catch(() => null),
    listDownloads().catch((err) => { console.error("mis-accesos: archivos", err); return [] as DownloadFile[]; }),
  ]);
  const list = files.map((f) => ({ ...f, info: fileInfo(f.name) })).sort((a, b) => a.info.order - b.info.order || a.name.localeCompare(b.name));
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
        {list.length ? (
          <ul className="ma-files">
            {list.map((f) => (
              <li key={f.name} className="ma-file">
                <span className="ma-file-ic"><Icon name={fileIcon(f.name)} /></span>
                <span className="ma-file-txt">
                  <strong>{f.info.title}{f.info.tag && <em className={`ma-tag ma-tag-${f.info.order === 0 ? "main" : f.info.tag === "Obligatorio" ? "req" : "opt"}`}>{f.info.tag}</em>}</strong>
                  {f.info.note && <span className="ma-file-note">{f.info.note}</span>}
                  <small>{f.name}{f.size ? ` · ${size(f.size)}` : ""}</small>
                </span>
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
          <span>Primero escribe «doctor» en tu IA: revisa tu compu y arregla lo que falte. Si sigue, escríbenos y te ayudamos hasta que salga tu primer video.</span>
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
