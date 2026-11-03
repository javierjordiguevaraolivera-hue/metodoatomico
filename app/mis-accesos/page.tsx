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

// El curso, por módulos y clases (mismo orden que la guía). Los archivos se entregan tal cual:
// el sistema busca los ejemplos por su nombre, así que aquí solo se nombran y se explican.
type FileSpec = { name: string; title: string; tag?: "Empieza aquí" | "Obligatorio" | "Bonus" | "Opcional"; note?: string };
type Lesson = { n: string; title: string; points: string[]; cmds?: string[]; files?: FileSpec[] };
type Module = { n: number; icon: IconName; title: string; lessons: Lesson[] };

const EJEMPLO_NOTE = "Ponlo dentro de la carpeta del sistema tal cual: sin descomprimirlo ni cambiarle el nombre.";

const MODULES: Module[] = [
  {
    n: 1, icon: "zap", title: "Empieza aquí",
    lessons: [
      {
        n: "1.1", title: "Bienvenida",
        points: [
          "Le das un tema en una frase y tu IA te entrega un video vertical listo: guion, voz, animación, subtítulos, portada y el texto para publicar.",
          "En 15 minutos: descargas, abres la carpeta en tu IA, escribes «configúrame» y pides tu primer video o tu calendario del mes.",
          "Incluye 4 packs, 3 estilos de video, portadas, descripciones, repurposing y el kit para vender videos a negocios.",
        ],
      },
      {
        n: "1.2", title: "Descarga tus 3 archivos",
        points: [
          "Los 3 son obligatorios: el sistema usa los 2 ejemplos como referencia de calidad en cada video.",
          "Descomprime el Sistema 2.0 en una carpeta nueva y mete dentro los 2 ZIP de ejemplos tal cual.",
          "Son de uso personal: no los compartas ni los revendas.",
        ],
        files: [
          { name: "ATOM ELITE v2.zip", title: "Sistema 2.0", tag: "Empieza aquí", note: "Descomprímelo en una carpeta nueva: es la carpeta que abres en tu IA." },
          { name: "ATOM ELITE - Ejemplo estrella verde.zip", title: "Ejemplo: estrella verde", tag: "Obligatorio", note: EJEMPLO_NOTE },
          { name: "ATOM ELITE - Ejemplo alcohol.zip", title: "Ejemplo: alcohol", tag: "Obligatorio", note: EJEMPLO_NOTE },
        ],
      },
      {
        n: "1.3", title: "Instálalo en tu IA",
        points: [
          "Solo funciona en la app de escritorio (Mac o Windows), no en la web.",
          "Claude: pestaña Code › Select folder › elige la carpeta. ChatGPT: Codex › + junto a Projects › deja Local › elige la carpeta. Si pregunta si confías en ella, di que sí.",
          "Escribe «configúrame». Instala lo que falta, ordena los ejemplos y te pregunta idioma, nicho, cómo cerrar tus videos y si quieres efectos de sonido. Acepta cuando pida instalar programas; la primera vez tarda unos minutos.",
          "Clave de ElevenLabs (la voz): abre PEGA-AQUI-TU-CLAVE-ELEVENLABS.txt, pega tu clave después de CLAVE= y guarda. Nunca la pegues en el chat.",
          "Cómo sacarla: elevenlabs.io › Developers › API Keys › Create Key › apaga «Restrict Key» › copia la clave que empieza con sk_ (el ID corto no sirve).",
          "Al terminar te muestra el menú. La primera portada te pide el color de tu marca. Los mismos pasos, con más detalle, están en EMPIEZA-AQUI.html dentro de la carpeta.",
        ],
        cmds: ["configúrame", "menú"],
      },
      {
        n: "1.4", title: "Tu primer video",
        points: [
          "Pídelo con tus palabras. Sin tema, pide 5 temas o el calendario del mes.",
          "Te pregunta el estilo o te recomienda uno; investiga, escribe el guion, dibuja y se revisa solo.",
          "Te muestra 2 inicios y el guion: elige uno, pide cambios o escribe «adelante».",
          "Puede tardar hasta 1 hora: deja la compu encendida y la app abierta.",
          "En la carpeta salida quedan el video, la portada flyer.jpg y las descripciones para cada red.",
          "Para ahorrar: cuando la conversación se alargue, abre una nueva en la misma carpeta. Meta: 1 video al día durante 30 días.",
        ],
        cmds: ["Hazme un video sobre …", "adelante", "Dame 5 temas"],
      },
    ],
  },
  {
    n: 2, icon: "sparkles", title: "Tus packs",
    lessons: [
      {
        n: "2.1", title: "Ideas sin fin: calendario, nichos, 100 temas y series",
        points: [
          "Calendario: 30 días de temas de tu nicho, uno por día, con datos comprobados.",
          "Nichos: 11 listos (ciencia, cuerpo humano, historia, dinero, psicología, tecnología, animales, comida, curiosidades, negocios, deporte) o uno tuyo.",
          "100 temas probados en formato reel; recuerda los que ya usaste.",
          "Series: un tema grande en 3 a 5 partes, cada una con gancho a la siguiente.",
        ],
        cmds: ["Ármame el calendario del mes", "Hazme el video del día 5", "Elige mi nicho", "Hazme el tema 37", "Hazme una serie sobre …", "Sigue la serie"],
      },
      {
        n: "2.2", title: "Haz que exploten: portadas, descripciones y repurposing",
        points: [
          "Portada automática (flyer.jpg) pensada para TikTok, Reels y Shorts: hace 3 y te entrega la mejor.",
          "Descripciones con palabras clave y hashtags para Instagram, TikTok, YouTube Shorts y Facebook (en descripciones.md).",
          "Repurposing: carrusel, hilo, post de texto, guion de 15 segundos e ideas para los próximos videos.",
        ],
        cmds: ["Otra portada", "Hazla más corta", "Cambia el CTA", "Conviértelo en carrusel", "Sácale más contenido"],
      },
      {
        n: "2.3", title: "Los 3 estilos de video",
        points: [
          "ATOM: dibujado, con luz y color. Para ciencia, cuerpo humano, naturaleza y curiosidades.",
          "Cine Nocturno: documental de noche con escenas 3D oscuras y cálidas. Para historias, misterios, psicología y casos reales.",
          "Datos Neón: infografía animada con cifras neón al ritmo de la voz. Para dinero, comparaciones y velocidades.",
          "Hay un ejemplo de cada uno en la carpeta ejemplo-estilos.",
        ],
        cmds: ["Hazme un video sobre … en estilo Cine Nocturno"],
      },
      {
        n: "2.4", title: "Gana dinero: vende videos a negocios",
        points: [
          "Te arma la oferta en 3 paquetes, 10 negocios de tu zona, una muestra gratis para los 3 mejores, los mensajes, la propuesta de 1 página y los videos con la marca del cliente.",
          "Todo queda guardado en la carpeta negocios.",
        ],
        cmds: ["Quiero vender videos a negocios", "¿Cuánto cobro?", "Hazme una propuesta para …"],
      },
    ],
  },
  {
    n: 3, icon: "shield", title: "Ayuda y actualizaciones",
    lessons: [
      {
        n: "3.1", title: "Soporte y actualizaciones",
        points: [
          "Si algo falla, primero escribe «doctor»: revisa tu compu y arregla lo que falte.",
          "Si sigue, escríbenos por Instagram (botón de abajo) y te ayudamos hasta que salga tu primer video.",
          "Las actualizaciones aparecen en esta misma página, sin costo.",
        ],
        cmds: ["doctor"],
      },
    ],
  },
  {
    n: 4, icon: "gift", title: "Bonus: la Bóveda",
    lessons: [
      { n: "4.1", title: "Lo que pasó de verdad", points: ["Qué se hizo para crecer la cuenta y tu plan de la semana 1."], files: [{ name: "ATOM Elite - Boveda 1 - plan-semana-1.pdf", title: "Tu plan de la semana 1", tag: "Bonus" }] },
      { n: "4.2", title: "Qué vender con tus videos", points: ["Los 3 caminos, cómo elegir uno y tu plan de 3 días."], files: [{ name: "ATOM Elite - Boveda 2 - elige-tu-camino.pdf", title: "Elige tu camino", tag: "Bonus" }] },
      { n: "4.3", title: "Tus primeros clientes", points: ["Oferta en 3 paquetes, lista, muestra, mensajes, objeciones, cierre y plan de 30 días."], files: [{ name: "ATOM Elite - Boveda 3 - primeros-clientes.pdf", title: "Tus primeros clientes", tag: "Bonus" }] },
      { n: "4.4", title: "Socios", points: ["Cómo funciona el programa de socios y su plan de 14 días."], files: [{ name: "ATOM Elite - Boveda 4 - socios-atom.pdf", title: "Socios", tag: "Bonus" }] },
      { n: "4.5", title: "Lo que viene", points: ["Tu plan de los próximos 30 días."], files: [{ name: "ATOM Elite - Boveda 5 - proximos-30-dias.pdf", title: "Tus próximos 30 días", tag: "Bonus" }] },
    ],
  },
  {
    n: 5, icon: "package", title: "Actualizaciones",
    lessons: [
      {
        n: "5.1", title: "Sistema 2.0",
        points: [
          "Lo nuevo: guiones contados como historia y revisados antes de grabar, retos para el espectador, más elementos en pantalla y efectos de sonido, personas más expresivas en 3D y más revisiones antes de entregar.",
          "Si empiezas hoy, ya lo tienes: es el Sistema 2.0 de la clase 1.2.",
          "Si ya usabas la versión 1: descomprime el 2.0 en una carpeta nueva (no sobrescribas la anterior), mete los 2 ZIP de ejemplos, ábrela en tu IA y escribe «actualízame desde mi carpeta anterior». Trae tus preferencias, marca, clave, temas y proyectos.",
        ],
        cmds: ["actualízame desde mi carpeta anterior"],
        files: [{ name: "ATOM ELITE.zip", title: "Sistema 1 (versión anterior)", tag: "Opcional", note: "Solo si la necesitas: para empezar usa el Sistema 2.0." }],
      },
    ],
  },
];

const TAG_CLASS: Record<string, string> = { "Empieza aquí": "main", Obligatorio: "req" };
const COURSE_FILES = new Set(MODULES.flatMap((m) => m.lessons.flatMap((l) => (l.files ?? []).map((f) => f.name))));

function FileRow({ spec, file }: { spec: FileSpec; file?: DownloadFile }) {
  return (
    <li className={file ? "ma-file" : "ma-file ma-file-soon"}>
      <span className="ma-file-ic"><Icon name={fileIcon(spec.name)} /></span>
      <span className="ma-file-txt">
        <strong>{spec.title}{spec.tag && <em className={`ma-tag ma-tag-${TAG_CLASS[spec.tag] ?? "opt"}`}>{spec.tag}</em>}</strong>
        {spec.note && <span className="ma-file-note">{spec.note}</span>}
        <small>{spec.name}{file?.size ? ` · ${size(file.size)}` : ""}</small>
      </span>
      {file ? (
        <a className="ma-dl" href={`/api/descarga?f=${encodeURIComponent(file.name)}`}><Icon name="download" /> Descargar</a>
      ) : (
        <span className="ma-dl ma-dl-soon"><Icon name="clock" /> Muy pronto</span>
      )}
    </li>
  );
}

export default async function MisAccesos() {
  const session = await currentSession();
  if (!session) redirect("/acceso");
  const [order, customer, files] = await Promise.all([
    findPaidOrder(session.email),
    findCustomer(session.email).catch(() => null),
    listDownloads().catch((err) => { console.error("mis-accesos: archivos", err); return [] as DownloadFile[]; }),
  ]);
  if (!order) redirect("/api/acceso/salir");

  const byName = new Map(files.map((f) => [f.name, f]));
  const extra = files.filter((f) => !COURSE_FILES.has(f.name)).sort((a, b) => a.name.localeCompare(b.name));
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
          <p className="ma-sub">Aquí tienes todo para hacer tu primer video viral: 5 módulos, en orden. Entraste como <strong>{session.email}</strong>.</p>
          <p className="ma-session"><Icon name="clock" /> Tu sesión vence en {minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`}. Después vuelves a entrar con tu correo.</p>
        </div>
      </section>

      <nav className="ma-mods-nav" aria-label="Módulos">
        {MODULES.map((m) => (
          <a key={m.n} href={`#modulo-${m.n}`}><span>{m.n}</span>{m.title}</a>
        ))}
      </nav>

      {MODULES.map((m) => (
        <section key={m.n} id={`modulo-${m.n}`} className="ma-block ma-mod">
          <h2><span className="ma-mod-ic"><Icon name={m.icon} /></span><span><small>Módulo {m.n}</small>{m.title}</span></h2>
          <ol className="ma-lessons">
            {m.lessons.map((l) => (
              <li key={l.n} className="ma-lesson">
                <h3><span>{l.n}</span>{l.title}</h3>
                <ul className="ma-points">{l.points.map((p) => <li key={p}>{p}</li>)}</ul>
                {l.cmds && (
                  <div className="ma-cmds"><span>Escríbele:</span>{l.cmds.map((c) => <code key={c}>{c}</code>)}</div>
                )}
                {l.files && (
                  <ul className="ma-files">{l.files.map((f) => <FileRow key={f.name} spec={f} file={byName.get(f.name)} />)}</ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}

      {extra.length > 0 && (
        <section className="ma-block">
          <h2>Más archivos</h2>
          <ul className="ma-files">{extra.map((f) => <FileRow key={f.name} spec={{ name: f.name, title: label(f.name) }} file={f} />)}</ul>
        </section>
      )}

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
