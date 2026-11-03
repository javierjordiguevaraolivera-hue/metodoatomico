# metodoatomico

Landing de **Método Atómico** en Next.js para Vercel (www.metodoatomico.lat). Producto único de **$25 USD**, cobrado con **dLocal Go** sin salir de la página.

## Cómo está armada

- `content/landing.html`, `app/landing.css`, `public/landing/runtime.js` y `public/landing/fx.js`: el HTML original de ATOM convertido, con la marca, el precio y los colores de Método Atómico.
- `components/Checkout.tsx`: ventana de pago que se abre al hacer clic en cualquier botón de compra. La tarjeta va en el campo seguro de dLocal Go (SmartFields). "Otros métodos" abre el checkout de dLocal Go.
- `app/api/checkout/*`: crea y confirma el pago en dLocal Go.
- `app/api/dlocal/webhook`: dLocal Go avisa aquí cuando cambia un pago (firma verificada). Si quedó pagado, manda Purchase a la API de Conversiones de Meta.
- `app/gracias`: página después de pagar. Si el pago está confirmado, dispara Purchase en los píxeles de Meta y TikTok y en la CAPI.
- `components/Pixels.tsx`, `lib/track-client.ts`, `app/api/track`: píxeles de Meta y TikTok, más la CAPI de Meta y la Events API de TikTok (`lib/tiktok.ts`).
- `scripts/iconos.py`: cambia los emojis por íconos SVG de [Iconify](https://iconify.design) (Lucide, Simple Icons, Logos) y genera `lib/icons.ts`. Los SVG quedan dentro del código; la página no depende de Iconify al cargar.

## Eventos

| Momento | Meta píxel | Meta CAPI | TikTok píxel | TikTok Events API |
|---|---|---|---|---|
| Entran a la página | PageView | PageView | page | — |
| Primer scroll (300 px) | ViewContent | ViewContent | ViewContent | ViewContent |
| Clic en comprar | InitiateCheckout | InitiateCheckout | InitiateCheckout | InitiateCheckout |
| Pago confirmado | Purchase (en /gracias) | Purchase (/gracias + webhook) | CompletePayment (en /gracias) | CompletePayment (/gracias + webhook) |

Cada evento lleva el mismo `event_id` en el píxel y en la API (Meta y TikTok), así cada plataforma lo cuenta una vez. A TikTok no se manda PageView por API porque `ttq.page()` no acepta `event_id`. La CAPI agrega IP, navegador, `_fbp`/`_fbc`, `external_id` y la ubicación que da Vercel (ciudad, región, código postal, país). En Purchase también van el correo y el nombre del comprador.

## Variables de entorno

Ver `.env.example`. Para probar en tu compu, cópialo como `.env.local`. En Vercel van en Settings → Environment Variables.

## Desarrollo

```bash
npm install
npm run dev
```
