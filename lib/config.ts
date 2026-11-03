// Datos del producto y de las cuentas. Lo secreto vive en variables de entorno (ver .env.example).

export const PRODUCT_NAME = "Método Atómico";
export const PRICE_USD = 25;
export const CURRENCY = "USD";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1066777946382851";
// TikTok: píxel + Events API (TIKTOK_ACCESS_TOKEN)
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "DBKUCKRC77U4VUSMEKA0";

// "production" usa las llaves y el checkout reales; cualquier otro valor usa el sandbox de dLocal Go.
export const DLOCALGO_LIVE = process.env.NEXT_PUBLIC_DLOCALGO_ENV === "production";
export const DLOCALGO_SDK_URL = DLOCALGO_LIVE
  ? "https://checkout.dlocalgo.com/js/dlocalgo-smartfields-bundled.js"
  : "https://checkout-sbx.dlocalgo.com/js/dlocalgo-smartfields-bundled.js";
