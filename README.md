# metodoatomico

Proyecto Next.js para metodo-atomico.lat. Por ahora no muestra nada: `proxy.ts` redirige
todo el tráfico (cualquier ruta) al link de afiliado de Hotmart
`https://go.hotmart.com/N108193402G`, pasando los parámetros de la URL tal cual
(fbclid, utm_*, src, sck…).

Ejemplo: `metodo-atomico.lat/lo-que-sea?fbclid=abc&utm_source=fb`
→ `https://go.hotmart.com/N108193402G?fbclid=abc&utm_source=fb`
