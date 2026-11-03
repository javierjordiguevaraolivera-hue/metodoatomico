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
  "AR:DNI": "30123456", "AR:CUIT": "20301234567", "AR:CUIL": "20301234567",
  "BO:CI": "1234567",
  "BR:CPF": "12345678909",
  "CL:RUT": "12345678-9",
  "CO:CC": "1012345678", "CO:CE": "123456", "CO:NIT": "900123456",
  "CR:CI": "112345678",
  "EC:CI": "1712345678", "EC:RUC": "1712345678001",
  "SV:DUI": "01234567-8",
  "GT:DPI": "1234567890101",
  "MX:CURP": "GOMA850101HDFRRN09", "MX:RFC": "GOMA850101AB1",
  "PA:CIP": "8-123-456",
  "PY:CI": "1234567", "PY:RUC": "1234567-8",
  "PE:DNI": "12345678", "PE:CE": "001234567", "PE:RUC": "20123456789",
  "DO:ID": "00112345678",
  "UY:CI": "12345678", "UY:RUT": "211234560018",
};

export function docExample(country: string, type: string) {
  return `Ej.: ${DOC_EXAMPLES[`${country}:${type}`] ?? "12345678"}`;
}
