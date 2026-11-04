import Icon from "@/components/Icon";
import type { FileSpec } from "@/lib/curso";
import type { IconName } from "@/lib/icons";
import type { DownloadFile } from "@/lib/supabase";

const size = (b: number | null) => (b == null ? "" : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const fileIcon = (name: string): IconName =>
  /\.(zip|rar|7z)$/i.test(name) ? "package" : /\.(mp4|mov|webm)$/i.test(name) ? "file-video" : /\.(png|jpe?g|webp|gif)$/i.test(name) ? "image" : "file-text";
const TAG_CLASS: Record<string, string> = { "Empieza aquí": "main", Obligatorio: "req" };

export function FileRow({ spec, file }: { spec: FileSpec; file?: DownloadFile }) {
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

export function TopBar({ back }: { back?: boolean }) {
  return (
    <header className="ma-top">
      {back ? (
        <a className="ma-back" href="/mis-accesos">← Mis accesos</a>
      ) : (
        <a href="/" aria-label="Método Atómico"><img src="/brand/metodo-atomico-logo.png" alt="Método Atómico" width={150} height={40} /></a>
      )}
      <a className="ma-out" href="/api/acceso/salir"><Icon name="log-out" /> Salir</a>
    </header>
  );
}

export function Progress({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ma-prog">
      <div className="ma-prog-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label ?? "Avance"}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="ma-prog-txt">{value}/{total}</span>
    </div>
  );
}

export function Help() {
  return (
    <>
      <footer className="ma-foot">
        <a href="/terminos-y-condiciones">Términos y condiciones</a>
        <a href="/garantia-y-reembolsos">Garantía y reembolsos</a>
        <a href="/privacidad">Privacidad</a>
      </footer>
    </>
  );
}
