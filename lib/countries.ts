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

// Ejemplo de cómo se escribe cada documento (placeholder del checkout). Clave "PAÍS:TIPO".
const DOC_EXAMPLES: Record<string, string> = {
  "AR:DNI": "35874126", "AR:CUIT": "20358741263", "AR:CUIL": "27358741264",
  "BO:CI": "6548712",
  "BR:CPF": "52998224725",
  "CL:RUT": "15874236-5",
  "CO:CC": "1023875416", "CO:CE": "487215", "CO:NIT": "900874512",
  "CR:CI": "115870436",
  "EC:CI": "1718547632", "EC:RUC": "1718547632001",
  "SV:DUI": "05487126-3",
  "GT:DPI": "2547812360101",
  "MX:CURP": "GARM920415MDFRRS08", "MX:RFC": "GARM920415K27",
  "PA:CIP": "8-845-1236",
  "PY:CI": "4587123", "PY:RUC": "4587123-6",
  "PE:DNI": "45873216", "PE:CE": "001538742", "PE:RUC": "20548763219",
  "DO:ID": "40215874369",
  "UY:CI": "45871236", "UY:RUT": "215487630017",
};

export function docExample(country: string, type: string) {
  return `Ej.: ${DOC_EXAMPLES[`${country}:${type}`] ?? "45873216"}`;
}
