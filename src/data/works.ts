/**
 * Works data — one entry per video project.
 *
 * ── PLACEHOLDER CONTENT ──────────────────────────────────────────────────────
 * Every entry below is real work, so no card shows the "Sample entry" badge.
 * The mechanism stays for new drafts: mark an entry with `placeholder: true`
 * and it renders the badge until you replace the copy and delete the flag.
 *
 * ── ADDING MEDIA ────────────────────────────────────────────────────────────
 * Video:  either `video` (a public MP4 URL) or `bilibili` (a Bilibili link or
 *         bare BV/av id). Both play in place; a work with neither shows the
 *         "video not uploaded yet" state.
 *         Bilibili is the lighter option: nothing is hosted here, there is no
 *         file size to manage, and the audience is already there. Paste the
 *         share link as-is — the id is extracted for you.
 *         An MP4 attached to the chat is hosted on the platform CDN, so use
 *         that URL directly rather than committing the file. If you do keep a
 *         clip in `public/videos/`, it ships with every deploy, so reserve that
 *         for small files. Target ~50MB / 1080p H.264 + AAC, exported with
 *         `-movflags +faststart` so playback can start before the download ends.
 *         A source that 404s or carries an unusable id falls back to the poster
 *         with a "failed to load" label, never a black player.
 * Cover:  export WebP files at widths 640/960/1440/1920 named
 *         `<name>-<width>.webp` into `public/img/`, then set
 *         `cover: "/img/my-cover"`.
 * A work with no `cover` renders a typographic title card.
 */

/** A content field carried in both site languages. */
export interface Localized {
  en: string;
  zh: string;
}

export type WorkCategory =
  | "packaging"
  | "gamepv"
  | "aigc"
  | "short3d"
  | "compositing"
  | "bilibili";

/** Filter order on the Work page. Labels live in the locale files. */
export const WORK_CATEGORIES: WorkCategory[] = [
  "packaging",
  "gamepv",
  "aigc",
  "short3d",
  "compositing",
  "bilibili",
];

export interface Work {
  /** Display index, e.g. "01". */
  id: string;
  slug: string;
  title: Localized;
  /** Optional chapter or series line, rendered under the title. */
  subtitle?: Localized;
  /** One-line summary shown on cards. */
  blurb: Localized;
  /** Longer description shown on the work page. */
  description: Localized;
  categories: WorkCategory[];
  year: string;
  /** Running time as "mm:ss". */
  duration: string;
  /** What you did on the project. */
  role: Localized;
  /** Per-work accent colour used for the title card and hover wash. */
  accent: string;
  /** Cover image base path without extension, e.g. "/img/reel-01". */
  cover?: string;
  coverAlt?: Localized;
  /** MP4 source, e.g. "/videos/reel-01.mp4". */
  video?: string;
  /** Bilibili video id ("BV…" / "av…") or a full video URL; embedded in place. */
  bilibili?: string;
  /** Marks sample copy so it is never mistaken for real work. */
  placeholder?: boolean;
}

export const works: Work[] = [
  {
    id: "01",
    slug: "video-packaging",
    title: { en: "Heartflutter", zh: "怦然心动" },
    blurb: {
      en: "Two figures share a bench at the end of the day, watching the light go down.",
      zh: "两个人并肩坐在长椅上，看着一天的日光落下。",
    },
    description: {
      en: "An AIGC animated short. Less a plot than a held scene: two people on a bench by the water at sunset, seen from behind, with the light carrying most of the emotion.",
      zh: "AIGC 动画短片。比起情节，更接近一个静止的场景：夕阳下的水边长椅，两人背对镜头并坐，由光承担大部分情绪。",
    },
    categories: ["aigc"],
    year: "2026",
    duration: "—",
    role: { en: "Direction, AI generation, post", zh: "编导、AI 生成、后期" },
    accent: "#F4B942",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/d5279eb2.png",
    coverAlt: {
      en: "Two figures seen from behind on a bench by the water at sunset",
      zh: "夕阳下水边长椅上背对镜头的两个人",
    },
    bilibili: "BV1ux8765EzF",
  },
  {
    id: "02",
    slug: "game-pv",
    title: { en: "City of Eternal Night", zh: "时空中的绘旅人：六周年PV【永夜之城】" },
    subtitle: { en: "6th Anniversary PV", zh: "六周年纪念PV" },
    blurb: {
      en: "A gothic portrait hall for five characters — framed panels, a stage-lit title reveal and a four-minute build.",
      zh: "五位角色的哥特肖像厅：画框式人物版式、舞台式片名揭示，四分钟完整铺垫。",
    },
    description: {
      en: "The 6th-anniversary PV for Lovebrush Chronicles. Five character portraits hang inside an ornate hall — velvet curtain, gilded frames, and a single title that lands once the build is done. The work is the visual packaging: panel layout, frame animation, the title reveal and the final grade.",
      zh: "《时空中的绘旅人》六周年纪念PV。五位角色肖像陈列在一座华丽厅堂之中——天鹅绒幕布、鎏金画框，片名在铺垫之后一次落下。负责的是视觉包装：版式搭建、画框动效、片名揭示与最终调色。",
    },
    categories: ["gamepv"],
    year: "2026",
    duration: "04:00",
    role: { en: "Edit, effects, motion", zh: "剪辑、特效、动效" },
    accent: "#7FC7FF",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/a232af9e.jpg",
    coverAlt: {
      en: "Five character portraits in an ornate gothic hall, beneath the title City of Eternal Night",
      zh: "华丽哥特厅堂中的五位角色肖像，画面下方是片名「永夜之城」",
    },
    bilibili: "BV1aue46DEyv",
  },
  {
    id: "03",
    slug: "cheng-yu-chronicle",
    title: { en: "Cheng Yu Character Chronicle", zh: "率土之滨程昱人物志动画" },
    blurb: {
      en: "A Three Kingdoms strategist introduced through animated narrative rather than a stat sheet.",
      zh: "三国谋士人物志：用动画叙事介绍程昱其人。",
    },
    description: {
      en: "A character chronicle animation for the Three Kingdoms strategy game Rate of the Land — three minutes on Cheng Yu, told through animation rather than a stat sheet.",
      zh: "三国题材策略手游《率土之滨》的人物志动画，用三分钟动画叙事介绍谋士程昱。",
    },
    categories: ["packaging"],
    year: "2026",
    duration: "03:00",
    role: { en: "Edit, effects, motion", zh: "剪辑、特效、动效" },
    accent: "#D96B5A",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/4ba80cbf.png",
    coverAlt: {
      en: "Cheng Yu holding a drawn sword under a storm sky, a larger figure looming behind him",
      zh: "程昱持剑立于风雨之中，身后浮现更大的身影",
    },
    bilibili: "BV136tm6bEVJ",
  },
  {
    id: "04",
    slug: "aigc-experiment",
    title: { en: "Tales of Liangzhu", zh: "泽国云梦：良渚奇谭" },
    subtitle: { en: "Chapter 4: Happy Anniversary", zh: "第四章：纪念日快乐" },
    blurb: {
      en: "A lone astronaut answers a distress call to bring medicine to a small alien species — on the day he was meant to be celebrating.",
      zh: "一名独居太空的宇航员收到求救信号，为异星小生物送去药品——而那天正是他的纪念日。",
    },
    description: {
      en: "A retro sci-fi animated short. The signal comes from an unfamiliar planet and the recipients are a small species that has never met a human. Four minutes, moving from weary solitude to the chapter title the film ends on: “Happy Anniversary”.",
      zh: "复古科幻动画短片。信号来自一颗陌生行星，收件人是一群从未见过人类的小生物。全片四分钟，从疲惫的独处出发，落在影片最后那行章节标题上——「纪念日快乐」。",
    },
    categories: ["aigc"],
    year: "2026",
    duration: "04:04",
    role: { en: "Direction, AI generation, post", zh: "编导、AI 生成、后期" },
    accent: "#C7A7FF",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/3c9ed3fd.jpg",
    coverAlt: {
      en: "Key art — a concrete hall with a lit doorway standing open onto a flooded floor",
      zh: "主视觉：混凝土大厅里，一扇透光的门洞开在漫水的空间尽头",
    },
    video: "https://cdn.enter.pro/resources/uid_100585009/dc9e67c3-7577-45.mp4",
  },
  {
    id: "05",
    slug: "3d-short",
    title: { en: "Pale Nav", zh: "白霭区 Pale Nav" },
    blurb: {
      en: "A 3D short built from concept and look development through to the final render.",
      zh: "从概念与视觉开发一路做到最终渲染的 3D 短片。",
    },
    description: {
      en: "A 3D digital short. The whole piece is built and lit in 3D — from concept and look development through to the final render.",
      zh: "3D 数字短片《白霭区》。全片在 3D 中搭建与打光，从概念、视觉开发到最终渲染输出。",
    },
    categories: ["short3d"],
    year: "2025",
    duration: "05:06",
    role: { en: "Modelling, lighting, animation", zh: "建模、灯光、动画" },
    accent: "#B6F06C",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/fb1e1647.jpg",
    coverAlt: {
      en: "Pale Nav cover — two figures suspended over a teal water surface, beside large red title type",
      zh: "《白霭区》封面：悬浮在青绿水面之上的两个人影，左侧是红色片名",
    },
    video: "https://cdn.enter.pro/resources/uid_100585009/f515c7a1-931e-41.mp4",
  },
  {
    id: "06",
    slug: "qixi-series-pv",
    title: { en: "Qixi Series PV Compositing", zh: "率土之滨七夕系列PV合成" },
    blurb: {
      en: "A Qixi event series cut together from illustration and compositing.",
      zh: "七夕主题活动系列PV：以插画素材与合成完成整支包装。",
    },
    description: {
      en: "A Qixi-themed series PV for the Three Kingdoms strategy game Rate of the Land — illustration assets brought into motion and composited into a single cut.",
      zh: "三国题材策略手游《率土之滨》的七夕主题系列PV，将插画素材动起来并合成为一支完整片子。",
    },
    categories: ["compositing"],
    year: "2026",
    duration: "—",
    role: { en: "Compositing, edit, motion", zh: "合成、剪辑、动效" },
    accent: "#6FD3B4",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/e94a3ae5.jpg",
    coverAlt: {
      en: "Five women in flowing summer dress gathered by a jungle waterfall pool",
      zh: "五位身着夏日轻纱的女子聚集在林间瀑布水潭边",
    },
    bilibili: "BV1Fp8z6dEB7",
  },
  {
    id: "07",
    slug: "vertical-cutdown",
    title: { en: "Announcing: The New Spider-Man!", zh: "宣布：新的蜘蛛侠是！" },
    blurb: {
      en: "A short-form announcement cut made for Bilibili.",
      zh: "为 B站 做的短视频式官宣剪辑。",
    },
    description: {
      en: "A Bilibili original short — an announcement-style cut built for the platform's short-form feed.",
      zh: "B站原创短片。为平台短视频信息流做的官宣式快剪。",
    },
    categories: ["bilibili"],
    year: "2024",
    duration: "—",
    role: { en: "Edit, motion, delivery", zh: "剪辑、动效、交付" },
    accent: "#FF9B62",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/da323ccf.png",
    coverAlt: {
      en: "A figure lifting a masked face to reveal their eyes, lit by neon in a dark room",
      zh: "昏暗房间里，一个人掀起面罩露出眼睛，霓虹光打在脸上",
    },
    bilibili: "BV1xr3S6mEKQ",
  },
  {
    id: "08",
    slug: "failed-man-test",
    title: { en: "5-Minute Failed-Man Test", zh: "5分钟检验你的失败的man程度" },
    blurb: {
      en: "A quiz-style short that scores how much of a failed man you are.",
      zh: "问答式短片：测一测你「失败的 man」到什么程度。",
    },
    description: {
      en: "A Bilibili original short built around the pun in its title — a quiz-style cut that keeps the pace on the questions.",
      zh: "B站原创短片。片名本身就是个梗，问答式的快剪，节奏跟着题目走。",
    },
    categories: ["bilibili"],
    year: "2024",
    duration: "—",
    role: { en: "Edit, motion, delivery", zh: "剪辑、动效、交付" },
    accent: "#E07AC0",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/37481e46.png",
    coverAlt: {
      en: "A brick-built Spider-Man minifigure standing on a toy bridge at golden hour",
      zh: "黄昏时分的积木天桥上，站着一个蜘蛛侠积木小人",
    },
    bilibili: "BV1YcDuB3E1P",
  },
  {
    id: "09",
    slug: "phantom-music-rhapsody",
    title: { en: "Phantom Music Rhapsody", zh: "幻乐狂想曲" },
    blurb: {
      en: "A 3D piece built around a stage walk — one figure heading down the runway toward the light.",
      zh: "3D 短片：一个人沿着舞台通道走向灯光深处。",
    },
    description: {
      en: "A 3D digital short. A single figure walks the runway toward the stage while the crowd falls away into the dark — the walk and the light carry the piece.",
      zh: "3D 数字短片。一个人沿通道走向舞台，观众在黑暗里退成剪影，这段行走与灯光承担了全部表达。",
    },
    categories: ["short3d"],
    year: "2026",
    duration: "02:56",
    role: { en: "Modelling, lighting, animation", zh: "建模、灯光、动画" },
    accent: "#6C8BFF",
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/f280b457.jpg",
    coverAlt: {
      en: "Phantom Music Rhapsody key art — a figure walking a lit runway toward a stage, the title below",
      zh: "《幻乐狂想曲》主视觉：一个人走在被照亮的通道上走向舞台，片名在下方",
    },
    video: "https://cdn.enter.pro/resources/uid_100585009/12c2575f-01e9-4c.mp4",
  },
  {
    id: "10",
    slug: "phantom-bts",
    title: { en: "Phantom Music Rhapsody — Behind the Scenes", zh: "幻乐狂想曲幕后制作" },
    blurb: {
      en: "A behind-the-scenes cut that follows how Phantom Music Rhapsody was put together.",
      zh: "幕后花絮剪辑：记录《幻乐狂想曲》是怎么做出来的。",
    },
    description: {
      en: "A behind-the-scenes piece for Phantom Music Rhapsody — the making-of cut, assembled from the production material rather than the finished shots.",
      zh: "《幻乐狂想曲》的幕后花絮，由制作过程的素材剪成，而不是成片镜头。",
    },
    categories: ["compositing"],
    year: "2026",
    duration: "01:09",
    role: { en: "Edit, compositing, delivery", zh: "剪辑、合成、交付" },
    accent: "#4FD1E0",
    cover: "/img/phantom-bts",
    coverAlt: {
      en: "Phantom Music Rhapsody title card in white brush lettering on black",
      zh: "黑底白字的「幻乐狂想曲」手写片名卡",
    },
    video: "https://cdn.enter.pro/resources/uid_100585009/7907a9fe-3aa1-41.mp4",
  },
];

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

/** Next work in the list, wrapping at the end. */
export function getNextWork(slug: string): Work {
  const index = works.findIndex((w) => w.slug === slug);
  return works[(index + 1) % works.length];
}

export function isPlaceholder(work: Work): boolean {
  return work.placeholder === true;
}

/** True when a work has something the in-page player can actually play. */
export function hasPlayerSource(work: Work): boolean {
  return !!work.video || !!work.bilibili;
}

/**
 * A single usable image URL for a cover, for places that cannot use the
 * responsive `<SmartImage>` element — a CSS background, for example. Covers
 * declared as a base path resolve to their largest WebP variant; a full URL is
 * returned untouched.
 */
export function coverUrl(work: Work): string | null {
  if (!work.cover) return null;
  return /^https?:\/\//.test(work.cover) ? work.cover : `${work.cover}-1920.webp`;
}

/**
 * Turns a pasted Bilibili link or bare video id into the in-page player URL.
 * Accepts a full share URL (the id is extracted from it) or a bare
 * "BV…" / "av…" id. Returns null when no id can be found, so a malformed
 * paste falls back to the poster instead of a blank frame.
 */
export function bilibiliEmbedUrl(value: string): string | null {
  const bv = value.match(/BV[0-9A-Za-z]{10}/);
  const av = value.match(/\bav(\d+)/i);
  const params = "page=1&autoplay=1&danmaku=0&high_quality=1";
  if (bv) return `https://player.bilibili.com/player.html?bvid=${bv[0]}&${params}`;
  if (av) return `https://player.bilibili.com/player.html?aid=${av[1]}&${params}`;
  return null;
}

/**
 * Rough visual width of a title, counting CJK glyphs as full width and Latin
 * characters as roughly half. Used to step a headline down a size instead of
 * letting a long CJK title overflow the viewport.
 */
export function titleWeight(value: string): number {
  return [...value].reduce(
    (total, character) => total + (/[\u2E80-\uFFFF]/.test(character) ? 1 : 0.55),
    0
  );
}
