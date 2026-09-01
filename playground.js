/**
 * playground.js
 * 可在任意课程页嵌入的 Nowledge Mem 界面组件（纯前端演示）：
 * 页面中放一个 <div data-mem-playground></div> 即可挂载一个 Mem Timeline
 * 复刻界面（推荐通过 snippets/playground.mdx 引入）。支持 Capture 保存、
 * 提问式 Recall、全部/已保存/事件筛选、时间线 ↔ 记忆视图切换（记忆视图
 * 支持搜索、活跃/已归档/全部切换、评分与收藏），以及右侧统计、活动日历、
 * 最近事件的联动。全部数据为内置示例，仅存内存，刷新即重置；不发起任何网络请求。
 *
 * 与 React 共存（同 mem-video-loading.js 的策略）：
 *   a) 初始扫描推迟到水合结束之后（DOMContentLoaded + 延迟补偿 + load 兜底）
 *   b) MutationObserver 持续观察并统一防抖（150ms），等 React 当前渲染批次
 *      稳定后再挂载，避免在 React 挂载中途改动其管理的 DOM
 *   c) 仅处理带 [data-mem-playground] 且未初始化的挂载点；其他页面完全惰性
 */
(function () {
  "use strict";

  var MOUNT_ATTR = "data-mem-playground";
  var INIT_ATTR = "data-mem-playground-init";
  var DEFER_MS = 1200; // 水合补偿窗口
  var SCAN_DEBOUNCE_MS = 150;
  var scanTimer = null;

  function isZh() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* --- Icons (lucide-style, stroke-based) ---------------------------------- */

  var ICON_PATHS = {
    home: '<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M12 2.7 3 10v9.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V10zM9.8 21v-5.5h4.4V21z"/>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    msgtext:
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
    asterisk: '<path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7"/>',
    share:
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    network:
      '<rect x="9" y="2.5" width="6" height="6" rx="1"/><rect x="2.5" y="15.5" width="6" height="6" rx="1"/><rect x="15.5" y="15.5" width="6" height="6" rx="1"/><path d="M12 8.5V12M5.5 15.5V12h13v3.5"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    compass:
      '<circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M21 12c.55 0 1-.45.95-1a10 10 0 0 0-8.95-8.95c-.55-.05-1 .4-1 .95v8a1 1 0 0 0 1 1z"/>',
    puzzle:
      '<path d="M4 7h3a1 1 0 0 0 1-1V5a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 0 0-4 0v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a2 2 0 0 0 0-4H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
    user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66"/>',
    updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    bookopen:
      '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    diamonds:
      '<path d="M7.4 2.9l2.4 2.4-2.4 2.4-2.4-2.4z"/><path d="M16.6 2.9 19 5.3l-2.4 2.4-2.4-2.4z"/><path d="M7.4 16.3l2.4 2.4-2.4 2.4-2.4-2.4z"/><path d="M16.6 16.3l2.4 2.4-2.4 2.4-2.4-2.4z"/>',
    broadcast:
      '<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M7.7 7.7a6.1 6.1 0 0 0 0 8.6M16.3 7.7a6.1 6.1 0 0 1 0 8.6M5.1 5.1a9.7 9.7 0 0 0 0 13.8M18.9 5.1a9.7 9.7 0 0 1 0 13.8"/>',
    caret: '<path d="m6 9 6 6 6-6"/>',
    calendar:
      '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4.7C7.5 3.4 10 5.9 12.5 5.9c2.3 0 4.3-1.5 6.5-1.2v9.6c-2.2-.3-4.2 1.2-6.5 1.2-2.5 0-5-2.5-7.5-1.2"/>',
    database:
      '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
    warn: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    note: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/>',
    sparkles:
      '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    layers:
      '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    zap: '<path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z"/>',
    paperclip:
      '<path d="M21 12.5l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8L13 4.9a3.7 3.7 0 0 1 5.2 5.2l-8.3 8.3a1.85 1.85 0 0 1-2.6-2.6l7.8-7.8"/>',
    send: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    chevron: '<path d="M9 18l6-6-6-6"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    panelleft:
      '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M9.2 4.5v15"/>',
    sliders:
      '<path d="M4 7h9M17.5 7H20M4 17h2.5M11 17h9"/><circle cx="15" cy="7" r="2.1"/><circle cx="8.5" cy="17" r="2.1"/>',
    star: '<path d="M12 3.1l2.7 5.5 6 .9-4.3 4.2 1 6-5.5-2.9-5.5 2.9 1-6L3.1 9.5l6-.9z"/>',
    trash:
      '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7"/><path d="M18.5 6.5 17.7 19a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9L5.5 6.5"/><path d="M10 10.7v5.6M14 10.7v5.6"/>',
    pin: '<path d="M9.3 3.5h5.4l.3 6.2 2.9 2.6.1 2.2H6l.1-2.2 2.9-2.6z"/><path d="M12 14.5v6"/>',
    refresh:
      '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.7 3.8v4.4h-4.4"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.2"/><path d="M12 7.6h.01"/>',
    faders:
      '<path d="M3.5 8h9.4M17.6 8h2.9M3.5 16h3.4M11.6 16h8.9"/><circle cx="15.2" cy="8" r="2.2"/><circle cx="9.2" cy="16" r="2.2"/>',
    scales:
      '<path d="M12 3.5V21M8.5 21h7"/><path d="M12 6 6.8 7M12 6l5.2 1"/><path d="M6.8 7 4 13.4a3 3 0 0 0 5.6 0zM17.2 7l-2.8 6.4a3 3 0 0 0 5.6 0z"/>',
    listchecks:
      '<path d="M10.8 6.2h9.7M10.8 12h9.7M10.8 17.8h9.7"/><path d="m3.4 5.7 1.5 1.5L7.6 4.5M3.4 11.5l1.5 1.5 2.7-2.7M3.4 17.3l1.5 1.5 2.7-2.7"/>',
    caldots:
      '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.8v3.6M8 2.8v3.6M3 9.6h18"/><circle cx="8.3" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="15.7" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="8.3" cy="17.2" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    scan: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/>',
    upload: '<path d="M12 15.5v-11"/><path d="m6.5 9.3 5.5-5.5 5.5 5.5"/><path d="M4.5 20h15"/>',
    checksquare:
      '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="m8.5 12.2 2.4 2.4 4.8-4.8"/>',
    chatcircle:
      '<path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z"/>',
    copy: '<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M5.5 15h-1a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
  };

  /* Unit type -> icon, mirroring the app's memory-unit-type-icon mapping */
  var UNIT_ICONS = {
    fact: "info",
    preference: "faders",
    decision: "scales",
    plan: "flag",
    procedure: "listchecks",
    learning: "lightbulb",
    context: "compass",
    event: "caldots",
    auto: "sparkles",
  };

  function icon(name) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICON_PATHS[name] +
      "</svg>"
    );
  }

  /* --- Locale data ---------------------------------------------------------- */

  var LOCALES = {
    en: {
      workspace: "Demo workspace",
      search: "Search…",
      nav: [
        ["home", "Timeline", "timeline"],
        ["lightbulb", "Memories", "memories"],
        ["msgtext", "Threads", "threads"],
        ["asterisk", "AI Now", null],
        ["share", "Graph", null],
        ["library", "Library", "library"],
        ["network", "Knowledge Tree", null],
        ["diamonds", "Skills", null],
        ["compass", "Context", null],
      ],
      favorites: "Favorites",
      noFavorites: "No favorites yet",
      bottom: [
        ["pie", "Stats"],
        ["puzzle", "Connections"],
        ["settings", "Settings"],
      ],
      title: "Timeline",
      badge: "Demo",
      subtitle: "Recent saves, discoveries, and working memory",
      windowTitle: "Nowledge Mem",
      placeholder: "What's on your mind?",
      sendLabel: "Send",
      closeLabel: "Close",
      tabs: [
        ["all", "All"],
        ["insights", "Discoveries"],
        ["crystals", "Crystals"],
        ["flags", "Attention"],
        ["saved", "Saved"],
        ["events", "Events"],
      ],
      dayToday: "Today",
      dayYesterday: "Yesterday",
      daySummary: function (saved, events) {
        return (
          saved +
          " saved · " +
          events +
          (events === 1 ? " event" : " events")
        );
      },
      memoryKind: "Saved",
      savedFoot: "Saved 1 memory",
      you: "You",
      savedEvent: "Saved 1 memory",
      answerTitle: "Answer",
      answerFound: function (n) {
        return "Based on " + n + " matching " + (n === 1 ? "memory" : "memories") + ":";
      },
      answerNone:
        "No matching memories yet. Try different keywords, or save a few first.",
      emptyFiltered: "Nothing here yet.",
      overview: "Knowledge Pulse",
      statLabels: ["memories", "crystals", "entities", "communities"],
      statMeta: { archived: "+12 archived", perWeek: "+6/wk" },
      pulse:
        "6 new memories this week. 1 crystal synthesized. 3 items need attention.",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      focus: {
        label: "Today's focus",
        space: "Default",
        text: "Key change: playground replica shipped; Lesson 2 now embeds the live demo.",
        time: "3h ago",
      },
      review: {
        title: "Needs Attention",
        subtitle:
          "Review by category, or let items clear without changing your memories.",
        next: "Next item clears in 27d · no memory changes",
        apply: function (n) {
          return "Apply to " + n;
        },
        items: [
          ["warn", "Conflicts", 1, "Recommended: Keep both and link"],
          ["clock", "Possibly outdated", 1, "Recommended: Leave unchanged"],
          ["database", "Memory health", 1, "Recommended: Leave unchanged"],
        ],
      },
      activity: "Activity",
      attention: "Needs Attention",
      attentionItems: [
        "Possible contradiction",
        "Memory may be outdated",
        "Memory health review is ready",
      ],
      recentEvents: "Recent Events",
      legend: ["Less", "More"],
      dow: ["M", "T", "W", "T", "F", "S", "S"],
      memories: [
        {
          day: "today",
          time: "09:12",
          source: "You",
          text: "Atlas landing page will use Next.js — we need SSR and better SEO.",
          tags: ["Atlas", "Decision"],
        },
        {
          day: "today",
          time: "08:47",
          source: "Codex",
          text: "Hero headline v1: “Give your AI the knowledge you already have.” A/B test pending.",
          tags: ["Copy"],
        },
        {
          day: "yesterday",
          time: "16:40",
          source: "Claude Code",
          text: "SEO checklist: per-page title and description, og image, canonical URL.",
          tags: ["SEO"],
        },
        {
          day: "yesterday",
          time: "15:05",
          source: "You",
          text: "Release order: English first, Chinese one week later; bilibili demo video comes after.",
          tags: ["Release"],
        },
        {
          day: "yesterday",
          time: "11:30",
          source: "You",
          text: "Pricing page on hold until the first conversion data comes in.",
          tags: ["Decision"],
        },
      ],
      events: [
        { day: "today", time: "10:48", title: "2 updates" },
        {
          day: "today",
          time: "10:37",
          title: "Conversations Imported",
          sub: "1 saved from Kimi Code. They are searchable now.",
          action: "Queue first memory batch",
        },
        { day: "yesterday", time: "18:02", title: "Rules review completed" },
        {
          day: "yesterday",
          time: "17:20",
          title: "Entity extraction: processed 3 memories",
        },
      ],
      counts: { memories: 128, distilled: 12, topics: 86, clusters: 4 },
      memView: {
        title: "Memories",
        badge: "Remote",
        subtitle: "Find specific memories, entities, and threads.",
        searchPh: "Search memories...",
        normal: "Normal",
        deep: "Deep",
        searchBtn: "Search",
        results: "Results",
        reset: "Reset",
        found: function (n) {
          return n + " found";
        },
        tiers: [
          ["active", "Active"],
          ["archived", "Archived"],
          ["all", "All"],
        ],
        filterBtn: "Filters",
        createBtn: "Create Memory",
        selectBtn: "Select",
        pageOf: function (current, total) {
          return "Page " + current + " of " + total;
        },
        range: function (start, end, total) {
          return start + "-" + end + " of " + total + " memories";
        },
        empty: "No matching memories.",
        justNow: "Just now",
        units: {
          fact: "Fact",
          preference: "Preference",
          decision: "Decision",
          plan: "Plan",
          procedure: "Procedure",
          learning: "Learning",
          context: "Context",
          event: "Event",
        },
        star: "Rate",
        pin: "Pin memory",
        del: "Delete",
      },
      memList: [
        {
          title: "Landing page stack: Next.js",
          text: "Atlas landing pages ship on Next.js: SSR for first-paint speed, per-page og image and canonical URL. Build size verified within budget.",
          unit: "decision",
          source: "Claude Code",
          ago: "2h ago",
          rating: 4,
          tags: ["Atlas", "Decision"],
        },
        {
          title: "Mint accent fails contrast in dark mode",
          text: "The mint button reaches only 2.8:1 contrast in dark mode, below WCAG AA. Next step: switch the dark accent to a more saturated teal and retest every button state.",
          unit: "learning",
          source: "Codex",
          ago: "5h ago",
          rating: 3,
          tags: ["Design", "A11y"],
        },
        {
          title: "Release order: English first, Chinese a week later",
          text: "Ship the English site first to collect conversion data; Chinese follows a week later, with the bilibili demo video recorded after.",
          unit: "plan",
          source: "You",
          ago: "Yesterday",
          rating: 0,
          tags: ["Release"],
        },
        {
          title: "SEO checklist",
          text: "Per-page title and description, og image, canonical URL, auto-updated sitemap. Walk the list before every release.",
          unit: "procedure",
          source: "Codex",
          ago: "Yesterday",
          rating: 0,
          tags: ["SEO"],
        },
        {
          title: "Copy tone: direct, few adjectives",
          text: "Avoid words like “powerful” or “seamless” on landing pages; show value with concrete numbers and real scenarios.",
          unit: "preference",
          source: "You",
          ago: "3d ago",
          rating: 5,
          tags: ["Copy"],
        },
        {
          title: "Atlas project context",
          text: "Atlas is a knowledge base for small teams, currently in private beta. Target users already work with AI tools daily.",
          unit: "context",
          source: "Kimi Code",
          ago: "3d ago",
          rating: 0,
          tags: ["Atlas"],
        },
        {
          title: "Conversion report every Monday",
          text: "The dashboard generates last week's conversion report every Monday 09:00 and posts it to the product channel.",
          unit: "fact",
          source: "Cursor",
          ago: "4d ago",
          rating: 0,
          tags: ["Data"],
        },
        {
          title: "v1 milestone: mid-September",
          text: "The public v1 launch targets mid-September and needs the pricing page, docs site, and demo video done.",
          unit: "event",
          source: "You",
          ago: "1w ago",
          rating: 2,
          tags: ["Milestone"],
        },
        {
          title: "Old pricing plan: per-seat",
          text: "The early per-seat pricing was replaced by usage-based pricing. Kept for reference.",
          unit: "decision",
          source: "You",
          ago: "2w ago",
          rating: 0,
          tags: ["Pricing"],
          archived: true,
        },
        {
          title: "Previous hero headline",
          text: "The old hero line “Knowledge that flows by itself” was replaced by the current draft.",
          unit: "learning",
          source: "Codex",
          ago: "2w ago",
          rating: 0,
          tags: ["Copy"],
          archived: true,
        },
      ],
      threadView: {
        title: "Threads",
        badge: "Remote",
        subtitle: "Browse and manage your conversation history.",
        searchPh: "Search threads...",
        agentSessions: "Agent Sessions",
        allSources: "All",
        results: "Results",
        reset: "Reset",
        found: function (n) {
          return n + " found";
        },
        importBtn: "Import Threads",
        selectBtn: "Select",
        messages: function (n) {
          return n + (n === 1 ? " message" : " messages");
        },
        copyRef: "Copy thread reference",
        copied: "Copied",
        copyFailed: "Could not copy",
        emptyTitle: "No threads found",
        emptyHint: "Try different search terms",
        prev: "Previous",
        next: "Next",
        pageOf: function (current, total) {
          return "Page " + current + " of " + total;
        },
        range: function (start, end, total) {
          return start + "–" + end + " of " + total;
        },
        jumpPh: function (total) {
          return "Page / " + total;
        },
        go: "Go",
      },
      threadList: [
        {
          title: "Three rounds of hero copy and the A/B test plan",
          source: "kimi-code",
          sourceLabel: "Kimi Code",
          messages: 47,
          date: "Aug 28, 2026",
        },
        {
          title: "Landing the Next.js SEO checklist",
          source: "codex",
          sourceLabel: "Codex",
          messages: 32,
          date: "Aug 27, 2026",
        },
        {
          title: "Pricing funnel: visit-to-paid event tracking",
          source: "claude-code",
          sourceLabel: "Claude Code",
          messages: 28,
          date: "Aug 25, 2026",
        },
        {
          title: "Dark-mode contrast audit and fixes",
          source: "codex",
          sourceLabel: "Codex",
          messages: 19,
          date: "Aug 24, 2026",
        },
        {
          title: "Release checklist: docs site, demo video, social assets",
          source: "kimi-code",
          sourceLabel: "Kimi Code",
          messages: 15,
          date: "Aug 22, 2026",
        },
        {
          title: "Server-side design for usage-based billing",
          source: "cursor",
          sourceLabel: "Cursor",
          messages: 41,
          date: "Aug 20, 2026",
        },
        {
          title: "Brand palette finalization: mint to teal",
          source: "claude-code",
          sourceLabel: "Claude Code",
          messages: 12,
          date: "Aug 18, 2026",
        },
        {
          title: "How could my release cadence improve?",
          source: "ai-now",
          sourceLabel: "AI Now",
          badge: "Ai-now",
          messages: 2,
          date: "Aug 15, 2026",
        },
      ],
      libView: {
        title: "Library",
        badge: "Remote",
        subtitle: "Documents and sources Mem can search inside.",
        importBtn: "Import document",
        importEvent: "Document imported",
        indexing: "Indexing…",
        indexed: "Indexed",
        importDoc: {
          name: "Atlas architecture review.pdf",
          kind: "PDF",
          size: "12 pages",
          page: "p. 4",
          excerpt:
            "API rate limiting: 100 requests per minute per token, bursts up to 300 with exponential backoff. Public endpoints share one bucket.",
          tags: ["Atlas", "API"],
        },
      },
      libList: [
        {
          name: "Atlas one-pager.md",
          kind: "Markdown",
          size: "4 pages",
          page: "p. 1",
          excerpt:
            "Atlas is a knowledge base for small teams. Positioning: your existing knowledge, reusable across AI tools.",
          tags: ["Atlas"],
        },
        {
          name: "Launch checklist.pdf",
          kind: "PDF",
          size: "2 pages",
          page: "p. 2",
          excerpt:
            "Before launch: pricing page live, docs site proofread, demo video published, status page connected.",
          tags: ["Release"],
        },
      ],
    },
    zh: {
      workspace: "演示工作空间",
      search: "搜索…",
      nav: [
        ["home", "时间线", "timeline"],
        ["lightbulb", "记忆", "memories"],
        ["msgtext", "会话记录", "threads"],
        ["asterisk", "AI Now", null],
        ["share", "知识图谱", null],
        ["library", "资料库", "library"],
        ["network", "知识树", null],
        ["diamonds", "技能", null],
        ["compass", "上下文", null],
      ],
      favorites: "收藏",
      noFavorites: "还没有收藏",
      bottom: [
        ["pie", "统计"],
        ["puzzle", "连接"],
        ["settings", "设置"],
      ],
      title: "时间线",
      badge: "演示",
      subtitle: "最近的保存、发现与工作记忆",
      windowTitle: "Nowledge Mem",
      placeholder: "想到了什么？",
      sendLabel: "发送",
      closeLabel: "关闭",
      tabs: [
        ["all", "全部"],
        ["insights", "发现"],
        ["crystals", "知识结晶"],
        ["flags", "待关注"],
        ["saved", "已保存"],
        ["events", "事件"],
      ],
      dayToday: "今天",
      dayYesterday: "昨天",
      daySummary: function (saved, events) {
        return saved + " 已保存 · " + events + " 事件";
      },
      memoryKind: "已保存",
      savedFoot: "已保存 1 条记忆",
      you: "你",
      savedEvent: "已保存 1 条记忆",
      answerTitle: "回答",
      answerFound: function (n) {
        return "根据 " + n + " 条相关记忆：";
      },
      answerNone: "还没有匹配的记忆。换个关键词试试，或先保存几条。",
      emptyFiltered: "这里还没有内容。",
      overview: "知识概览",
      statLabels: ["记忆", "知识结晶", "主题", "话题群"],
      statMeta: { archived: "另有 12 条已归档", perWeek: "+6/周" },
      pulse: "本周新增 6 条记忆。生成了 1 个知识结晶。3 项需留意。",
      focus: {
        label: "今日焦点",
        space: "默认",
        text: "关键变化：Playground 组件复刻完成；第 2 课现在嵌入实时演示。",
        time: "3 小时前",
      },
      review: {
        title: "需要留意",
        subtitle: "可按类别批阅；未处理的事项到期后会安全移出，不会改动记忆。",
        next: "下一项将在 27 天后移出 · 不改动记忆",
        apply: function (n) {
          return "应用到 " + n + " 项";
        },
        items: [
          ["warn", "记忆冲突", 1, "推荐：保留两条并建立关联"],
          ["clock", "可能已过时", 1, "推荐：保持不变"],
          ["database", "记忆健康", 1, "推荐：保持不变"],
        ],
      },
      activity: "活动日历",
      attention: "需留意",
      attentionItems: ["可能存在矛盾", "记忆可能已过时", "记忆健康审阅已就绪"],
      recentEvents: "最近事件",
      legend: ["少", "多"],
      dow: ["一", "二", "三", "四", "五", "六", "日"],
      memories: [
        {
          day: "today",
          time: "09:12",
          source: "你",
          text: "Atlas 落地页决定用 Next.js —— 需要 SSR 和更好的 SEO。",
          tags: ["Atlas", "决策"],
        },
        {
          day: "today",
          time: "08:47",
          source: "Codex",
          text: "Hero 区标题初稿：「把你已经拥有的知识交给 AI」，待 A/B 测试。",
          tags: ["文案"],
        },
        {
          day: "yesterday",
          time: "16:40",
          source: "Claude Code",
          text: "SEO 检查清单：每页 title 和 description、og 图、canonical 链接。",
          tags: ["SEO"],
        },
        {
          day: "yesterday",
          time: "15:05",
          source: "你",
          text: "发布节奏：先英文版，中文版隔一周；bilibili 演示视频后补。",
          tags: ["发布"],
        },
        {
          day: "yesterday",
          time: "11:30",
          source: "你",
          text: "定价页暂缓，等第一波转化数据再定。",
          tags: ["决策"],
        },
      ],
      events: [
        { day: "today", time: "10:48", title: "2 项更新" },
        {
          day: "today",
          time: "10:37",
          title: "会话已导入",
          sub: "已从 Kimi Code 保存 1 个会话。现在就能搜索。",
          action: "安排第一批记忆",
        },
        { day: "yesterday", time: "18:02", title: "规则审阅完成" },
        { day: "yesterday", time: "17:20", title: "实体抽取：已处理 3 条记忆" },
      ],
      counts: { memories: 128, distilled: 12, topics: 86, clusters: 4 },
      memView: {
        title: "记忆",
        badge: "远程",
        subtitle: "查找和管理你的记忆",
        searchPh: "搜索记忆…",
        normal: "普通",
        deep: "深度",
        searchBtn: "搜索",
        results: "结果",
        reset: "重置",
        found: function (n) {
          return n + " 条";
        },
        tiers: [
          ["active", "活跃"],
          ["archived", "已归档"],
          ["all", "全部"],
        ],
        filterBtn: "筛选",
        createBtn: "创建记忆",
        selectBtn: "选择",
        pageOf: function (current, total) {
          return "第 " + current + " 页，共 " + total + " 页";
        },
        range: function (start, end, total) {
          return start + "-" + end + " / 共 " + total + " 条记忆";
        },
        empty: "没有匹配的记忆。",
        justNow: "刚刚",
        units: {
          fact: "事实",
          preference: "偏好",
          decision: "决策",
          plan: "计划",
          procedure: "流程",
          learning: "学习",
          context: "上下文",
          event: "事件",
        },
        star: "评分",
        pin: "收藏",
        del: "删除",
      },
      memList: [
        {
          title: "落地页框架选定 Next.js",
          text: "Atlas 落地页用 Next.js 实现：SSR 保证首屏速度，og 图与 canonical 链接按页面配置。构建产物体积已验证在预算内。",
          unit: "decision",
          source: "Claude Code",
          ago: "2 小时前",
          rating: 4,
          tags: ["Atlas", "决策"],
        },
        {
          title: "薄荷绿主色在深色模式下对比度不足",
          text: "薄荷绿按钮在深色模式下对比度只有 2.8:1，达不到 WCAG AA。下一步把深色主色换成更饱和的青绿，并复测所有按钮状态。",
          unit: "learning",
          source: "Codex",
          ago: "5 小时前",
          rating: 3,
          tags: ["设计", "可访问性"],
        },
        {
          title: "发布节奏：先英文，中文隔一周",
          text: "英文版先上线收集转化数据；中文版隔一周发布，bilibili 演示视频随后补录。",
          unit: "plan",
          source: "你",
          ago: "昨天",
          rating: 0,
          tags: ["发布"],
        },
        {
          title: "SEO 检查清单",
          text: "每页独立 title 与 description、og 图、canonical 链接、sitemap 自动更新。每次发布前逐项过一遍。",
          unit: "procedure",
          source: "Codex",
          ago: "昨天",
          rating: 0,
          tags: ["SEO"],
        },
        {
          title: "文案口吻：直接、少形容词",
          text: "落地页文案避免「强大」「无缝」这类词，用具体数字和真实场景说明价值。",
          unit: "preference",
          source: "你",
          ago: "3 天前",
          rating: 5,
          tags: ["文案"],
        },
        {
          title: "Atlas 项目背景",
          text: "Atlas 是面向小团队的知识库产品，当前处于内测。目标用户是已经在用 AI 工具做日常工作的团队。",
          unit: "context",
          source: "Kimi Code",
          ago: "3 天前",
          rating: 0,
          tags: ["Atlas"],
        },
        {
          title: "转化数据每周一出报表",
          text: "数据看板每周一 09:00 自动生成上周转化报表，并同步到产品频道。",
          unit: "fact",
          source: "Cursor",
          ago: "4 天前",
          rating: 0,
          tags: ["数据"],
        },
        {
          title: "v1 里程碑：9 月中旬",
          text: "v1 公开发布目标定在 9 月中旬，需要完成定价页、文档站和演示视频。",
          unit: "event",
          source: "你",
          ago: "1 周前",
          rating: 2,
          tags: ["里程碑"],
        },
        {
          title: "定价页旧方案：按席位计费",
          text: "早期按席位计费的方案已被按用量计费取代，保留备查。",
          unit: "decision",
          source: "你",
          ago: "2 周前",
          rating: 0,
          tags: ["定价"],
          archived: true,
        },
        {
          title: "首页 Hero 旧稿",
          text: "旧版 Hero 标题「让知识自己流动起来」已被当前版本取代。",
          unit: "learning",
          source: "Codex",
          ago: "2 周前",
          rating: 0,
          tags: ["文案"],
          archived: true,
        },
      ],
      threadView: {
        title: "会话记录",
        badge: "远程",
        subtitle: "浏览、搜索和管理从各类 AI 工具保存下来的会话。",
        searchPh: "搜索会话记录…",
        agentSessions: "智能体会话",
        allSources: "全部",
        results: "结果",
        reset: "重置",
        found: function (n) {
          return n + " 条";
        },
        importBtn: "导入会话",
        selectBtn: "选择",
        messages: function (n) {
          return n + " 条消息";
        },
        copyRef: "复制会话引用",
        copied: "已复制",
        copyFailed: "无法复制",
        emptyTitle: "没有找到相关会话",
        emptyHint: "尝试不同的搜索词",
        prev: "上一页",
        next: "下一页",
        pageOf: function (current, total) {
          return "第 " + current + " 页，共 " + total + " 页";
        },
        range: function (start, end, total) {
          return start + "–" + end + " / 共 " + total + " 条";
        },
        jumpPh: function (total) {
          return "页码 / " + total;
        },
        go: "跳转",
      },
      threadList: [
        {
          title: "落地页 Hero 文案三轮迭代与 A/B 测试方案",
          source: "kimi-code",
          sourceLabel: "Kimi Code",
          messages: 47,
          date: "Aug 28, 2026",
        },
        {
          title: "Next.js 落地页 SEO 配置清单落地",
          source: "codex",
          sourceLabel: "Codex",
          messages: 32,
          date: "Aug 27, 2026",
        },
        {
          title: "定价页转化漏斗：从访问到付费的埋点设计",
          source: "claude-code",
          sourceLabel: "Claude Code",
          messages: 28,
          date: "Aug 25, 2026",
        },
        {
          title: "深色模式对比度审计与修复",
          source: "codex",
          sourceLabel: "Codex",
          messages: 19,
          date: "Aug 24, 2026",
        },
        {
          title: "发布检查：文档站、演示视频与社媒素材",
          source: "kimi-code",
          sourceLabel: "Kimi Code",
          messages: 15,
          date: "Aug 22, 2026",
        },
        {
          title: "用量计费方案的服务端实现讨论",
          source: "cursor",
          sourceLabel: "Cursor",
          messages: 41,
          date: "Aug 20, 2026",
        },
        {
          title: "品牌色板定稿：从薄荷绿到青绿",
          source: "claude-code",
          sourceLabel: "Claude Code",
          messages: 12,
          date: "Aug 18, 2026",
        },
        {
          title: "我最近的发布节奏哪里可以优化？",
          source: "ai-now",
          sourceLabel: "AI Now",
          badge: "Ai-now",
          messages: 2,
          date: "Aug 15, 2026",
        },
      ],
      libView: {
        title: "资料库",
        badge: "远程",
        subtitle: "Mem 可以检索内容的文档与资料。",
        importBtn: "导入文档",
        importEvent: "已导入文档",
        indexing: "索引中…",
        indexed: "已索引",
        importDoc: {
          name: "Atlas 架构评审.pdf",
          kind: "PDF",
          size: "12 页",
          page: "第 4 页",
          excerpt:
            "API 限流：每个令牌每分钟 100 次请求，突发可到 300，超出后指数退避。公开端点共用一个额度桶。",
          tags: ["Atlas", "API"],
        },
      },
      libList: [
        {
          name: "Atlas 产品一页纸.md",
          kind: "Markdown",
          size: "4 页",
          page: "第 1 页",
          excerpt:
            "Atlas 是面向小团队的知识库。定位：把你已有的知识，变成跨 AI 工具可复用的资产。",
          tags: ["Atlas"],
        },
        {
          name: "发布检查清单.pdf",
          kind: "PDF",
          size: "2 页",
          page: "第 2 页",
          excerpt:
            "发布前确认：定价页上线、文档站校对完成、演示视频发布、状态页接入。",
          tags: ["发布"],
        },
      ],
    },
  };

  /* --- Recall: keyword matching over mock memories -------------------------- */

  function tokenize(query) {
    var tokens = [];
    var latin = query.toLowerCase().match(/[a-z0-9#]{2,}/g) || [];
    tokens = tokens.concat(latin);
    var hanRuns = query.match(/[一-鿿]+/g) || [];
    for (var i = 0; i < hanRuns.length; i++) {
      var run = hanRuns[i];
      if (run.length === 1) {
        tokens.push(run);
      } else {
        if (run.length <= 4) {
          tokens.push(run);
        }
        for (var j = 0; j < run.length - 1; j++) {
          tokens.push(run.slice(j, j + 2));
        }
      }
    }
    return tokens;
  }

  function searchMemories(memories, query) {
    var tokens = tokenize(query);
    if (!tokens.length) {
      return [];
    }
    var scored = [];
    for (var i = 0; i < memories.length; i++) {
      var memory = memories[i];
      var haystack = (memory.text + " " + memory.tags.join(" ") + " " + memory.source).toLowerCase();
      var score = 0;
      for (var t = 0; t < tokens.length; t++) {
        if (haystack.indexOf(tokens[t]) !== -1) {
          score += 1;
        }
      }
      if (score > 0) {
        scored.push({ memory: memory, score: score });
      }
    }
    scored.sort(function (a, b) {
      return b.score - a.score;
    });
    return scored.slice(0, 3).map(function (hit) {
      return hit.memory;
    });
  }

  // Same keyword matching over indexed Library documents.
  function searchDocuments(docs, query) {
    var tokens = tokenize(query);
    if (!tokens.length) {
      return [];
    }
    var scored = [];
    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      if (doc.status !== "indexed") {
        continue;
      }
      var haystack = (doc.name + " " + doc.excerpt + " " + doc.tags.join(" ")).toLowerCase();
      var score = 0;
      for (var t = 0; t < tokens.length; t++) {
        if (haystack.indexOf(tokens[t]) !== -1) {
          score += 1;
        }
      }
      if (score > 0) {
        scored.push({ doc: doc, score: score });
      }
    }
    scored.sort(function (a, b) {
      return b.score - a.score;
    });
    return scored.slice(0, 2).map(function (hit) {
      return hit.doc;
    });
  }

  /* --- Rendering ------------------------------------------------------------ */

  function nowHM() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  // Intentional demo behavior: copying a thread writes a harmless fake
  // reference (nowledgemem://thread/demo-N) to the real clipboard so the
  // interaction feels like the app. Nothing else leaves the browser.
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      var copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) resolve();
      else reject(new Error("Clipboard access is unavailable."));
    });
  }

  function focusHtml(L) {
    return (
      '<div class="mp-focus"><div class="mp-focus-row">' +
      '<span class="mp-focus-label">' +
      esc(L.focus.label) +
      '</span><span class="mp-focus-space">' +
      esc(L.focus.space) +
      '</span><span class="mp-focus-text">' +
      esc(L.focus.text) +
      '</span><span class="mp-focus-time">' +
      esc(L.focus.time) +
      '</span><i class="mp-focus-caret">' +
      icon("caret") +
      "</i></div></div>"
    );
  }

  function reviewHtml(L) {
    var total = 0;
    var items = L.review.items
      .map(function (item) {
        total += item[2];
        return (
          '<div class="mp-review-item">' +
          '<span class="mp-review-caret">' +
          icon("caret") +
          '</span><span class="mp-review-icon">' +
          icon(item[0]) +
          '</span><span class="mp-review-main"><span class="mp-review-name">' +
          esc(item[1]) +
          " <em>" +
          item[2] +
          '</em></span><span class="mp-review-rec">' +
          esc(item[3]) +
          '</span></span><span class="mp-review-apply">' +
          icon("check") +
          "<span>" +
          esc(L.review.apply(item[2])) +
          "</span></span></div>"
        );
      })
      .join("");
    return (
      '<section class="mp-review" aria-label="' +
      esc(L.review.title) +
      " (" +
      total +
      ')">' +
      '<div class="mp-review-head"><span class="mp-review-badge">' +
      icon("flag") +
      '</span><div class="mp-review-titles"><h2 class="mp-review-title">' +
      esc(L.review.title) +
      " (" +
      total +
      ')</h2><p class="mp-review-sub">' +
      esc(L.review.subtitle) +
      '</p><p class="mp-review-next">' +
      icon("clock") +
      "<span>" +
      esc(L.review.next) +
      "</span></p></div></div>" +
      '<div class="mp-review-list">' +
      items +
      "</div></section>"
    );
  }

  function renderShell(L) {
    var nav = L.nav
      .map(function (item) {
        var inner =
          icon(item[0]) +
          '<span class="mp-nav-label">' +
          esc(item[1]) +
          "</span>";
        if (item[2]) {
          return (
            '<button type="button" class="mp-nav-item' +
            (item[2] === "timeline" ? " mp-active" : "") +
            '" data-mp-view="' +
            item[2] +
            '" aria-label="' +
            esc(item[1]) +
            '">' +
            inner +
            "</button>"
          );
        }
        return '<span class="mp-nav-item">' + inner + "</span>";
      })
      .join("");

    var bottom = L.bottom
      .map(function (item) {
        return (
          '<span class="mp-nav-item">' +
          icon(item[0]) +
          '<span class="mp-nav-label">' +
          esc(item[1]) +
          "</span></span>"
        );
      })
      .join("");

    var tabs = L.tabs
      .map(function (tab, index) {
        return (
          '<button type="button" class="mp-tab' +
          (index === 0 ? " mp-on" : "") +
          '" data-mp-filter="' +
          tab[0] +
          '">' +
          esc(tab[1]) +
          "</button>"
        );
      })
      .join("");

    var attention = L.attentionItems
      .map(function (item) {
        return (
          '<div class="mp-attention-item">' +
          icon("alert") +
          "<span>" +
          esc(item) +
          "</span>" +
          icon("chevron") +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="mp-window">' +
      '<div class="mp-titlebar"><span class="mp-dots"><i></i><i></i><i></i></span>' +
      '<span class="mp-window-title">' +
      esc(L.windowTitle) +
      '</span><span class="mp-badge">' +
      esc(L.badge) +
      "</span></div>" +
      '<div class="mp-shell">' +
      '<div class="mp-rail-left">' +
      '<div class="mp-search">' +
      icon("search") +
      "<span>" +
      esc(L.search) +
      "</span></div>" +
      '<div class="mp-nav">' +
      nav +
      "</div>" +
      '<div class="mp-rail-section"><div class="mp-rail-label">' +
      esc(L.favorites) +
      '</div><div class="mp-rail-empty">' +
      esc(L.noFavorites) +
      "</div></div>" +
      '<div class="mp-rail-bottom">' +
      bottom +
      '<span class="mp-nav-item">' +
      icon("broadcast") +
      '<span class="mp-nav-label">' +
      esc(L.workspace) +
      '</span><i class="mp-ws-switch">' +
      icon("updown") +
      "</i></span>" +
      "</div>" +
      "</div>" +
      '<div class="mp-main">' +
      '<div class="mp-pane" data-mp-pane="timeline">' +
      '<div class="mp-head"><h2 class="mp-title">' +
      esc(L.title) +
      '</h2><span class="mp-space-pill">' +
      icon("layers") +
      esc(L.focus.space) +
      '</span></div><div class="mp-subtitle">' +
      esc(L.subtitle) +
      "</div>" +
      '<div class="mp-capture">' +
      '<textarea rows="2" data-mp-input placeholder="' +
      esc(L.placeholder) +
      '" aria-label="' +
      esc(L.placeholder) +
      '"></textarea>' +
      '<div class="mp-capture-bar">' +
      '<span class="mp-tools"><i>' +
      icon("paperclip") +
      "</i><i>" +
      icon("bookopen") +
      '</i></span>' +
      '<span class="mp-kbd" aria-hidden="true">⌘⏎</span>' +
      '<button type="button" class="mp-send" data-mp-send aria-label="' +
      esc(L.sendLabel) +
      '" disabled>' +
      icon("send") +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="mp-tabs">' +
      tabs +
      "</div>" +
      focusHtml(L) +
      '<div data-mp-answer></div>' +
      reviewHtml(L) +
      '<div data-mp-timeline></div>' +
      "</div>" +
      memPaneHtml(L) +
      threadsPaneHtml(L) +
      libPaneHtml(L) +
      "</div>" +
      '<div class="mp-rail-right" data-mp-rail-right>' +
      '<h3 class="mp-panel-title">' +
      esc(L.overview) +
      '</h3><div class="mp-stats" data-mp-stats></div>' +
      '<p class="mp-pulse">' +
      esc(L.pulse) +
      "</p>" +
      '<i class="mp-divider"></i>' +
      '<div class="mp-calendar"><div class="mp-cal-head"><h3 class="mp-panel-title">' +
      esc(L.activity) +
      '</h3><span class="mp-cal-month"><i>' +
      icon("chevron") +
      '</i><span data-mp-month></span><i class="mp-cal-next">' +
      icon("chevron") +
      "</i></span></div>" +
      '<div class="mp-cal-grid" data-mp-calendar></div>' +
      '<div class="mp-legend">' +
      esc(L.legend[0]) +
      '<i></i><i class="mp-lv1"></i><i class="mp-lv2"></i><i class="mp-lv3"></i><i class="mp-lv4"></i>' +
      esc(L.legend[1]) +
      "</div></div>" +
      '<i class="mp-divider"></i>' +
      '<div class="mp-attention"><h3 class="mp-panel-title">' +
      esc(L.attention) +
      " (" +
      L.attentionItems.length +
      ")</h3>" +
      attention +
      "</div>" +
      '<i class="mp-divider"></i>' +
      '<div class="mp-side-events"><h3 class="mp-panel-title">' +
      esc(L.recentEvents) +
      '</h3><div data-mp-side-events></div></div>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderStats(mount, L, state) {
    var values = [
      state.counts.memories,
      state.counts.distilled,
      state.counts.topics,
      state.counts.clusters,
    ];
    var html = "";
    for (var i = 0; i < values.length; i++) {
      html +=
        '<div class="mp-stat' +
        (i < 2 ? " mp-stat-big" : "") +
        '"><div class="mp-stat-num">' +
        values[i] +
        '</div><div class="mp-stat-label">' +
        esc(L.statLabels[i]);
      if (i === 0) {
        html +=
          ' <span class="mp-stat-sub">' +
          esc(L.statMeta.archived) +
          '</span> <span class="mp-stat-week">' +
          esc(L.statMeta.perWeek) +
          "</span>";
      }
      html += "</div></div>";
    }
    mount.querySelector("[data-mp-stats]").innerHTML = html;
  }

  function calendarLevel(day, month, isFuture) {
    if (isFuture) {
      return 0;
    }
    return (day * 7 + month * 3) % 5; // 稳定的伪随机强度，仅作演示
  }

  function renderCalendar(mount, L, state) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();
    var firstOffset = (new Date(year, month, 1).getDay() + 6) % 7; // 周一为一周起点
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var html = L.dow
      .map(function (dow) {
        return '<span class="mp-cal-dow">' + esc(dow) + "</span>";
      })
      .join("");
    for (var blank = 0; blank < firstOffset; blank++) {
      html += "<span></span>";
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var level = calendarLevel(day, month, day > today);
      if (day === today) {
        level = Math.max(2, Math.min(4, state.todayLevel));
      }
      html +=
        '<span class="mp-cal-cell' +
        (level > 0 ? " mp-lv" + level : "") +
        (day === today ? " mp-today" : "") +
        '"></span>';
    }
    mount.querySelector("[data-mp-calendar]").innerHTML = html;
    mount.querySelector("[data-mp-month]").textContent = L.months
      ? L.months[month] + " " + year
      : year + "年" + (month + 1) + "月";
  }

  function renderSideEvents(mount, L, state) {
    var html = state.events
      .slice(0, 4)
      .map(function (event) {
        return (
          '<div class="mp-side-event"><div class="mp-side-event-text">' +
          esc(event.title) +
          '</div><div class="mp-side-event-time">' +
          esc(event.day === "today" ? L.dayToday : L.dayYesterday) +
          " · " +
          esc(event.time) +
          "</div></div>"
        );
      })
      .join("");
    mount.querySelector("[data-mp-side-events]").innerHTML = html;
  }

  function entryHtml(L, memory) {
    return (
      '<div class="mp-entry"><div class="mp-entry-head"><span class="mp-entry-icon">' +
      icon("note") +
      '</span><span class="mp-entry-kind">' +
      esc(L.memoryKind) +
      '</span><span class="mp-entry-src">' +
      esc(memory.source) +
      '</span><span class="mp-entry-time">' +
      esc(memory.time) +
      '</span></div><div class="mp-entry-text">' +
      esc(memory.text) +
      '</div><div class="mp-entry-foot">' +
      icon("check") +
      "<span>" +
      esc(L.savedFoot) +
      "</span></div></div>"
    );
  }

  function eventHtml(event) {
    return (
      '<div class="mp-event"><span class="mp-event-dot"></span>' +
      '<div class="mp-event-body"><div class="mp-event-row">' +
      icon("zap") +
      '<span class="mp-event-title">' +
      esc(event.title) +
      "</span><time>" +
      esc(event.time) +
      "</time></div>" +
      (event.sub
        ? '<div class="mp-event-sub">' +
          esc(event.sub) +
          (event.action
            ? '<button type="button" class="mp-event-action">' +
              esc(event.action) +
              "</button>"
            : "") +
          "</div>"
        : "") +
      "</div></div>"
    );
  }

  function renderTimeline(mount, L, state) {
    var groups = [
      ["today", L.dayToday],
      ["yesterday", L.dayYesterday],
    ];
    var html = "";
    for (var g = 0; g < groups.length; g++) {
      var day = groups[g][0];
      var label = groups[g][1];
      var memories = state.memories.filter(function (m) {
        return m.day === day;
      });
      var events = state.events.filter(function (e) {
        return e.day === day;
      });
      var parts = [];
      var i;
      var showMemories = state.filter === "all" || state.filter === "saved";
      var showEvents = state.filter === "all" || state.filter === "events";
      if (showMemories) {
        for (i = 0; i < memories.length; i++) {
          parts.push(entryHtml(L, memories[i]));
        }
      }
      if (showEvents) {
        for (i = 0; i < events.length; i++) {
          parts.push(eventHtml(events[i]));
        }
      }
      if (!parts.length) {
        continue;
      }
      html +=
        '<div class="mp-day"><i class="mp-day-line"></i><span class="mp-day-pill">' +
        icon("calendar") +
        "<b>" +
        esc(label) +
        "</b> <em>" +
        esc(L.daySummary(memories.length, events.length)) +
        '</em></span><i class="mp-day-line"></i></div>' +
        parts.join("");
    }
    if (!html) {
      html = '<div class="mp-empty">' + esc(L.emptyFiltered) + "</div>";
    }
    mount.querySelector("[data-mp-timeline]").innerHTML = html;
  }

  function renderAnswer(mount, L, state) {
    var box = mount.querySelector("[data-mp-answer]");
    if (!state.answer) {
      box.innerHTML = "";
      return;
    }
    var body;
    var docs = state.answer.docs || [];
    var total = state.answer.matches.length + docs.length;
    if (total) {
      body =
        '<div class="mp-answer-text">' +
        esc(L.answerFound(total)) +
        "</div>" +
        state.answer.matches
          .map(function (memory) {
            return (
              '<div class="mp-cite"><div class="mp-cite-text">' +
              esc(memory.text) +
              '</div><div class="mp-cite-meta">' +
              esc(memory.source) +
              " · " +
              esc(memory.day === "today" ? L.dayToday : L.dayYesterday) +
              " " +
              esc(memory.time) +
              "</div></div>"
            );
          })
          .join("") +
        docs
          .map(function (doc) {
            return (
              '<div class="mp-cite mp-cite-doc"><div class="mp-cite-text">' +
              esc(doc.excerpt) +
              '</div><div class="mp-cite-meta">' +
              icon("note") +
              "<span>" +
              esc(doc.name) +
              " · " +
              esc(doc.page) +
              "</span></div></div>"
            );
          })
          .join("");
    } else {
      body = '<div class="mp-answer-text">' + esc(L.answerNone) + "</div>";
    }
    box.innerHTML =
      '<div class="mp-answer"><div class="mp-answer-head">' +
      icon("sparkles") +
      "<span>" +
      esc(L.answerTitle) +
      '</span><button type="button" class="mp-answer-close" data-mp-close aria-label="' +
      esc(L.closeLabel) +
      '">×</button></div>' +
      body +
      "</div>";
  }

  /* --- Memories view -------------------------------------------------------- */

  function memPaneHtml(L) {
    var V = L.memView;
    var tiers = V.tiers
      .map(function (tier, index) {
        return (
          '<button type="button" class="mp-mem-tier' +
          (index === 0 ? " mp-on" : "") +
          '" data-mp-tier="' +
          tier[0] +
          '">' +
          esc(tier[1]) +
          "</button>"
        );
      })
      .join("");
    return (
      '<div class="mp-pane" data-mp-pane="memories" hidden>' +
      '<div class="mp-head"><span class="mp-side-toggle" aria-hidden="true">' +
      icon("panelleft") +
      '</span><h2 class="mp-title">' +
      esc(V.title) +
      '</h2><span class="mp-space-pill">' +
      icon("broadcast") +
      esc(V.badge) +
      "</span></div>" +
      '<div class="mp-subtitle">' +
      esc(V.subtitle) +
      "</div>" +
      '<div class="mp-mem-search">' +
      icon("search") +
      '<input type="text" data-mp-mem-q placeholder="' +
      esc(V.searchPh) +
      '" aria-label="' +
      esc(V.searchPh) +
      '">' +
      '<span class="mp-mem-modes">' +
      '<button type="button" class="mp-on" data-mp-mode="normal">' +
      esc(V.normal) +
      '</button><button type="button" data-mp-mode="deep">' +
      icon("zap") +
      esc(V.deep) +
      "</button></span>" +
      '<button type="button" class="mp-mem-go" data-mp-mem-go disabled>' +
      icon("search") +
      "<span>" +
      esc(V.searchBtn) +
      "</span></button></div>" +
      '<div class="mp-mem-bar">' +
      '<span class="mp-mem-count">' +
      esc(V.results) +
      " <b data-mp-mem-count></b></span>" +
      '<button type="button" class="mp-mem-refresh" data-mp-mem-refresh aria-label="' +
      esc(V.reset) +
      '">' +
      icon("refresh") +
      "</button>" +
      '<span class="mp-mem-bar-gap"></span>' +
      '<span class="mp-mem-tiers">' +
      tiers +
      "</span>" +
      '<button type="button" class="mp-mem-btn">' +
      icon("sliders") +
      "<span>" +
      esc(V.filterBtn) +
      "</span></button>" +
      '<button type="button" class="mp-mem-btn">' +
      icon("plus") +
      "<span>" +
      esc(V.createBtn) +
      "</span></button>" +
      '<button type="button" class="mp-mem-btn">' +
      icon("listchecks") +
      "<span>" +
      esc(V.selectBtn) +
      "</span></button>" +
      "</div>" +
      '<div data-mp-mem-list></div>' +
      '<div class="mp-mem-pages" data-mp-mem-pages></div>' +
      "</div>"
    );
  }

  function memRowHtml(L, memory, index) {
    var V = L.memView;
    var stars = "";
    for (var s = 1; s <= 5; s++) {
      stars +=
        '<button type="button" class="mp-mem-star' +
        (s <= memory.rating ? " mp-on" : "") +
        '" data-mp-rate="' +
        index +
        ":" +
        s +
        '" aria-label="' +
        esc(V.star) +
        " " +
        s +
        '/5">' +
        icon("star") +
        "</button>";
    }
    var avatar =
      memory.source === L.you
        ? '<span class="mp-mem-avatar">' + icon("user") + "</span>"
        : '<span class="mp-mem-avatar"><b>' +
          esc(memory.source.charAt(0)) +
          "</b></span>";
    var tags = memory.tags
      .map(function (tag) {
        return "<span>" + esc(tag) + "</span>";
      })
      .join("");
    return (
      '<div class="mp-mem-row">' +
      avatar +
      '<div class="mp-mem-row-main">' +
      '<div class="mp-mem-row-title">' +
      esc(memory.title) +
      '</div><div class="mp-mem-row-text">' +
      esc(memory.text) +
      '</div><div class="mp-mem-meta">' +
      icon(UNIT_ICONS[memory.unit] || "info") +
      "<span>" +
      esc(V.units[memory.unit] || memory.unit) +
      "</span><span>" +
      esc(memory.source) +
      "</span><em>•</em><span>" +
      esc(memory.ago) +
      "</span></div>" +
      (tags ? '<div class="mp-mem-tags">' + tags + "</div>" : "") +
      "</div>" +
      '<div class="mp-mem-actions"><span class="mp-mem-stars">' +
      stars +
      '</span><button type="button" class="mp-mem-iconbtn" data-mp-del="' +
      index +
      '" aria-label="' +
      esc(V.del) +
      '">' +
      icon("trash") +
      '</button><button type="button" class="mp-mem-iconbtn' +
      (memory.pinned ? " mp-on" : "") +
      '" data-mp-pin="' +
      index +
      '" aria-label="' +
      esc(V.pin) +
      '">' +
      icon("pin") +
      "</button></div></div>"
    );
  }

  function renderMemList(mount, L, state) {
    var V = L.memView;
    var q = state.mem.q.trim().toLowerCase();
    var rows = [];
    for (var i = 0; i < state.mem.list.length; i++) {
      var memory = state.mem.list[i];
      if (state.mem.tier === "active" && memory.archived) {
        continue;
      }
      if (state.mem.tier === "archived" && !memory.archived) {
        continue;
      }
      if (q) {
        var hay = (
          memory.title +
          " " +
          memory.text +
          " " +
          memory.tags.join(" ") +
          " " +
          memory.source +
          " " +
          (V.units[memory.unit] || "")
        ).toLowerCase();
        var terms = q.split(/\s+/);
        var ok = true;
        for (var t = 0; t < terms.length; t++) {
          if (terms[t] && hay.indexOf(terms[t]) === -1) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          continue;
        }
      }
      rows.push({ memory: memory, idx: i });
    }
    mount.querySelector("[data-mp-mem-list]").innerHTML = rows.length
      ? rows
          .map(function (row) {
            return memRowHtml(L, row.memory, row.idx);
          })
          .join("")
      : '<div class="mp-empty">' + esc(V.empty) + "</div>";
    mount.querySelector("[data-mp-mem-count]").textContent = V.found(rows.length);
    mount.querySelector("[data-mp-mem-pages]").textContent = rows.length
      ? V.pageOf(1, 1) + " · " + V.range(1, rows.length, rows.length)
      : "";
  }

  function threadsPaneHtml(L) {
    var V = L.threadView;
    return (
      '<div class="mp-pane" data-mp-pane="threads" hidden>' +
      '<div class="mp-head"><span class="mp-side-toggle" aria-hidden="true">' +
      icon("panelleft") +
      '</span><h2 class="mp-title">' +
      esc(V.title) +
      '</h2><span class="mp-space-pill">' +
      icon("broadcast") +
      esc(V.badge) +
      "</span></div>" +
      '<div class="mp-subtitle">' +
      esc(V.subtitle) +
      "</div>" +
      '<div class="mp-mem-search">' +
      icon("search") +
      '<input type="text" data-mp-thr-q placeholder="' +
      esc(V.searchPh) +
      '" aria-label="' +
      esc(V.searchPh) +
      '">' +
      '<button type="button" class="mp-thr-go" data-mp-thr-go aria-label="' +
      esc(V.searchPh) +
      '" disabled>' +
      icon("search") +
      "</button>" +
      '<button type="button" class="mp-thr-agent">' +
      icon("scan") +
      "<span>" +
      esc(V.agentSessions) +
      "</span></button></div>" +
      '<div class="mp-mem-bar">' +
      '<button type="button" class="mp-thr-filter">' +
      icon("layers") +
      "<span>" +
      esc(V.allSources) +
      '</span><i class="mp-thr-caret">' +
      icon("chevron") +
      "</i></button>" +
      '<span class="mp-mem-count">' +
      esc(V.results) +
      " <b data-mp-thr-count></b></span>" +
      '<button type="button" class="mp-mem-refresh" data-mp-trefresh aria-label="' +
      esc(V.reset) +
      '">' +
      icon("refresh") +
      "</button>" +
      '<span class="mp-mem-bar-gap"></span>' +
      '<button type="button" class="mp-mem-btn">' +
      icon("upload") +
      "<span>" +
      esc(V.importBtn) +
      "</span></button>" +
      '<button type="button" class="mp-mem-btn">' +
      icon("checksquare") +
      "<span>" +
      esc(V.selectBtn) +
      "</span></button>" +
      "</div>" +
      '<div class="mp-thr-list" data-mp-thr-list></div>' +
      '<div class="mp-mem-pages mp-thr-pages">' +
      "<span data-mp-thr-pagetext></span>" +
      '<span class="mp-thr-pages-right">' +
      '<input type="text" disabled placeholder="' +
      esc(V.jumpPh(1)) +
      '" aria-label="' +
      esc(V.jumpPh(1)) +
      '">' +
      '<button type="button" disabled>' +
      esc(V.go) +
      '</button><button type="button" disabled aria-label="' +
      esc(V.prev) +
      '"><i class="mp-thr-prev">' +
      icon("chevron") +
      '</i></button><button type="button" class="mp-on" disabled>1</button>' +
      '<button type="button" disabled aria-label="' +
      esc(V.next) +
      '">' +
      icon("chevron") +
      "</button></span></div>" +
      "</div>"
    );
  }

  function threadRowHtml(L, thread, index) {
    var V = L.threadView;
    var avatar =
      thread.source === "ai-now"
        ? '<span class="mp-thr-avatar">' + icon("asterisk") + "</span>"
        : '<span class="mp-thr-avatar"><b>' +
          esc(thread.sourceLabel.charAt(0)) +
          "</b></span>";
    var badge = thread.badge
      ? "<em>•</em><span class=\"mp-thr-badge\">" +
        icon("asterisk") +
        esc(thread.badge) +
        "</span>"
      : "";
    return (
      '<div class="mp-thr-row">' +
      avatar +
      '<div class="mp-thr-main">' +
      '<h3 class="mp-thr-title">' +
      esc(thread.title) +
      '</h3><div class="mp-thr-meta">' +
      icon("chatcircle") +
      "<span>" +
      esc(V.messages(thread.messages)) +
      "</span><em>•</em><span>" +
      esc(thread.sourceLabel) +
      "</span>" +
      badge +
      "</div></div>" +
      '<span class="mp-thr-date">' +
      esc(thread.date) +
      '</span><div class="mp-thr-actions">' +
      '<button type="button" class="mp-thr-iconbtn mp-thr-copy" data-mp-tcopy="' +
      index +
      '" aria-label="' +
      esc(V.copyRef) +
      '">' +
      icon("copy") +
      '</button><button type="button" class="mp-thr-iconbtn" data-mp-tdel="' +
      index +
      '" aria-label="' +
      esc(L.memView.del) +
      '">' +
      icon("trash") +
      '</button><button type="button" class="mp-thr-iconbtn' +
      (thread.pinned ? " mp-on" : "") +
      '" data-mp-tpin="' +
      index +
      '" aria-label="' +
      esc(L.memView.pin) +
      '">' +
      icon("pin") +
      "</button></div></div>"
    );
  }

  function renderThreadList(mount, L, state) {
    var V = L.threadView;
    var q = state.threads.q.trim().toLowerCase();
    var rows = [];
    for (var i = 0; i < state.threads.list.length; i++) {
      var thread = state.threads.list[i];
      if (q) {
        var hay = (
          thread.title +
          " " +
          thread.sourceLabel +
          " " +
          thread.source +
          " " +
          (thread.badge || "")
        ).toLowerCase();
        var terms = q.split(/\s+/);
        var ok = true;
        for (var t = 0; t < terms.length; t++) {
          if (terms[t] && hay.indexOf(terms[t]) === -1) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          continue;
        }
      }
      rows.push({ thread: thread, idx: i });
    }
    mount.querySelector("[data-mp-thr-list]").innerHTML = rows.length
      ? rows
          .map(function (row) {
            return threadRowHtml(L, row.thread, row.idx);
          })
          .join("")
      : '<div class="mp-thr-empty"><b>' +
        esc(V.emptyTitle) +
        "</b><span>" +
        esc(V.emptyHint) +
        "</span></div>";
    mount.querySelector("[data-mp-thr-count]").textContent = V.found(rows.length);
    mount.querySelector("[data-mp-thr-pagetext]").textContent = rows.length
      ? V.pageOf(1, 1) + " · " + V.range(1, rows.length, rows.length)
      : "";
  }

  /* --- Library view --------------------------------------------------------- */

  function libPaneHtml(L) {
    var V = L.libView;
    return (
      '<div class="mp-pane" data-mp-pane="library" hidden>' +
      '<div class="mp-head"><span class="mp-side-toggle" aria-hidden="true">' +
      icon("panelleft") +
      '</span><h2 class="mp-title">' +
      esc(V.title) +
      '</h2><span class="mp-space-pill">' +
      icon("broadcast") +
      esc(V.badge) +
      "</span></div>" +
      '<div class="mp-subtitle">' +
      esc(V.subtitle) +
      "</div>" +
      '<div class="mp-mem-bar">' +
      '<span class="mp-mem-bar-gap"></span>' +
      '<button type="button" class="mp-mem-btn" data-mp-lib-import>' +
      icon("upload") +
      "<span>" +
      esc(V.importBtn) +
      "</span></button>" +
      "</div>" +
      '<div data-mp-lib-list></div>' +
      "</div>"
    );
  }

  function libRowHtml(L, doc) {
    var V = L.libView;
    var indexing = doc.status !== "indexed";
    return (
      '<div class="mp-thr-row mp-lib-row">' +
      '<span class="mp-thr-avatar mp-lib-icon">' +
      icon("note") +
      "</span>" +
      '<div class="mp-thr-main">' +
      '<h3 class="mp-thr-title">' +
      esc(doc.name) +
      '</h3><div class="mp-thr-meta">' +
      icon("library") +
      "<span>" +
      esc(doc.kind) +
      "</span><em>•</em><span>" +
      esc(doc.size) +
      "</span></div></div>" +
      '<span class="mp-lib-status' +
      (indexing ? " mp-lib-indexing" : "") +
      '" data-mp-lib-status="' +
      (indexing ? "indexing" : "indexed") +
      '">' +
      esc(indexing ? V.indexing : V.indexed) +
      "</span></div>"
    );
  }

  function renderLibList(mount, L, state) {
    mount.querySelector("[data-mp-lib-list]").innerHTML = state.library.list
      .map(function (doc) {
        return libRowHtml(L, doc);
      })
      .join("");
  }

  /* --- Mount and wire -------------------------------------------------------- */

  function init(mount) {
    if (mount.hasAttribute(INIT_ATTR)) {
      return;
    }
    mount.setAttribute(INIT_ATTR, "1");

    var L = isZh() ? LOCALES.zh : LOCALES.en;
    var state = {
      view: "timeline",
      filter: "all",
      memories: L.memories.slice(),
      events: L.events.slice(),
      counts: {
        memories: L.counts.memories,
        distilled: L.counts.distilled,
        topics: L.counts.topics,
        clusters: L.counts.clusters,
      },
      todayLevel: 2,
      answer: null,
      mem: {
        q: "",
        mode: "normal",
        tier: "active",
        list: L.memList.map(function (memory) {
          return {
            title: memory.title,
            text: memory.text,
            unit: memory.unit,
            source: memory.source,
            ago: memory.ago,
            rating: memory.rating || 0,
            tags: memory.tags.slice(),
            pinned: !!memory.pinned,
            archived: !!memory.archived,
          };
        }),
      },
      threads: {
        q: "",
        list: L.threadList.map(function (thread) {
          return {
            title: thread.title,
            source: thread.source,
            sourceLabel: thread.sourceLabel,
            badge: thread.badge || "",
            messages: thread.messages,
            date: thread.date,
            pinned: !!thread.pinned,
          };
        }),
      },
      library: {
        imported: false,
        list: L.libList.map(function (doc) {
          return {
            name: doc.name,
            kind: doc.kind,
            size: doc.size,
            page: doc.page,
            excerpt: doc.excerpt,
            tags: doc.tags.slice(),
            status: "indexed",
          };
        }),
      },
    };

    mount.innerHTML = renderShell(L);

    var input = mount.querySelector("[data-mp-input]");
    var send = mount.querySelector("[data-mp-send]");

    function submit() {
      var text = input.value.trim();
      if (!text) {
        return;
      }
      // 粘贴文件链接或文档名（.pdf/.md 等）视为导入资料：进入 Library，
      // 先显示索引中，片刻后可被提问引用——与真实应用的流水线一致。
      var isDocument =
        /^https?:\/\/\S+/i.test(text) ||
        /\.(pdf|md|markdown|txt|docx?)\b/i.test(text);
      if (isDocument && !/[?？]\s*$/.test(text)) {
        var doc = {
          name: L.libView.importDoc.name,
          kind: L.libView.importDoc.kind,
          size: L.libView.importDoc.size,
          page: L.libView.importDoc.page,
          excerpt: L.libView.importDoc.excerpt,
          tags: L.libView.importDoc.tags.slice(),
          status: "indexing",
        };
        state.library.list.unshift(doc);
        state.events.unshift({
          day: "today",
          time: nowHM(),
          title: L.libView.importEvent,
          sub: doc.name,
        });
        state.answer = null;
        input.value = "";
        send.disabled = true;
        rerenderAll();
        renderLibList(mount, L, state);
        var docMain = mount.querySelector(".mp-main");
        if (docMain) {
          docMain.scrollTop = 0;
        }
        setTimeout(function () {
          doc.status = "indexed";
          renderLibList(mount, L, state);
        }, 2500);
        return;
      }
      // 与真实应用一致：输入框不做模式切换，以 ? 结尾的内容视为提问
      if (!/[?？]\s*$/.test(text)) {
        state.memories.unshift({
          day: "today",
          time: nowHM(),
          source: L.you,
          text: text,
          tags: [],
        });
        state.mem.list.unshift({
          title: text.length > 40 ? text.slice(0, 40) + "…" : text,
          text: text,
          unit: "fact",
          source: L.you,
          ago: L.memView.justNow,
          rating: 0,
          tags: [],
          pinned: false,
          archived: false,
        });
        state.events.unshift({ day: "today", time: nowHM(), title: L.savedEvent });
        state.counts.memories += 1;
        state.todayLevel = Math.min(4, state.todayLevel + 1);
        state.answer = null;
        input.value = "";
        send.disabled = true;
        rerenderAll();
        var main = mount.querySelector(".mp-main");
        if (main) {
          main.scrollTop = 0;
        }
      } else {
        state.answer = {
          query: text,
          matches: searchMemories(state.memories, text),
          docs: searchDocuments(state.library.list, text),
        };
        renderAnswer(mount, L, state);
      }
    }

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }
      event.preventDefault();
      submit();
    });

    input.addEventListener("input", function () {
      send.disabled = !input.value.trim();
    });

    function setView(view) {
      state.view = view;
      var panes = mount.querySelectorAll("[data-mp-pane]");
      for (var i = 0; i < panes.length; i++) {
        panes[i].hidden = panes[i].getAttribute("data-mp-pane") !== view;
      }
      var rail = mount.querySelector("[data-mp-rail-right]");
      if (rail) {
        rail.hidden = view !== "timeline";
      }
      var shell = mount.querySelector(".mp-shell");
      if (shell) {
        shell.classList.toggle("mp-norail", view !== "timeline");
      }
      var navs = mount.querySelectorAll("[data-mp-view]");
      for (var j = 0; j < navs.length; j++) {
        navs[j].classList.toggle(
          "mp-active",
          navs[j].getAttribute("data-mp-view") === view
        );
      }
      if (view === "memories") {
        renderMemList(mount, L, state);
      }
      if (view === "threads") {
        renderThreadList(mount, L, state);
      }
      if (view === "library") {
        renderLibList(mount, L, state);
      }
      var main = mount.querySelector(".mp-main");
      if (main) {
        main.scrollTop = 0;
      }
    }

    var memQ = mount.querySelector("[data-mp-mem-q]");
    var memGo = mount.querySelector("[data-mp-mem-go]");

    memQ.addEventListener("input", function () {
      state.mem.q = memQ.value;
      memGo.disabled = !memQ.value.trim();
      renderMemList(mount, L, state);
    });

    memQ.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        state.mem.q = memQ.value;
        renderMemList(mount, L, state);
      }
    });

    var thrQ = mount.querySelector("[data-mp-thr-q]");
    var thrGo = mount.querySelector("[data-mp-thr-go]");

    thrQ.addEventListener("input", function () {
      state.threads.q = thrQ.value;
      thrGo.disabled = !thrQ.value.trim();
      renderThreadList(mount, L, state);
    });

    thrQ.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        state.threads.q = thrQ.value;
        renderThreadList(mount, L, state);
      }
    });

    mount.addEventListener("click", function (event) {
      var target = event.target.closest
        ? event.target.closest(
            "[data-mp-filter], [data-mp-close], [data-mp-send], [data-mp-view], [data-mp-mode], [data-mp-tier], [data-mp-mem-go], [data-mp-mem-refresh], [data-mp-rate], [data-mp-pin], [data-mp-del], [data-mp-thr-go], [data-mp-trefresh], [data-mp-tcopy], [data-mp-tpin], [data-mp-tdel], [data-mp-lib-import]"
          )
        : null;
      if (!target || !mount.contains(target)) {
        return;
      }
      if (target.hasAttribute("data-mp-send")) {
        if (!target.disabled) {
          submit();
        }
        return;
      }
      if (target.hasAttribute("data-mp-close")) {
        state.answer = null;
        renderAnswer(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-filter")) {
        state.filter = target.getAttribute("data-mp-filter");
        var tabs = mount.querySelectorAll("[data-mp-filter]");
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.toggle("mp-on", tabs[j] === target);
        }
        renderTimeline(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-view")) {
        setView(target.getAttribute("data-mp-view"));
        return;
      }
      if (target.hasAttribute("data-mp-mode")) {
        state.mem.mode = target.getAttribute("data-mp-mode");
        var modes = mount.querySelectorAll("[data-mp-mode]");
        for (var m = 0; m < modes.length; m++) {
          modes[m].classList.toggle("mp-on", modes[m] === target);
        }
        return;
      }
      if (target.hasAttribute("data-mp-tier")) {
        state.mem.tier = target.getAttribute("data-mp-tier");
        var tiers = mount.querySelectorAll("[data-mp-tier]");
        for (var k = 0; k < tiers.length; k++) {
          tiers[k].classList.toggle("mp-on", tiers[k] === target);
        }
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-mem-go")) {
        if (!target.disabled) {
          state.mem.q = memQ.value;
          renderMemList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-mem-refresh")) {
        state.mem.q = "";
        state.mem.mode = "normal";
        state.mem.tier = "active";
        memQ.value = "";
        memGo.disabled = true;
        var modeBtns = mount.querySelectorAll("[data-mp-mode]");
        for (var n = 0; n < modeBtns.length; n++) {
          modeBtns[n].classList.toggle(
            "mp-on",
            modeBtns[n].getAttribute("data-mp-mode") === "normal"
          );
        }
        var tierBtns = mount.querySelectorAll("[data-mp-tier]");
        for (var p = 0; p < tierBtns.length; p++) {
          tierBtns[p].classList.toggle(
            "mp-on",
            tierBtns[p].getAttribute("data-mp-tier") === "active"
          );
        }
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-rate")) {
        var parts = target.getAttribute("data-mp-rate").split(":");
        var rowIdx = Number(parts[0]);
        var star = Number(parts[1]);
        var rated = state.mem.list[rowIdx];
        if (rated) {
          rated.rating = rated.rating === star ? 0 : star;
          renderMemList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-pin")) {
        var pinnedRow = state.mem.list[Number(target.getAttribute("data-mp-pin"))];
        if (pinnedRow) {
          pinnedRow.pinned = !pinnedRow.pinned;
          target.classList.toggle("mp-on", pinnedRow.pinned);
        }
        return;
      }
      if (target.hasAttribute("data-mp-del")) {
        state.mem.list.splice(Number(target.getAttribute("data-mp-del")), 1);
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-thr-go")) {
        if (!target.disabled) {
          state.threads.q = thrQ.value;
          renderThreadList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-trefresh")) {
        state.threads.q = "";
        thrQ.value = "";
        thrGo.disabled = true;
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-tcopy")) {
        if (target.classList.contains("mp-copied")) {
          return;
        }
        var threadIndex = Number(target.getAttribute("data-mp-tcopy"));
        var copiedThread = state.threads.list[threadIndex];
        if (!copiedThread) return;
        copyText("nowledgemem://thread/demo-" + (threadIndex + 1))
          .then(function () {
            target.classList.add("mp-copied");
            target.innerHTML = icon("check");
            target.setAttribute("aria-label", L.threadView.copied);
            setTimeout(function () {
              if (!target.isConnected) return;
              target.classList.remove("mp-copied");
              target.innerHTML = icon("copy");
              target.setAttribute("aria-label", L.threadView.copyRef);
            }, 1200);
          })
          .catch(function () {
            target.setAttribute("aria-label", L.threadView.copyFailed);
          });
        return;
      }
      if (target.hasAttribute("data-mp-tpin")) {
        var pinnedThread =
          state.threads.list[Number(target.getAttribute("data-mp-tpin"))];
        if (pinnedThread) {
          pinnedThread.pinned = !pinnedThread.pinned;
          target.classList.toggle("mp-on", pinnedThread.pinned);
        }
        return;
      }
      if (target.hasAttribute("data-mp-tdel")) {
        state.threads.list.splice(Number(target.getAttribute("data-mp-tdel")), 1);
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-lib-import")) {
        // Import the sample document: it lands as "indexing" and flips to
        // searchable a moment later, like the real app's pipeline.
        if (state.library.imported) {
          return;
        }
        state.library.imported = true;
        var doc = {
          name: L.libView.importDoc.name,
          kind: L.libView.importDoc.kind,
          size: L.libView.importDoc.size,
          page: L.libView.importDoc.page,
          excerpt: L.libView.importDoc.excerpt,
          tags: L.libView.importDoc.tags.slice(),
          status: "indexing",
        };
        state.library.list.unshift(doc);
        renderLibList(mount, L, state);
        setTimeout(function () {
          doc.status = "indexed";
          renderLibList(mount, L, state);
        }, 2500);
        return;
      }
    });

    function rerenderAll() {
      renderTimeline(mount, L, state);
      renderStats(mount, L, state);
      renderCalendar(mount, L, state);
      renderSideEvents(mount, L, state);
      renderAnswer(mount, L, state);
    }

    rerenderAll();
  }

  function scan() {
    var mounts = document.querySelectorAll("[" + MOUNT_ATTR + "]");
    for (var i = 0; i < mounts.length; i++) {
      init(mounts[i]);
    }
  }

  function scheduleScan() {
    if (scanTimer) {
      return;
    }
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scan();
    }, SCAN_DEBOUNCE_MS);
  }

  function boot() {
    // 初始扫描推迟到页面完成加载之后，避免在 React 挂载中途改 DOM。
    setTimeout(function () {
      scan();
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }, DEFER_MS);
  }

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot, { once: true });
  }

  var observer = new MutationObserver(function () {
    scheduleScan();
  });
})();
