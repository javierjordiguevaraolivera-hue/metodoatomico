// Países donde cobra dLocal Go y los documentos que pide cada uno al pagar con tarjeta.
export const COUNTRIES: { code: string; name: string; docs: string[] }[] = [
  { code: "AR", name: "Argentina", docs: ["DNI", "CUIT", "CUIL"] },
  { code: "BO", name: "Bolivia", docs: ["CI"] },
  { code: "BR", name: "Brasil", docs: ["CPF"] },
  { code: "CL", name: "Chile", docs: ["RUT"] },
  { code: "CO", name: "Colombia", docs: ["CC", "CE", "NIT"] },
  { code: "CR", name: "Costa Rica", docs: ["CI"] },
  { code: "EC", name: "Ecuador", docs: ["CI", "RUC"] },
  { code: "SV", name: "El Salvador", docs: ["DUI"] },
  { code: "GT", name: "Guatemala", docs: ["DPI"] },
  { code: "MX", name: "México", docs: ["CURP", "RFC"] },
  { code: "PA", name: "Panamá", docs: ["CIP"] },
  { code: "PY", name: "Paraguay", docs: ["CI", "RUC"] },
  { code: "PE", name: "Perú", docs: ["DNI", "CE", "RUC"] },
  { code: "DO", name: "República Dominicana", docs: ["ID"] },
  { code: "UY", name: "Uruguay", docs: ["CI", "RUT"] },
];

export const DEFAULT_COUNTRY = "MX";

export function isCountry(code: unknown): code is string {
  return typeof code === "string" && COUNTRIES.some((c) => c.code === code);
}
