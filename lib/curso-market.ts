import type { IconName } from "./icons";
import * as es from "./curso";
import * as india from "./curso-india";
import type { Market } from "./markets";
import * as us from "./curso-us";

// Contenido del curso por mercado. Las clases usan las mismas rutas ("1-2") y los mismos archivos que el original,
// así el avance guardado en Supabase y las descargas son los mismos en cualquier idioma.
// Cada traducción tiene sus propias etiquetas: aquí se ven todas con un tipo común.
export type MarketFile = { name: string; title: string; tag?: string; note?: string };
export type MarketModule = { n: number; icon: IconName; title: string };
export type MarketLesson = { n: string; title: string; points: string[]; cmds?: string[]; files?: MarketFile[]; slug: string; module: MarketModule; index: number };
type Course = {
  MODULES: MarketModule[];
  LESSONS: MarketLesson[];
  findLesson: (slug: string) => MarketLesson | null;
  COURSE_FILES: Set<string>;
};

// Por idioma de la página: /us en inglés o español (el curso original), /india en hindi o inglés.
const COURSES = { us, "us-es": es, india, "india-en": us } as unknown as Record<string, Course>;
export const courseFor = (m: Market) => COURSES[m.variant] ?? COURSES[m.id];
