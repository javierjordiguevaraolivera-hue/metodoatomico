import type { IconName } from "./icons";
import * as india from "./curso-india";
import type { MarketId } from "./markets";
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

const COURSES = { us, india } as unknown as Record<MarketId, Course>;
export const courseFor = (id: MarketId) => COURSES[id];
