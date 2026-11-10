// Mercados nuevos con Whop: /us (inglés) y /india (hindi). La página principal (/) sigue con dLocal Go
// y no usa nada de este archivo. Comparten Supabase (mismas tablas) con la página principal.

export type MarketId = "us" | "india";

export type Market = {
  id: MarketId;
  lang: "en" | "hi";
  brand: string;
  /** Lo que se ve en la página. El cobro real lo define el plan de Whop. */
  priceLabel: string;
  price: number;
  currency: string;
  /** Prefijo de order_id en Supabase: así se distingue de qué página vino cada venta. */
  orderPrefix: string;
  whopPlan: string;
  metaPixel: string;
  tiktokPixel: string;
  ogImage: string;
  title: string;
  description: string;
};

// NEXT_PUBLIC_* se lee en el navegador: hay que escribir cada nombre completo (Next lo reemplaza al compilar).
export const MARKETS: Record<MarketId, Market> = {
  us: {
    id: "us",
    lang: "en",
    brand: "Atomic Method",
    priceLabel: "$25",
    price: 25,
    currency: "USD",
    orderPrefix: "us",
    whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_US || "",
    metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID_US || "",
    tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID_US || "",
    ogImage: "/brand/portada-atomic-method-horizontal.png",
    title: "Atomic Method · Your AI makes your viral videos",
    description: "Open Atomic Method in Claude or ChatGPT and create viral reels without filming or editing. One-time payment, lifetime access.",
  },
  india: {
    id: "india",
    lang: "hi",
    brand: "Atomic Method",
    priceLabel: "₹1,299",
    price: 1299,
    currency: "INR",
    orderPrefix: "india",
    whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_INDIA || "",
    metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID_INDIA || "",
    tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID_INDIA || "",
    ogImage: "/brand/portada-atomic-method-horizontal.png",
    title: "Atomic Method · आपका AI बनाए आपके viral videos",
    description: "Claude या ChatGPT में Atomic Method खोलें और बिना shoot या edit किए viral reels बनाएं। एक बार payment, हमेशा के लिए access.",
  },
};

export const MARKET_IDS = Object.keys(MARKETS) as MarketId[];
export const getMarket = (id: string) => (id in MARKETS ? MARKETS[id as MarketId] : null);

/** Mercado de una venta guardada en Supabase a partir de su order_id ("us_…", "india_…"). */
export const marketFromOrderId = (orderId: string | null | undefined): Market | null => {
  const prefix = orderId?.split("_")[0] ?? "";
  return MARKET_IDS.includes(prefix as MarketId) ? MARKETS[prefix as MarketId] : null;
};

// Llaves de servidor por mercado (nunca llegan al navegador).
export function serverKeys(m: Market) {
  const up = m.id.toUpperCase();
  return {
    metaToken: process.env[`META_CAPI_TOKEN_${up}`] || "",
    tiktokToken: process.env[`TIKTOK_ACCESS_TOKEN_${up}`] || "",
  };
}

export const LEGAL_SLUGS = ["terms-and-conditions", "refund-policy", "terms", "privacy"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

// ---------- Textos de la interfaz (checkout, gracias, acceso, área de compradores, correo) ----------
export type Dict = typeof EN;

const EN = {
  legal: { "terms-and-conditions": "Terms and conditions", "refund-policy": "Refund policy", terms: "Terms", privacy: "Privacy" } as Record<LegalSlug, string>,
  back: "← Back",
  checkout: {
    secure: "Secure checkout",
    oneTime: "One-time payment",
    lifetime: "Lifetime access",
    instant: "Instant access by email",
    guarantee: "7-day guarantee",
    close: "Close",
    loading: "Loading secure checkout…",
    soon: "Checkout is being set up. Please try again in a few minutes.",
    failed: "We couldn't load the checkout. Check your connection and try again.",
    poweredBy: "Payments processed securely by Whop.",
  },
  thanks: {
    title: "You're in! 🎉",
    paid: "Your payment is confirmed. We just emailed you your access link.",
    sentTo: "Sent to",
    cta: "Go to my access →",
    pendingTitle: "We're confirming your payment",
    pending: "It usually takes a few seconds. You'll get an email as soon as it's confirmed. You can refresh this page.",
    unknownTitle: "We couldn't find your payment",
    unknown: "If you already paid, check your email or sign in with the email you used to pay.",
    refresh: "Refresh",
    login: "Sign in",
    spam: "Can't find it? Check your Spam or Promotions folder.",
  },
  access: {
    kicker: "Customer access",
    title: (brand: string) => <>Enter your <span>{brand}</span></>,
    sub: "Type the email you paid with to get straight to the guide and your downloads.",
    label: "Email you purchased with",
    placeholder: "youremail@gmail.com",
    enter: "Enter my access",
    checking: "Checking",
    invalid: "Enter a valid email.",
    notFoundTitle: "We couldn't find a purchase with that email.",
    notFound: "Make sure it's the same email you used to pay. If you just paid, it can take a minute.",
    buy: (brand: string) => `Get ${brand}`,
    error: "We couldn't check your access. Please try again in a moment.",
    offline: "Check your connection and try again.",
    session: "Your session lasts 2 hours. After that, just sign in again with your email.",
    notYet: "Don't have it yet?",
    discover: (brand: string) => `Discover ${brand}`,
  },
  members: {
    kicker: "Your access",
    hello: (name: string) => (name ? `Hi, ${name}!` : "Hi!"),
    welcome: "Welcome to",
    signedAs: "Signed in as",
    finished: "You finished the course!",
    progress: (pct: number) => `You're ${pct}% through the course`,
    courseProgress: "Course progress",
    continueWith: "Continue with",
    startWith: "Start with",
    expires: (t: string) => `Your session expires in ${t}. After that, sign in again with your email.`,
    modules: "Your modules",
    module: "Module",
    moduleProgress: (n: number) => `Module ${n} progress`,
    done: "Completed",
    pending: "Pending",
    moreFiles: "More files",
    backToAccess: "← My access",
    logout: "Sign out",
    download: "Download",
    soon: "Coming soon",
    askAi: "Type this into your AI",
    files: "Files for this lesson",
    prev: "Previous",
    next: "Next",
    markDone: "Mark as completed",
    isDone: "Lesson completed",
    saveError: "We couldn't save your progress. Please try again.",
    lesson: "Lesson",
    tags: { "Empieza aquí": "Start here", Obligatorio: "Required", Opcional: "Optional", Bonus: "Bonus" } as Record<string, string>,
  },
  email: {
    subject: (brand: string) => `Your ${brand} access is ready`,
    preheader: "Your purchase is confirmed. Sign in with your email and download everything.",
    kicker: "Purchase confirmed",
    hello: (name?: string) => (name ? `Hi, ${name}!` : "Hi!"),
    yours: "It's yours.",
    thanks: (brand: string) => `Thanks for buying <strong style="color:#F7F4FF">${brand}</strong>. Everything is ready for you to make your first viral video with your AI.`,
    cta: "Go to my access →",
    with: "You sign in with this email:",
    start: "How to start",
    steps: [
      ["Sign in", "Enter your email and you're in. The session lasts 2 hours; after that, sign in the same way."],
      ["Download the folder", "Download the system ZIP and the 2 examples from your access."],
      ["Open it in your AI", "In the Claude or ChatGPT desktop app, open the folder and type «configúrame»."],
      ["Make your first video", "Write a topic in one sentence. Your AI writes the script, draws, adds the voice and subtitles."],
    ] as [string, string][],
    noReply: "This email is sent from an address that doesn't receive replies.",
  },
};

const HI: Dict = {
  legal: { "terms-and-conditions": "नियम और शर्तें", "refund-policy": "Refund policy", terms: "Terms", privacy: "Privacy" },
  back: "← वापस",
  checkout: {
    secure: "Secure checkout",
    oneTime: "एक बार payment",
    lifetime: "हमेशा के लिए access",
    instant: "Email पर तुरंत access",
    guarantee: "7 दिन की guarantee",
    close: "बंद करें",
    loading: "Secure checkout load हो रहा है…",
    soon: "Checkout अभी set up हो रहा है। कुछ मिनट बाद फिर कोशिश करें।",
    failed: "Checkout load नहीं हो पाया। अपना internet check करें और फिर कोशिश करें।",
    poweredBy: "Payment Whop के ज़रिए secure तरीके से होता है।",
  },
  thanks: {
    title: "बधाई हो! 🎉",
    paid: "आपका payment confirm हो गया है। हमने आपको access link email कर दिया है।",
    sentTo: "भेजा गया:",
    cta: "मेरे access पर जाएं →",
    pendingTitle: "हम आपका payment confirm कर रहे हैं",
    pending: "आमतौर पर कुछ seconds लगते हैं। Confirm होते ही आपको email आ जाएगा। आप यह page refresh कर सकते हैं।",
    unknownTitle: "हमें आपका payment नहीं मिला",
    unknown: "अगर आपने payment कर दिया है, तो अपना email देखें या जिस email से payment किया उससे sign in करें।",
    refresh: "Refresh करें",
    login: "Sign in करें",
    spam: "Email नहीं मिला? Spam या Promotions folder देखें।",
  },
  access: {
    kicker: "Customer access",
    title: (brand: string) => <>अपने <span>{brand}</span> में आएं</>,
    sub: "जिस email से आपने payment किया वो लिखें और सीधे guide और downloads पर पहुंचें।",
    label: "जिस email से आपने खरीदा",
    placeholder: "aapkaemail@gmail.com",
    enter: "मेरे access में जाएं",
    checking: "Check हो रहा है",
    invalid: "सही email लिखें।",
    notFoundTitle: "इस email से कोई purchase नहीं मिली।",
    notFound: "Check करें कि ये वही email है जिससे आपने payment किया। अभी payment किया है तो एक मिनट लग सकता है।",
    buy: (brand: string) => `${brand} लें`,
    error: "हम आपका access check नहीं कर पाए। थोड़ी देर बाद फिर कोशिश करें।",
    offline: "अपना internet check करें और फिर कोशिश करें।",
    session: "आपका session 2 घंटे चलता है। उसके बाद अपने email से फिर sign in करें।",
    notYet: "अभी तक नहीं लिया?",
    discover: (brand: string) => `${brand} के बारे में जानें`,
  },
  members: {
    kicker: "आपका access",
    hello: (name: string) => (name ? `नमस्ते, ${name}!` : "नमस्ते!"),
    welcome: "स्वागत है",
    signedAs: "आप sign in हैं:",
    finished: "आपने course पूरा कर लिया!",
    progress: (pct: number) => `आपका ${pct}% course पूरा हो गया`,
    courseProgress: "Course progress",
    continueWith: "आगे बढ़ें",
    startWith: "यहां से शुरू करें",
    expires: (t: string) => `आपका session ${t} में खत्म होगा। उसके बाद अपने email से फिर sign in करें।`,
    modules: "आपके modules",
    module: "Module",
    moduleProgress: (n: number) => `Module ${n} progress`,
    done: "पूरा हुआ",
    pending: "बाकी है",
    moreFiles: "और files",
    backToAccess: "← मेरा access",
    logout: "Sign out",
    download: "Download",
    soon: "जल्द आ रहा है",
    askAi: "अपने AI में यह लिखें",
    files: "इस lesson की files",
    prev: "पिछला",
    next: "अगला",
    markDone: "पूरा हुआ mark करें",
    isDone: "Lesson पूरा हुआ",
    saveError: "आपका progress save नहीं हो पाया। फिर कोशिश करें।",
    lesson: "Lesson",
    tags: { "Empieza aquí": "यहां से शुरू करें", Obligatorio: "ज़रूरी", Opcional: "Optional", Bonus: "Bonus" },
  },
  email: {
    subject: (brand: string) => `आपका ${brand} access तैयार है`,
    preheader: "आपकी purchase confirm हो गई है। अपने email से sign in करें और सब download करें।",
    kicker: "Purchase confirm",
    hello: (name?: string) => (name ? `नमस्ते, ${name}!` : "नमस्ते!"),
    yours: "अब ये आपका है।",
    thanks: (brand: string) => `<strong style="color:#F7F4FF">${brand}</strong> खरीदने के लिए धन्यवाद। अपने AI के साथ पहला viral video बनाने के लिए सब तैयार है।`,
    cta: "मेरे access पर जाएं →",
    with: "आप इस email से sign in करेंगे:",
    start: "ऐसे शुरू करें",
    steps: [
      ["Sign in करें", "अपना email डालें और आप अंदर हैं। Session 2 घंटे चलता है; उसके बाद ऐसे ही फिर sign in करें।"],
      ["Folder download करें", "अपने access से system का ZIP और 2 examples download करें।"],
      ["अपने AI में खोलें", "Claude या ChatGPT की desktop app में folder खोलें और «configúrame» लिखें।"],
      ["पहला video बनाएं", "एक line में topic लिखें। आपका AI script, drawings, voice और subtitles सब बना देता है।"],
    ],
    noReply: "यह email ऐसे address से भेजा गया है जो replies नहीं लेता।",
  },
};

export const DICTS: Record<Market["lang"], Dict> = { en: EN, hi: HI };
export const t = (m: Market) => DICTS[m.lang];
