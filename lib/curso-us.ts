import type { IconName } from "@/lib/icons";

// The course (US English), by modules and lessons (same order as the guide). Files are delivered as-is:
// the system finds the examples by their name, so here they are only named and explained.
// Same shapes as lib/curso.ts; only the tag labels are in English.
export type FileSpec = { name: string; title: string; tag?: "Start here" | "Required" | "Bonus" | "Optional"; note?: string };
export type Lesson = { n: string; title: string; points: string[]; cmds?: string[]; files?: FileSpec[] };
export type Module = { n: number; icon: IconName; title: string; lessons: Lesson[] };

const EJEMPLO_NOTE = "Put it inside the system folder exactly as it is: don't unzip it or rename it.";

export const MODULES: Module[] = [
  {
    n: 1, icon: "zap", title: "Start here",
    lessons: [
      {
        n: "1.1", title: "Welcome",
        points: [
          "You give it a topic in one sentence and your AI hands you a finished vertical video: script, voice, animation, captions, cover and the caption to post.",
          "In 15 minutes: download, open the folder in your AI, type “configúrame” (means “set me up”) and ask for your first video or your calendar for the month.",
          "Includes 4 packs, 3 video styles, covers, descriptions, repurposing and the kit to sell videos to businesses.",
        ],
      },
      {
        n: "1.2", title: "Download your 3 files",
        points: [
          "All 3 are required: the system uses the 2 examples as a quality reference for every video.",
          "Unzip System 2.0 into a new folder and put the 2 example ZIPs inside it exactly as they are.",
          "They're for personal use: don't share or resell them.",
        ],
        files: [
          { name: "ATOM ELITE v2.zip", title: "System 2.0", tag: "Start here", note: "Unzip it into a new folder: that's the folder you open in your AI." },
          { name: "ATOM ELITE - Ejemplo estrella verde.zip", title: "Example: green star", tag: "Required", note: EJEMPLO_NOTE },
          { name: "ATOM ELITE - Ejemplo alcohol.zip", title: "Example: alcohol", tag: "Required", note: EJEMPLO_NOTE },
        ],
      },
      {
        n: "1.3", title: "Install it in your AI",
        points: [
          "It only works in the desktop app (Mac or Windows), not on the web.",
          "Claude: Code tab › Select folder › choose the folder. ChatGPT: Codex › + next to Projects › leave it on Local › choose the folder. If it asks whether you trust it, say yes.",
          "Type “configúrame” (means “set me up”). It installs what's missing, organizes the examples and asks you for your language, niche, how to end your videos and whether you want sound effects. Accept when it asks to install programs; the first time takes a few minutes.",
          "ElevenLabs key (the voice): open PEGA-AQUI-TU-CLAVE-ELEVENLABS.txt (“paste your ElevenLabs key here”), paste your key after CLAVE= and save. Never paste it in the chat.",
          "How to get it: elevenlabs.io › Developers › API Keys › Create Key › turn off “Restrict Key” › copy the key that starts with sk_ (the short ID won't work).",
          "When it's done it shows you the menu. The first cover asks for your brand color. The same steps, in more detail, are in EMPIEZA-AQUI.html (“start here”) inside the folder.",
        ],
        cmds: ["configúrame (means “set me up”)", "menú (means “menu”)"],
      },
      {
        n: "1.4", title: "Your first video",
        points: [
          "Ask for it in your own words. No topic? Ask for 5 topics or your calendar for the month.",
          "It asks you for the style or recommends one; it researches, writes the script, draws and reviews itself.",
          "It shows you 2 openings and the script: pick one, ask for changes or type “adelante” (means “go ahead”).",
          "It can take up to 1 hour: leave your computer on and the app open.",
          "The salida (“output”) folder ends up with the video, the flyer.jpg cover and the descriptions for each platform.",
          "To save usage: when the conversation gets long, open a new one in the same folder. Goal: 1 video a day for 30 days.",
        ],
        cmds: ["Hazme un video sobre … (means “Make me a video about …”)", "adelante (means “go ahead”)", "Give me 5 topics"],
      },
    ],
  },
  {
    n: 2, icon: "sparkles", title: "Your packs",
    lessons: [
      {
        n: "2.1", title: "Endless ideas: calendar, niches, 100 topics and series",
        points: [
          "Calendar: 30 days of topics for your niche, one per day, with verified facts.",
          "Niches: 11 ready to go (science, human body, history, money, psychology, technology, animals, food, fun facts, business, sports) or one of your own.",
          "100 proven topics in reel format; it remembers the ones you've already used.",
          "Series: one big topic in 3 to 5 parts, each with a hook into the next.",
        ],
        cmds: ["Build my calendar for the month", "Make the video for day 5", "Pick my niche", "Make topic 37", "Make me a series about …", "Continue the series"],
      },
      {
        n: "2.2", title: "Make them blow up: covers, descriptions and repurposing",
        points: [
          "Automatic cover (flyer.jpg) designed for TikTok, Reels and Shorts: it makes 3 and gives you the best one.",
          "Descriptions with keywords and hashtags for Instagram, TikTok, YouTube Shorts and Facebook (in descripciones.md).",
          "Repurposing: carousel, thread, text post, 15-second script and ideas for your next videos.",
        ],
        cmds: ["Another cover", "Make it shorter", "Change the CTA", "Turn it into a carousel", "Get more content out of it"],
      },
      {
        n: "2.3", title: "The 3 video styles",
        points: [
          "ATOM: illustrated, with light and color. For science, the human body, nature and fun facts.",
          "Night Cinema (Cine Nocturno): a nighttime documentary with dark, warm 3D scenes. For stories, mysteries, psychology and true cases.",
          "Neon Data (Datos Neón): an animated infographic with neon numbers timed to the voice. For money, comparisons and speeds.",
          "There's an example of each one in the ejemplo-estilos (“style examples”) folder.",
        ],
        cmds: ["Hazme un video sobre … en estilo Cine Nocturno (means “Make me a video about … in Night Cinema style”)"],
      },
      {
        n: "2.4", title: "Make money: sell videos to businesses",
        points: [
          "It builds your offer in 3 packages, 10 businesses in your area, a free sample for the top 3, the messages, the 1-page proposal and the videos with the client's brand.",
          "Everything is saved in the negocios (“businesses”) folder.",
        ],
        cmds: ["I want to sell videos to businesses", "How much should I charge?", "Make me a proposal for …"],
      },
    ],
  },
  {
    n: 3, icon: "shield", title: "Help and updates",
    lessons: [
      {
        n: "3.1", title: "Support and updates",
        points: [
          "If something fails, first type “doctor”: it checks your computer and fixes whatever is missing.",
          "Updates show up on this same page, at no cost.",
        ],
        cmds: ["doctor"],
      },
    ],
  },
  {
    n: 4, icon: "gift", title: "Bonus: The Vault",
    lessons: [
      { n: "4.1", title: "What really happened", points: ["What was done to grow the account and your plan for week 1."], files: [{ name: "ATOM Elite - Boveda 1 - plan-semana-1.pdf", title: "Your week 1 plan", tag: "Bonus" }] },
      { n: "4.2", title: "What to sell with your videos", points: ["The 3 paths, how to choose one and your 3-day plan."], files: [{ name: "ATOM Elite - Boveda 2 - elige-tu-camino.pdf", title: "Choose your path", tag: "Bonus" }] },
      { n: "4.3", title: "Your first clients", points: ["Offer in 3 packages, list, sample, messages, objections, closing and a 30-day plan."], files: [{ name: "ATOM Elite - Boveda 3 - primeros-clientes.pdf", title: "Your first clients", tag: "Bonus" }] },
      { n: "4.4", title: "Partners", points: ["How the partner program works and its 14-day plan."], files: [{ name: "ATOM Elite - Boveda 4 - socios-atom.pdf", title: "Partners", tag: "Bonus" }] },
      { n: "4.5", title: "What's next", points: ["Your plan for the next 30 days."], files: [{ name: "ATOM Elite - Boveda 5 - proximos-30-dias.pdf", title: "Your next 30 days", tag: "Bonus" }] },
    ],
  },
  {
    n: 5, icon: "package", title: "Updates",
    lessons: [
      {
        n: "5.1", title: "System 2.0",
        points: [
          "What's new: scripts told as a story and reviewed before recording, challenges for the viewer, more on-screen elements and sound effects, more expressive 3D people and more checks before delivery.",
          "If you're starting today, you already have it: it's System 2.0 from lesson 1.2.",
          "If you were already using version 1: unzip 2.0 into a new folder (don't overwrite the old one), add the 2 example ZIPs, open it in your AI and type “actualízame desde mi carpeta anterior” (means “update me from my previous folder”). It brings over your preferences, brand, key, topics and projects.",
        ],
        cmds: ["actualízame desde mi carpeta anterior (means “update me from my previous folder”)"],
        files: [{ name: "ATOM ELITE.zip", title: "System 1 (previous version)", tag: "Optional", note: "Only if you need it: to get started, use System 2.0." }],
      },
    ],
  },
];

// Flat list for navigation: each lesson with its route (/mis-accesos/1-2), its module and its position.
export type FlatLesson = Lesson & { slug: string; module: Module; index: number };
export const LESSONS: FlatLesson[] = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m }))).map((l, index) => ({
  ...l, slug: l.n.replace(".", "-"), index,
}));
export const findLesson = (slug: string) => LESSONS.find((l) => l.slug === slug) ?? null;
export const COURSE_FILES = new Set(LESSONS.flatMap((l) => (l.files ?? []).map((f) => f.name)));
