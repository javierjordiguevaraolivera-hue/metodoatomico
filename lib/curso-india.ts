import type { IconName } from "@/lib/icons";

// Atomic Method (India) — lib/curso.ts का हिंदी वर्शन। Modules, lessons (n), icons और files[].name बिल्कुल वही हैं।
// Files वैसे ही दी जाती हैं: system examples को उनके नाम से ढूँढता है, इसलिए यहाँ सिर्फ़ नाम और समझाया गया है।
// कुछ commands (जैसे «configúrame», «doctor», «Hazme un video sobre …») system के keywords हैं: वो Spanish में ही रखे गए हैं।
export type FileSpec = { name: string; title: string; tag?: "यहाँ से शुरू करें" | "ज़रूरी" | "Bonus" | "Optional"; note?: string };
export type Lesson = { n: string; title: string; points: string[]; cmds?: string[]; files?: FileSpec[] };
export type Module = { n: number; icon: IconName; title: string; lessons: Lesson[] };

const EJEMPLO_NOTE = "इसे system वाले folder में वैसे ही डाल दें: unzip न करें और नाम भी न बदलें।";

export const MODULES: Module[] = [
  {
    n: 1, icon: "zap", title: "यहाँ से शुरू करें",
    lessons: [
      {
        n: "1.1", title: "Welcome",
        points: [
          "आप एक line में topic देते हैं और आपका AI आपको तैयार vertical video देता है: script, voice, animation, subtitles, cover और post करने का text।",
          "15 मिनट में: download करें, folder को अपने AI में खोलें, «configúrame» लिखें (मतलब: «मुझे setup करो») और अपना पहला video या पूरे महीने का calendar माँगें।",
          "इसमें 4 packs, video के 3 styles, covers, descriptions, repurposing और businesses को videos बेचने का kit शामिल है।",
        ],
      },
      {
        n: "1.2", title: "अपनी 3 files download करें",
        points: [
          "तीनों ज़रूरी हैं: system हर video में quality के reference के लिए 2 examples इस्तेमाल करता है।",
          "System 2.0 को एक नए folder में unzip करें और examples वाली 2 ZIP files उसके अंदर वैसे ही डाल दें।",
          "ये personal use के लिए हैं: इन्हें share न करें और दोबारा न बेचें।",
        ],
        files: [
          { name: "ATOM ELITE v2.zip", title: "System 2.0", tag: "यहाँ से शुरू करें", note: "इसे एक नए folder में unzip करें: यही folder आप अपने AI में खोलेंगे।" },
          { name: "ATOM ELITE - Ejemplo estrella verde.zip", title: "Example: हरा तारा", tag: "ज़रूरी", note: EJEMPLO_NOTE },
          { name: "ATOM ELITE - Ejemplo alcohol.zip", title: "Example: alcohol", tag: "ज़रूरी", note: EJEMPLO_NOTE },
        ],
      },
      {
        n: "1.3", title: "इसे अपने AI में install करें",
        points: [
          "ये सिर्फ़ desktop app (Mac या Windows) में चलता है, web पर नहीं।",
          "Claude: Code tab › Select folder › folder चुनें। ChatGPT: Codex › Projects के पास + › Local रहने दें › folder चुनें। अगर पूछे कि आप इस पर भरोसा करते हैं, तो हाँ कहें।",
          "«configúrame» लिखें (ये setup का keyword है, इसे ऐसे ही लिखें)। ये जो कमी है वो install करता है, examples को सही जगह रखता है और आपसे भाषा, niche, video कैसे खत्म करना है और sound effects चाहिए या नहीं, ये पूछता है। जब programs install करने को कहे तो accept करें; पहली बार कुछ मिनट लगते हैं।",
          "ElevenLabs key (voice के लिए): PEGA-AQUI-TU-CLAVE-ELEVENLABS.txt खोलें, CLAVE= के बाद अपनी key paste करें और save करें। इसे कभी chat में paste न करें।",
          "Key कैसे निकालें: elevenlabs.io › Developers › API Keys › Create Key › «Restrict Key» बंद करें › sk_ से शुरू होने वाली key copy करें (छोटा ID काम नहीं करेगा)।",
          "खत्म होने पर ये आपको menu दिखाता है («menú» लिखकर कभी भी menu खोल सकते हैं)। पहला cover बनाते समय ये आपके brand का color पूछेगा। यही steps, और detail में, folder के अंदर EMPIEZA-AQUI.html में हैं।",
        ],
        cmds: ["configúrame", "menú"],
      },
      {
        n: "1.4", title: "आपका पहला video",
        points: [
          "अपने शब्दों में माँगें, या keyword «Hazme un video sobre …» (मतलब: «… पर मेरा video बनाओ») लिखकर आगे topic डालें। Topic नहीं है तो 5 topics या महीने का calendar माँग लें।",
          "ये आपसे style पूछता है या खुद एक suggest करता है; research करता है, script लिखता है, drawing बनाता है और खुद ही check करता है।",
          "ये आपको 2 शुरुआत और script दिखाता है: एक चुनें, बदलाव माँगें या «adelante» लिखें (मतलब: «आगे बढ़ो»)।",
          "1 घंटे तक लग सकता है: computer चालू रखें और app खुली रखें।",
          "salida folder में video, cover flyer.jpg और हर platform के लिए descriptions मिलेंगे।",
          "Bachat के लिए: जब conversation लंबी हो जाए, उसी folder में नई conversation खोलें। Goal: 30 दिन तक रोज़ 1 video।",
        ],
        cmds: ["Hazme un video sobre …", "adelante", "मुझे 5 topics दो"],
      },
    ],
  },
  {
    n: 2, icon: "sparkles", title: "आपके packs",
    lessons: [
      {
        n: "2.1", title: "Ideas की कमी नहीं: calendar, niches, 100 topics और series",
        points: [
          "Calendar: आपके niche के 30 दिन के topics, रोज़ एक, check किए हुए facts के साथ।",
          "Niches: 11 तैयार (science, human body, history, पैसा, psychology, technology, जानवर, खाना, रोचक बातें, business, sports) या आपका अपना।",
          "Reel format में 100 tested topics; जो आप इस्तेमाल कर चुके हैं वो याद रखता है।",
          "Series: एक बड़ा topic 3 से 5 parts में, हर part में अगले part का hook।",
        ],
        cmds: ["इस महीने का calendar बना दो", "दिन 5 का video बना दो", "मेरा niche चुनो", "topic 37 बना दो", "… पर एक series बना दो", "series आगे बढ़ाओ"],
      },
      {
        n: "2.2", title: "Videos को viral बनाएँ: covers, descriptions और repurposing",
        points: [
          "TikTok, Reels और Shorts के लिए automatic cover (flyer.jpg): ये 3 बनाता है और सबसे अच्छा आपको देता है।",
          "Instagram, TikTok, YouTube Shorts और Facebook के लिए keywords और hashtags वाली descriptions (descripciones.md में)।",
          "Repurposing: carousel, thread, text post, 15 second की script और अगले videos के ideas।",
        ],
        cmds: ["दूसरा cover बनाओ", "इसे छोटा करो", "CTA बदलो", "इसे carousel बना दो", "इससे और content निकालो"],
      },
      {
        n: "2.3", title: "Video के 3 styles",
        points: [
          "ATOM: drawing वाला, light और color के साथ। Science, human body, nature और रोचक बातों के लिए।",
          "Cine Nocturno (रात का cinema): रात का documentary, dark और warm 3D scenes के साथ। Stories, रहस्य, psychology और सच्ची घटनाओं के लिए।",
          "Datos Neón (neon data): animated infographic, voice की rhythm पर neon numbers के साथ। पैसा, comparisons और speed वाले topics के लिए।",
          "हर style का एक example ejemplo-estilos folder में है।",
        ],
        cmds: ["Hazme un video sobre … en estilo Cine Nocturno"],
      },
      {
        n: "2.4", title: "पैसे कमाएँ: businesses को videos बेचें",
        points: [
          "ये आपके लिए 3 packages वाला offer, आपके इलाके के 10 businesses, top 3 के लिए free sample, messages, 1 page का proposal और client के brand वाले videos तैयार करता है।",
          "सब कुछ negocios folder में save रहता है।",
        ],
        cmds: ["मुझे businesses को videos बेचने हैं", "मुझे कितना charge करना चाहिए?", "… के लिए proposal बना दो"],
      },
    ],
  },
  {
    n: 3, icon: "shield", title: "Help और updates",
    lessons: [
      {
        n: "3.1", title: "Support और updates",
        points: [
          "अगर कुछ गड़बड़ हो, तो पहले «doctor» लिखें (ये keyword है): ये आपका computer check करता है और जो कमी है उसे ठीक करता है।",
          "Updates इसी page पर आते हैं, बिना किसी extra cost के।",
        ],
        cmds: ["doctor"],
      },
    ],
  },
  {
    n: 4, icon: "gift", title: "Bonus: the Vault",
    lessons: [
      { n: "4.1", title: "असल में क्या हुआ", points: ["Account बढ़ाने के लिए क्या किया गया और आपका पहले हफ़्ते का plan।"], files: [{ name: "ATOM Elite - Boveda 1 - plan-semana-1.pdf", title: "आपका पहले हफ़्ते का plan", tag: "Bonus" }] },
      { n: "4.2", title: "अपने videos से क्या बेचें", points: ["3 रास्ते, एक कैसे चुनें और आपका 3 दिन का plan।"], files: [{ name: "ATOM Elite - Boveda 2 - elige-tu-camino.pdf", title: "अपना रास्ता चुनें", tag: "Bonus" }] },
      { n: "4.3", title: "आपके पहले clients", points: ["3 packages वाला offer, list, sample, messages, objections, closing और 30 दिन का plan।"], files: [{ name: "ATOM Elite - Boveda 3 - primeros-clientes.pdf", title: "आपके पहले clients", tag: "Bonus" }] },
      { n: "4.4", title: "Partners", points: ["Partners program कैसे काम करता है और उसका 14 दिन का plan।"], files: [{ name: "ATOM Elite - Boveda 4 - socios-atom.pdf", title: "Partners", tag: "Bonus" }] },
      { n: "4.5", title: "आगे क्या है", points: ["अगले 30 दिन का आपका plan।"], files: [{ name: "ATOM Elite - Boveda 5 - proximos-30-dias.pdf", title: "आपके अगले 30 दिन", tag: "Bonus" }] },
    ],
  },
  {
    n: 5, icon: "package", title: "Updates",
    lessons: [
      {
        n: "5.1", title: "System 2.0",
        points: [
          "नया क्या है: scripts जो कहानी की तरह बताई जाती हैं और record से पहले check होती हैं, देखने वाले के लिए challenges, screen पर ज़्यादा elements और sound effects, 3D में ज़्यादा expressive लोग और deliver करने से पहले ज़्यादा checks।",
          "अगर आप आज शुरू कर रहे हैं, तो ये आपके पास पहले से है: ये lesson 1.2 वाला System 2.0 है।",
          "अगर आप version 1 इस्तेमाल कर रहे थे: 2.0 को एक नए folder में unzip करें (पुराने के ऊपर overwrite न करें), examples वाली 2 ZIP डालें, इसे अपने AI में खोलें और «actualízame desde mi carpeta anterior» लिखें (मतलब: «मेरे पुराने folder से update करो»)। ये आपकी preferences, brand, key, topics और projects ले आता है।",
        ],
        cmds: ["actualízame desde mi carpeta anterior"],
        files: [{ name: "ATOM ELITE.zip", title: "System 1 (पुराना version)", tag: "Optional", note: "सिर्फ़ ज़रूरत हो तो: शुरू करने के लिए System 2.0 इस्तेमाल करें।" }],
      },
    ],
  },
];

// Navigation के लिए flat list: हर lesson अपने route (/mis-accesos/1-2), module और position के साथ।
export type FlatLesson = Lesson & { slug: string; module: Module; index: number };
export const LESSONS: FlatLesson[] = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m }))).map((l, index) => ({
  ...l, slug: l.n.replace(".", "-"), index,
}));
export const findLesson = (slug: string) => LESSONS.find((l) => l.slug === slug) ?? null;
export const COURSE_FILES = new Set(LESSONS.flatMap((l) => (l.files ?? []).map((f) => f.name)));
