import type { Localized } from "./works";

/**
 * ---- Brand-level copy (single source of truth) ----
 * Every shared brand string lives here: the wordmark, the role descriptor,
 * the contact facts, and the metadata description. The nav, footer, preloader
 * and page titles all read from this object.
 *
 * Facts marked `TODO` were not supplied yet and are intentionally empty —
 * components render those rows only when a value exists, so nothing false ships.
 */
export const BRAND = {
  /** Wordmark exactly as rendered in nav, footer, preloader and titles. */
  name: "TIAN",
  /** Prose / screen-reader form of the name (used in aria-labels). */
  spokenName: "TIAN",
  /** Short role descriptor that follows the em dash in page titles. */
  descriptor: "Video Post-Production Designer",
  /** Human-readable availability line. */
  availability: { en: "Available for select projects", zh: "可接新项目" },
  /** Bilibili account. Sharing params are dropped from the profile link. */
  bilibili: { handle: "小天犬TIAN", url: "https://space.bilibili.com/396495208" },
  /** TODO: add the public contact email. */
  email: "",
  /** TODO: add the city. */
  city: "",
  /** TODO: add the timezone. */
  timezone: "",
  /** TODO: add the typical reply time. */
  responseTime: "",
  /** Copyright year, taken from the build date. */
  year: String(new Date().getFullYear()),
};

/** Document title for a page: "<page> — <brand>", or the home title when omitted. */
export function brandTitle(page?: string): string {
  return page ? `${page} — ${BRAND.name}` : `${BRAND.name} — ${BRAND.descriptor}`;
}

/**
 * ---- Disciplines (bilingual) ----
 * Rendered by the home page's services grid and the Studio page's service track.
 */
export const DISCIPLINES: { title: Localized; items: Localized[]; cover: string }[] = [
  {
    title: { en: "Video Packaging", zh: "视频包装" },
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/bdf8fdcc.jpg",
    items: [
      { en: "Channel and program identity", zh: "频道与栏目整体视觉" },
      { en: "Openers, end cards and transitions", zh: "片头片尾与转场" },
      { en: "End-to-end editing", zh: "全流程剪辑" },
      { en: "Compositing and grading", zh: "后期合成，调色" },
    ],
  },
  {
    title: { en: "Game PV", zh: "游戏PV" },
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/da122c09.jpg",
    items: [
      { en: "Gameplay pacing and edit", zh: "玩法节奏剪辑" },
      { en: "Character and environment packaging", zh: "角色与场景包装" },
      { en: "Effects compositing and motion", zh: "特效合成与动效" },
      { en: "Vertical and multi-ratio cutdowns", zh: "竖版与多尺寸切条" },
    ],
  },
  {
    title: { en: "AIGC", zh: "AIGC" },
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/f72f7a45.png",
    items: [
      { en: "AI image and video generation", zh: "AI 影像生成" },
      { en: "Style exploration and previs", zh: "风格探索与概念预演" },
      { en: "Art-directed AI workflows", zh: "建立适配美术XAI工作流" },
      { en: "Workflow and prompt engineering", zh: "流程与提示词工程" },
    ],
  },
  {
    title: { en: "3D Digital Shorts", zh: "3D数字短片" },
    cover:
      "https://cdn.enter.pro/visual_resources/100585009/54573dd40a094b169ed32fa4e414e1f3/0883a85e.png",
    items: [
      { en: "Concept and storyboards", zh: "概念与分镜" },
      { en: "Animation and camera work", zh: "动画与镜头调度" },
      { en: "Rendering and compositing", zh: "渲染与合成" },
    ],
  },
];

/**
 * ---- About page copy ----
 * Rendered by `src/pages/Studio.tsx`. Every prose field is bilingual, so the
 * page reads as TIAN's own voice in either language rather than falling back to
 * English. Written for a solo editor: no client wall, no "why choose us".
 */
export const STUDIO_COPY = {
  /** Manifesto hero, one entry per visual line. */
  manifesto: [
    { en: "cut with intent,", zh: "剪得有意图，" },
    { en: "move with rhythm,", zh: "动得有节奏，" },
    { en: "built to land.", zh: "落得准。" },
  ],
  /** Right-hand status column. */
  statusRows: [
    { k: { en: "Status", zh: "状态" }, v: BRAND.availability },
    { k: { en: "Disciplines", zh: "方向" }, v: { en: "4 core practices", zh: "四个主要方向" } },
    { k: { en: "Year", zh: "年份" }, v: { en: BRAND.year, zh: BRAND.year } },
  ],
  about: {
    label: { en: "About", zh: "关于我" },
    lead: {
      en: `${BRAND.name} is a video post-production designer working across video packaging, game PVs, AIGC and 3D digital shorts.`,
      zh: `${BRAND.name} 是视频后期包装师，方向覆盖视频包装、游戏PV、AIGC 与 3D数字短片。`,
    },
    support: {
      en: "The work starts from the edit: what the cut needs, where the eye should land, and how motion can carry meaning instead of decorating it.",
      zh: "工作从剪辑出发：这一段需要什么、视线该落在哪、动效如何承担表达而不是装饰。",
    },
    /** Empty until a real portrait is supplied — the page hides the photo then. */
    portrait: "",
    portraitAlt: { en: `Portrait of ${BRAND.name}.`, zh: `${BRAND.name} 的肖像照。` },
  },
  whatWeDo: { label: { en: "What I Do", zh: "我能做什么" } },
  process: {
    label: { en: "How I Work", zh: "工作方式" },
    steps: [
      {
        title: { en: "Read the footage", zh: "先读素材" },
        body: {
          en: "Start with the footage and what it is already trying to say. The cut follows that, not the other way round.",
          zh: "先看素材本身想讲什么，剪辑跟着这个走，而不是反过来。",
        },
      },
      {
        title: { en: "Find the rhythm", zh: "定节奏" },
        body: {
          en: "Get the rhythm standing on its own before any packaging goes on top. If the cut works without effects, the effects will work.",
          zh: "先把节奏立住，再往上叠包装。没有特效也成立的剪辑，加上特效才成立。",
        },
      },
      {
        title: { en: "Build the system", zh: "搭系统" },
        body: {
          en: "Openers, transitions and lower thirds become a reusable system, not one-off effects that break on the next episode.",
          zh: "片头、转场、字幕条做成可复用的系统，而不是下一集就崩的一次性效果。",
        },
      },
      {
        title: { en: "Hand off clean", zh: "交干净" },
        body: {
          en: "Projects and templates are delivered together, so whoever picks it up next can keep building without asking how it was made.",
          zh: "工程与模板一起交付，接手的人能直接往下做，不用回头问怎么做的。",
        },
      },
    ],
  },
  metaDescription: {
    en: `${BRAND.name} is a video post-production designer working across video packaging, game PVs, AIGC and 3D digital shorts.`,
    zh: `${BRAND.name} 是视频后期包装师，方向覆盖视频包装、游戏PV、AIGC 与 3D数字短片。`,
  },
} as const;

export const OPEN_ROLES = [
  {
    title: "Documentary Film Editor",
    body: "We are looking for a story-led editor with a strong sense of rhythm, restraint and emotional structure.",
  },
  {
    title: "Junior Visual Designer",
    body: "Support campaign design, social content and evolving visual systems across a range of cultural and commercial projects.",
  },
  {
    title: "Motion Design Artist",
    body: "Create clean typographic motion, 2D animation and mixed-media sequences that strengthen story rather than distract from it.",
  },
] as const;

/**
 * Social accounts. `href` is intentionally null until a real profile URL exists —
 * we never link to a platform's root or use "#" placeholders. A link only renders
 * when its href is a real account URL.
 */
export const SOCIALS: { short: string; full: string; handle: string; href: string | null }[] = [
  {
    short: "B",
    full: "Bilibili",
    handle: BRAND.bilibili.handle,
    href: BRAND.bilibili.url || null,
  },
];

export const PROJECT_TYPES = [
  "Video packaging",
  "Game PV",
  "AIGC",
  "3D digital shorts",
  "Something else",
] as const;

export const BUDGET_RANGES = [
  "Under $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k – $250k",
  "$250k+",
] as const;
