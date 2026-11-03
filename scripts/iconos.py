# Cambia los emojis de la landing por íconos SVG de Iconify (https://iconify.design).
# Los SVG se bajan una vez de la API de Iconify y quedan escritos dentro del HTML/JS (no se piden al cargar la página).
# También genera lib/icons.ts para los componentes de React.
# Uso: python scripts/iconos.py   (se puede correr más de una vez: lo ya reemplazado no se toca)
import json, re, sys, time, urllib.error, urllib.request

ICONS = {
    # interfaz (Lucide)
    'x': 'lucide:x', 'volume': 'lucide:volume-2', 'mute': 'lucide:volume-x', 'check': 'lucide:check',
    'file-video': 'lucide:file-video', 'image': 'lucide:image', 'file-text': 'lucide:file-text',
    'hand': 'lucide:hand', 'arrow-up-right': 'lucide:arrow-up-right', 'pause': 'lucide:pause', 'play': 'lucide:play',
    'restart': 'lucide:rotate-ccw', 'thumbs-up': 'lucide:thumbs-up', 'pencil': 'lucide:pencil',
    'card': 'lucide:credit-card', 'zap': 'lucide:zap', 'shield': 'lucide:shield-check', 'lock': 'lucide:lock',
    'smartphone': 'lucide:smartphone', 'gift': 'lucide:gift', 'circle-check': 'lucide:circle-check',
    'target': 'lucide:target', 'search': 'lucide:search', 'pen': 'lucide:pen-line', 'mic': 'lucide:mic',
    'plan': 'lucide:layout-list', 'magnet': 'lucide:magnet', 'palette': 'lucide:palette', 'audio': 'lucide:audio-lines',
    'package': 'lucide:package', 'factory': 'lucide:factory', 'notebook': 'lucide:notebook-pen', 'party': 'lucide:party-popper',
    'atom': 'lucide:atom', 'sparkles': 'lucide:sparkles', 'pointer': 'lucide:pointer', 'mail': 'lucide:mail',
    'banknote': 'lucide:banknote', 'landmark': 'lucide:landmark',
    'circle-x': 'lucide:circle-x', 'cart': 'lucide:shopping-cart',
    # marcas
    'instagram': 'simple-icons:instagram', 'pix': 'simple-icons:pix',
    'visa': 'logos:visa', 'mastercard': 'logos:mastercard', 'amex': 'logos:amex',
}

def fetch_set(prefix, names):
    # Una sola llamada por colección (API JSON de Iconify), para no topar con su límite de pedidos.
    url = f'https://api.iconify.design/{prefix}.json?icons={",".join(names)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (metodo-atomico iconos)'})
    for intento in range(4):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code != 429 or intento == 3:
                raise
            time.sleep(15 * (intento + 1))

def to_svg(data, name):
    alias = data.get('aliases', {}).get(name)
    icon = data['icons'].get(alias['parent'] if alias else name)
    if not icon:
        sys.exit(f'Iconify no devolvió {data["prefix"]}:{name}')
    w = icon.get('width', data.get('width', 16))
    h = icon.get('height', data.get('height', 16))
    width = '1em' if w == h else f'{round(w / h, 2)}em'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="1em" viewBox="0 0 {w} {h}">{icon["body"]}</svg>'

by_set = {}
for key, full in ICONS.items():
    prefix, name = full.split(':')
    by_set.setdefault(prefix, []).append((key, name))
svgs = {}
for prefix, pairs in by_set.items():
    data = fetch_set(prefix, [n for _, n in pairs])
    for key, name in pairs:
        svgs[key] = to_svg(data, name)
# Copia local para otros scripts que necesiten los mismos íconos
json.dump(svgs, open('scripts/icons-cache.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

def ic(key, cls='ic'):
    return svgs[key].replace('<svg ', f'<svg class="{cls}" aria-hidden="true" ', 1)

EMOJI = re.compile('[🀀-🫿☀-➿️←-⇿■-◿✀-➿]|❚')

def rep(text, old, new, label, required=True):
    if old in text:
        return text.replace(old, new)
    # Si ya no está el emoji, ese cambio ya se hizo en una corrida anterior.
    if new in text or not required or not any(e in text for e in EMOJI.findall(old)):
        return text
    sys.exit(f'No encontré: {label}')

# ---------- content/landing.html ----------
p = 'content/landing.html'
h = open(p, encoding='utf-8').read()
h = rep(h, 'Cerrar ✕</button>', f'Cerrar {ic("x")}</button>', 'cerrar reel/intro')
h = rep(h, 'Toca para ver con sonido 🔊', f'Toca para ver con sonido {ic("volume")}', 'tap sonido')
h = re.sub(r'>(\s*)✓(\s*)', lambda m: f'>{m.group(1)}{ic("check")}{m.group(2)}', h)
h = rep(h, '>▶ tuerca.mp4', f'>{ic("file-video")} tuerca.mp4', 'archivo video')
h = rep(h, '>▣ portada.jpg', f'>{ic("image")} portada.jpg', 'portada')
h = rep(h, '>≡ texto-del-post.txt', f'>{ic("file-text")} texto-del-post.txt', 'texto post')
h = rep(h, '¡Hola, soy Atomín! 👋', f'¡Hola, soy Atomín! {ic("hand")}', 'burbuja hola', required=False)
h = re.sub(r'Atomín</b>! 👋', f'Atomín</b>! {ic("hand")}', h)
h = h.replace('Instagram ↗', f'Instagram {ic("arrow-up-right")}')
h = rep(h, 'aria-label="Silenciar sonidos">🔊</button>', f'aria-label="Silenciar sonidos">{ic("volume")}</button>', 'botón sonido nav')
h = rep(h, 'aria-label="Pausar" hidden>❚❚</button>', f'aria-label="Pausar" hidden>{ic("pause")}</button>', 'pausa fábrica')
h = rep(h, 'aria-label="Volver a empezar">↺', f'aria-label="Volver a empezar">{ic("restart")}', 'reiniciar fábrica')
h = rep(h, '👍 Aprobar guion', f'{ic("thumbs-up")} Aprobar guion', 'aprobar')
h = rep(h, '✏️ Pedir un cambio', f'{ic("pencil")} Pedir un cambio', 'pedir cambio')
h = rep(h, '>💳 Tarjeta<', f'>{ic("card")} Tarjeta {ic("visa", "ic ic-logo")}{ic("mastercard", "ic ic-logo")}{ic("amex", "ic ic-logo")}<', 'chip tarjeta')
h = rep(h, '>Pix<', f'>{ic("pix")} Pix<', 'chip pix', required=False)
h = rep(h, '>⚡ Acceso inmediato al correo<', f'>{ic("zap")} Acceso inmediato al correo<', 'chip acceso')
h = rep(h, '>🛡️ Garantía de 7 días<', f'>{ic("shield")} Garantía de 7 días<', 'chip garantía', required=False)
h = rep(h, '>💬 ¿Dudas antes de comprar?', f'>{ic("instagram")} ¿Dudas antes de comprar?', 'dudas instagram')
h = rep(h, '>📲 ¿Estás en el celular?', f'>{ic("smartphone")} ¿Estás en el celular?', 'guardar link')
h = rep(h, '>🎁 Bonus La Bóveda', f'>{ic("gift")} Bonus La Bóveda', 'bonus')
open(p, 'w', encoding='utf-8').write(h)

# ---------- public/landing/runtime.js ----------
p = 'public/landing/runtime.js'
r = open(p, encoding='utf-8').read()
r = rep(r, "var done = function (t) { btn.textContent = t; };", "var done = function (t) { btn.innerHTML = t; };", 'done innerHTML')
r = rep(r, "done('✅ Link copiado.", "done('" + ic('circle-check').replace("'", "\\'") + " Link copiado.", 'link copiado')
open(p, 'w', encoding='utf-8').write(r)

# ---------- public/landing/fx.js ----------
p = 'public/landing/fx.js'
f = open(p, encoding='utf-8').read()
js = lambda k: ic(k).replace("'", "\\'")
f = rep(f, "b.textContent = on ? '🔊' : '🔇';", f"b.innerHTML = on ? '{js('volume')}' : '{js('mute')}';", 'toggle sonido')
for emoji, key in [('🎯', 'target'), ('🔎', 'search'), ('✍️', 'pen'), ('🎙️', 'mic'), ('🗂️', 'plan'), ('🪝', 'magnet'),
                   ('🎨', 'palette'), ('✅', 'circle-check'), ('🔊', 'audio'), ('📦', 'package')]:
    f = rep(f, f"{{ icon: '{emoji}',", f"{{ icon: '{js(key)}',", f'paso {emoji}')
f = rep(f, '>⚡ Encender la fábrica', f'>{ic("zap")} Encender la fábrica', 'encender')
f = rep(f, '¡pero tú lo puedes fabricar! 🏭', f'¡pero tú lo puedes fabricar! {ic("factory")}', 'fabricar')
f = rep(f, '<span>📝 Tu tema:', f'<span>{ic("notebook")} Tu tema:', 'tu tema')
f = rep(f, '<span>🎨 Estilo:', f'<span>{ic("palette")} Estilo:', 'estilo')
f = f.replace('>▶ Escuchar a Atomín', f'>{ic("play")} Escuchar a Atomín')
f = rep(f, 'Tu video salió de la fábrica 🎉', f'Tu video salió de la fábrica {ic("party")}', 'salió')
f = rep(f, '<span>▶ ${esc(slug(S.topic))}', f'<span>{ic("file-video")} ${{esc(slug(S.topic))}}', 'archivo')
f = rep(f, '<span>▣ portada.jpg</span><span>≡ texto-del-post.txt</span>', f'<span>{ic("image")} portada.jpg</span><span>{ic("file-text")} texto-del-post.txt</span>', 'archivos')
f = rep(f, 'data-action="${v.a}">▶ ${v.l}', f'data-action="${{v.a}}">{ic("play")} ${{v.l}}', 'ver video')
f = rep(f, "btnPause.textContent = '❚❚';", f"btnPause.innerHTML = '{js('pause')}';", 'pausa reset')
f = rep(f, "b.textContent = S.paused ? '▶' : '❚❚';", f"b.innerHTML = S.paused ? '{js('play')}' : '{js('pause')}';", 'pausa toggle')
f = rep(f, "'Listo, lo cambio 👌'", "'Listo, lo cambio.'", 'lo cambio')
f = rep(f, "'Se lo dices como en un chat… ✍️ Listo, lo corrigió.'", "'Se lo dices como en un chat… Listo, lo corrigió.'", 'chat corrigió')
f = rep(f, '<p class="fx-mini">👉 Aquí', f'<p class="fx-mini">{ic("pointer")} Aquí', 'aquí se detiene')
f = rep(f, "tag.textContent = '⚛ ' + S.topic;", f"tag.innerHTML = '{js('atom')} ' + esc(S.topic);", 'etiqueta tema')
f = rep(f, "! 👋<br>", f"! {js('hand')}<br>", 'msg hola')
f = rep(f, "<b>lo subes.</b> 😎'", f"<b>lo subes.</b> {js('sparkles')}'", 'msg subes')
f = rep(f, "<b>⚛️</b>'", f"<b>{js('atom')}</b>'", 'msg cosquillas')
open(p, 'w', encoding='utf-8').write(f)

# ---------- lib/icons.ts (React) ----------
used = ['x', 'shield', 'lock', 'card', 'visa', 'mastercard', 'amex', 'circle-check', 'banknote', 'mail', 'zap', 'landmark', 'cart']
with open('lib/icons.ts', 'w', encoding='utf-8') as out:
    out.write('// Generado por scripts/iconos.py desde la API de Iconify. No editar a mano.\n')
    out.write('export const ICONS = ' + json.dumps({k: svgs[k] for k in used}, ensure_ascii=False, indent=2) + ' as const;\n')
    out.write('export type IconName = keyof typeof ICONS;\n')

# ---------- Revisión: no debe quedar ningún emoji ----------
emoji = re.compile('[\U0001F000-\U0001FAFF☀-➿️]')
for p in ('content/landing.html', 'public/landing/runtime.js', 'public/landing/fx.js'):
    left = sorted(set(emoji.findall(open(p, encoding='utf-8').read())))
    print(p, 'quedan:', left)
