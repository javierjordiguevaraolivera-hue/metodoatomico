import Icon from "@/components/Icon";
import type { MarketFile as FileSpec } from "@/lib/curso-market";
import type { IconName } from "@/lib/icons";
import { LEGAL_SLUGS, type Market, t } from "@/lib/markets";
import type { DownloadFile } from "@/lib/supabase";

// Piezas del área de compradores de /us e /india (las de la página principal están en Curso.tsx, sin cambios).
const size = (b: number | null) => (b == null ? "" : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const fileIcon = (name: string): IconName =>
  /\.(zip|rar|7z)$/i.test(name) ? "package" : /\.(mp4|mov|webm)$/i.test(name) ? "file-video" : /\.(png|jpe?g|webp|gif)$/i.test(name) ? "image" : "file-text";
const MAIN = ["empieza aquí", "start here"];
const REQ = ["obligatorio", "required"];
// La primera etiqueta del curso es "empieza aquí" y la de los ejemplos "obligatorio": se reconocen también en hindi por el archivo.
const tagClass = (spec: FileSpec) => {
  const tag = (spec.tag ?? "").toLowerCase();
  if (MAIN.includes(tag) || /v2\.zip$/i.test(spec.name)) return "main";
  if (REQ.includes(tag) || /Ejemplo .+\.zip$/i.test(spec.name)) return "req";
  return "opt";
};

export function MarketFileRow({ market, spec, file }: { market: Market; spec: FileSpec; file?: DownloadFile }) {
  const d = t(market).members;
  return (
    <li className={file ? "ma-file" : "ma-file ma-file-soon"}>
      <span className="ma-file-ic"><Icon name={fileIcon(spec.name)} /></span>
      <span className="ma-file-txt">
        <strong>{spec.title}{spec.tag && <em className={`ma-tag ma-tag-${tagClass(spec)}`}>{spec.tag}</em>}</strong>
        {spec.note && <span className="ma-file-note">{spec.note}</span>}
        <small>{spec.name}{file?.size ? ` · ${size(file.size)}` : ""}</small>
      </span>
      {file ? (
        <a className="ma-dl" href={`/api/descarga?f=${encodeURIComponent(file.name)}`}><Icon name="download" /> {d.download}</a>
      ) : (
        <span className="ma-dl ma-dl-soon"><Icon name="clock" /> {d.soon}</span>
      )}
    </li>
  );
}

export function MarketTopBar({ market, back }: { market: Market; back?: boolean }) {
  const d = t(market).members;
  return (
    <header className="ma-top">
      {back ? (
        <a className="ma-back" href={`/${market.id}/members`}>{d.backToAccess}</a>
      ) : (
        <a href={`/${market.id}`} aria-label={market.brand}><img src="/brand/atomic-method-logo.png" alt={market.brand} width={150} height={42} /></a>
      )}
      <a className="ma-out" href={`/${market.id}/logout`}><Icon name="log-out" /> {d.logout}</a>
    </header>
  );
}

export function MarketFooter({ market }: { market: Market }) {
  const d = t(market);
  return (
    <footer className="ma-foot">
      {LEGAL_SLUGS.filter((s) => s !== "terms").map((s) => <a key={s} href={`/${market.id}/${s}`}>{d.legal[s]}</a>)}
    </footer>
  );
}
