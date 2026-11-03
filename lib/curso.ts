import type { IconName } from "@/lib/icons";

// El curso, por módulos y clases (mismo orden que la guía). Los archivos se entregan tal cual:
// el sistema busca los ejemplos por su nombre, así que aquí solo se nombran y se explican.
export type FileSpec = { name: string; title: string; tag?: "Empieza aquí" | "Obligatorio" | "Bonus" | "Opcional"; note?: string };
export type Lesson = { n: string; title: string; points: string[]; cmds?: string[]; files?: FileSpec[] };
export type Module = { n: number; icon: IconName; title: string; lessons: Lesson[] };

const EJEMPLO_NOTE = "Ponlo dentro de la carpeta del sistema tal cual: sin descomprimirlo ni cambiarle el nombre.";

export const MODULES: Module[] = [
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

// Lista plana para navegar: cada clase con su ruta (/mis-accesos/1-2), su módulo y su posición.
export type FlatLesson = Lesson & { slug: string; module: Module; index: number };
export const LESSONS: FlatLesson[] = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m }))).map((l, index) => ({
  ...l, slug: l.n.replace(".", "-"), index,
}));
export const findLesson = (slug: string) => LESSONS.find((l) => l.slug === slug) ?? null;
export const COURSE_FILES = new Set(LESSONS.flatMap((l) => (l.files ?? []).map((f) => f.name)));
