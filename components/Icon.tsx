import { ICONS, type IconName } from "@/lib/icons";

// Ícono SVG de Iconify (ver scripts/iconos.py). Hereda el color y el tamaño de la letra.
export default function Icon({ name, logo = false }: { name: IconName; logo?: boolean }) {
  return <span className={logo ? "ic-wrap ic-wrap-logo" : "ic-wrap"} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}
