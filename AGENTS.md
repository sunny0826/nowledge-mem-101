# Nowledge Mem 101 documentation instructions

## Project purpose

- This repository contains **Nowledge Mem 101**, a hands-on tutorial for people who use AI tools and want their existing knowledge to be reusable across those tools.
- The tutorial teaches by asking readers to complete real tasks in Nowledge Mem. It starts with the core `Capture → Recall` loop and will later cover `Connect → Reuse`.
- This site complements the [full Nowledge Mem documentation](https://mem.nowledge.co/docs). Keep feature reference material in the full docs and use this site for short, outcome-focused lessons.
- The site is bilingual. English pages live at the repository root. Simplified Chinese pages mirror them under `zh/`.

## Site structure

- `docs.json` defines the Mintlify site, language navigation, branding, and global links.
- `index.mdx` and `zh/index.mdx` are the English and Chinese landing pages.
- `essentials/` and `zh/essentials/` contain the beginner course. `ai-workflow/` and `zh/ai-workflow/` contain the intermediate AI Workflow course (index plus the lessons published so far); its unpublished lessons stay in `drafts/ai-workflow/`.
- `custom.css`, `mem-video-loading.css`, and `mem-video-loading.js` provide site-specific presentation and demo video embed behavior (loading state, 16:9 frame, and a fallback link).
- `playground.css` and `playground.js` at the repository root implement the Playground component: a pure front-end replica of the Mem app UI (Timeline with capture and Q&A recall, Memories, Threads, and a Library view; pasting a document link (URL or file name with an extension) into the Timeline input imports it into the Library, where it flips from `indexing` to `indexed` after ~2.5s and becomes citable in Timeline answers). Keep the component unchanged by course needs; course-specific guidance lives outside it.
- `course-playground-guide.js` at the repository root is the course-side guide for the Essentials lessons that embed the simulation (currently Essentials `first-memory.mdx`, `recall-memory.mdx`, `add-a-document.mdx`, and `save-ai-conversation.mdx`, plus `ai-workflow/create-a-work-brief.mdx`, both locales). The course root picks a flow with `data-course-guide-scenario`, mapped to Playground controls by the `SCENARIOS` table in the script: `save` (default; Timeline nav → type → send, completion when the input clears), `recall` (type a question → send, completion when the answer card appears), `threads` (Threads nav → search → press Enter or the search button, completion with a non-empty query), `save-ask` (save a work brief → ask Mem to find it; the brief send is a mid-flow send that advances when the input clears, the question send completes on the answer card), and `library` (paste a document link into the Timeline input → send to import it → ask a question about it in Timeline → send → open Library, where the imported document is the changed row; completion is the final nav click). Fill values can be per-step via `data-course-guide-fillable-N`. Each scenario names its fill-button step, its completion mode (`cleared`/`answer`/`query`), and its changed element (`data-course-guide-changed` on the new timeline entry, the `.mp-answer` card, or the found thread row); the changed-step hint lives in `data-course-guide-hint-(steps+1)`. Lessons whose workflow happens outside the Mem UI the replica shows (AI-tool connections, lessons 5 and 6) do not get a simulation — never invent one. Shared behavior: it opens the Playground window on demand, marks the current step's matching Playground control with a pulsing ring (`data-course-guide-target`) plus a floating hint pill (`course-playground-hint`, localized via the root's `data-course-guide-hint-N` attributes), puts the one-click fill button inside the fill step's hint (`data-course-guide-fillable`/`data-course-guide-fill-label` on the root), and only the red titlebar dot is interactive (close); the yellow and green dots are decorative (`aria-hidden`, no role) — do not wire minimize or maximize to them. The minimized state, if ever triggered programmatically, slides the window away and leaves an icon-only circular button `.course-playground-mini` on the right edge to restore it; the close glyph appears on hover via CSS `::after` (the content rule needs the `.mp-dots` ancestor for specificity). The dot colors come from the `--course-dot-*` variables. Step changes in the simulation also scroll the article to the matching course step (`render` compares `renderedStep`). While the window is docked it collapses the docs sidebar (`html[data-course-playground-docked]` hides `#sidebar`) and restores it on close or minimize. The simulation is desktop-only: below 1024px the launch button, status lines, window, mini chip, and hint are all hidden and the launch click is a no-op — never enable the Playground popup on mobile. Lesson steps describe the real app only; simulation guidance lives exclusively inside the popup (hint bubbles, fill button, completion dialog). After the send step it flashes the newly saved timeline entry (`data-course-guide-changed`) and shows a completion dialog (`course-playground-done`) 5 seconds later with an "Open Nowledge Mem" button and a confirm button, both localized via root attributes; only the open button closes the simulation, the confirm button just dismisses the dialog so the learner can keep practising. The open button first tries the desktop app through its `nowledgemem://` URL scheme (registered on macOS and Windows) and falls back to opening `data-course-guide-mem-url` in a new tab only when the app does not take focus. The hint content is cached by key — rebuilding the hint between mousedown and mouseup would swap the fill button node and swallow clicks. On wide screens it docks the window beside the steps (shifting and narrowing `#content` via margins); on narrower desktop it overlays from the right, and below 1024px the simulation UI is hidden entirely. The window, hint, and dialog live under `<body>` at runtime. It must not inject nodes into the Playground or alter its save logic. Bump the `?v=` query on its `<script>` tag in every lesson page that loads it when the script changes.
- `snippets/playground.mdx` is the embeddable Playground mount point and loads the root assets.
- `drafts/playground/` and `drafts/zh/playground/` hold the unpublished demo pages that host the component. Preview them locally with `just playground`; the draft preview copies the root Playground assets into its temporary root.
- `drafts/` and `drafts/zh/` hold unpublished lessons; `scripts/preview-drafts.mjs` (run with `just drafts`) renders them at their final site paths in a temporary copy of the repo. In the preview, a draft course that already has a published tab in `docs.json` (a mixed course) merges its draft pages into that same tab ordered by lesson number instead of creating a second "(draft)" tab; only courses with no published counterpart get a separate "(draft)" tab. Draft files merge over the published directory, so published pages the draft does not provide stay available in the preview. When a draft lesson belongs to a mixed course, mark it in the sidebar with a frontmatter `tag` — `tag: "Draft"` in English, `tag: "草稿"` in Chinese — so it is distinguishable from the published lessons in the TOC. Do not tag pages of fully-draft courses (their tab label already says "(draft)"), and do not add a `drafts/<course>/index.mdx` for a mixed course to give it an overview; the published index stays. Remove the draft `tag` when promoting the lesson.
- Static assets belong in the existing purpose-specific directories such as `logo/` and `cover-image/`. Use descriptive, kebab-case names for new assets.
- `prompts/` contains production prompts and is not published tutorial content unless it is added to `docs.json`.

## Source of truth and research

- Read `docs.json` and two or three nearby pages before changing content or navigation.
- Treat the current product UI and the full Nowledge Mem documentation as the source of truth for product behavior. Do not infer unsupported behavior from existing tutorial copy.
- Consult the current [Mintlify documentation](https://www.mintlify.com/docs) for components, configuration, and MDX behavior. Prefer built-in Mintlify components over custom markup when they meet the need.
- Use the Mintlify MCP server at `https://mcp.mintlify.com` for repository content or settings when it is configured. Use the Mintlify docs MCP server at `https://www.mintlify.com/docs/mcp` for current platform guidance when it is configured.
- Preserve existing custom components and CSS classes when editing a page unless the task explicitly includes a redesign.

## Product terminology

- Use **Nowledge Mem** on first mention on a page. Use **Mem** afterward.
- Use **memory** for an item saved in Mem. In Chinese, use **记忆** or **一条记忆** according to the sentence.
- Treat **Timeline** as a product UI label. Keep it in English in both locales.
- Use **AI tool** for products such as Codex, Claude Code, and Cursor. Do not imply that these tools share context unless they are connected to Mem.
- Preserve the learning model and its capitalization: **Capture → Recall → Connect → Reuse**. In Chinese diagrams or explanatory copy, use **Capture 留下 → Recall 找回 → Connect 连接 AI → Reuse 复用**.
- Use **full docs** or **Nowledge Mem Docs** for `mem.nowledge.co/docs`. Do not call this tutorial the full product documentation.
- Use **lesson** for a single course unit and **course** for a sequence of lessons. Translate them as **课** and **课程** in Chinese.

## Writing style

- Use active voice and address the reader as **you**. In Chinese, prefer direct instructions and omit **你** when the meaning remains clear.
- Keep sentences concise and focused on one idea.
- Use sentence case for English headings. Use natural Chinese headings rather than literal word-for-word translations.
- Lead with the learner's outcome. Explain only the context needed to complete the task.
- Use real, plausible examples. Avoid placeholders such as `foo`, `bar`, or generic lorem ipsum.
- Keep the tone practical and encouraging. Avoid marketing claims, filler, emoji, decorative formatting, and words such as “powerful,” “seamless,” “simply,” or “obviously.”
- Bold exact UI controls and menu labels, for example: Click **Settings**.
- Use code formatting for file names, commands, paths, configuration keys, and code references.
- Give every fenced code block a language identifier. Use `text` for sample memories and prompts.
- Give images and other visual media descriptive alt text. Do not use media as the only way to convey required instructions.
- Use `→` consistently for the learning loop and forward progression. Do not substitute hyphens or ASCII arrows.

## Lesson structure

- Keep lessons short and action-oriented. A lesson should produce one observable learner outcome.
- Follow the established sequence when it fits the content: lesson metadata, brief context, **What you'll accomplish**, demonstration, **Your turn**, expected result, why it matters, optional deeper reading, and the next lesson.
- Use `<Steps>` for ordered procedures, `<Check>` for outcomes or success states, `<Tip>` for optional advice, and `<Note>` for non-critical context. Use `<Warning>` only when an action has meaningful risk.
- Put prerequisites before the procedure.
- Distinguish available lessons from planned lessons. Label unreleased material **Coming soon** or **即将上线** and do not link to nonexistent pages.
- Keep lesson numbers, duration estimates, availability, previous/next links, course cards, and navigation entries consistent across the site.

## Visual style

- The site uses a restrained Notion Help Center style system defined in `custom.css` (see the reference note at the top of that file). Reuse its existing classes before adding new ones, and keep all custom styling in `custom.css`.
- Palette values live in the `--course-*` CSS variables, which have separate light and dark values under `html.dark`. Never hardcode colors in MDX or new CSS rules; use the variables so both color modes stay correct.
- The course style scope covers `/essentials`, `/essentials/*`, `/zh/essentials`, `/zh/essentials/*`, `/ai-workflow`, `/ai-workflow/*`, `/zh/ai-workflow`, and `/zh/ai-workflow/*` path prefixes. Page content on these paths is capped at 42rem by the scoped `#content` selectors in `custom.css`; add new course paths to those selectors.
- Every Essentials page opens with a `.course-meta` row, not `<Badge>` pills. One icon per token type: `book-open` for lesson position or count, `clock-3` for duration, `user-round` for level.

  ```mdx
  <div className="course-meta" aria-label="Lesson information">
    <span><Icon icon="book-open" /> Essentials · Lesson 1 / 6</span>
    <span><Icon icon="clock-3" /> ~3 min</span>
    <span><Icon icon="user-round" /> Beginner</span>
  </div>
  ```

  Chinese pages use `aria-label="课程信息"` and natural tokens such as `第 1 课 / 共 6 课`, `约 3 分钟`, and `入门`.
- Do not use Mintlify `<Badge>` on Essentials pages.
- These classes are overview-only: `.course-intro`, `.course-cta`, `.learning-stages`, `.course-grid`, and `.course-card*`. Do not reuse them inside lesson bodies.
- Render course-level progression sequences (the Capture → Recall → Connect → Reuse loop, a course's workflow stages, and similar step flows) with the `.learning-stages` component, not a fenced `text` code block. One `.learning-stage` per step; mark the stage of the first available lesson with `.learning-stage-active`. The grid auto-sizes to the stage count — do not hardcode a column count. Localize the `aria-label` (`Learning stages`, `Workflow stages`, `学习阶段`, `工作流程`).
- End an available lesson's **Next lesson** section with `<Card title="..." horizontal href="...">`, which the global `.card` rules restyle to match the course cards. When the next lesson is not yet available, use the muted status line instead of a link or badge:

  ```mdx
  <p className="course-status-line"><i aria-hidden="true"></i>Coming soon</p>
  ```

  Chinese pages render `即将上线` with the same markup.
- Course cards have two states: `.course-card-featured` is an `<a>` linking to an available lesson; `.course-card-upcoming` is a non-link `<div>` labeled **Coming soon** or **即将上线**. A card's state must match the target lesson's availability.

## Demo videos

- Every Essentials lesson embeds a demo video in a **Watch how it's done** section (Chinese: **看看怎么做**), placed between **What you'll accomplish** and **Your turn**. English lessons embed a YouTube video; Chinese lessons embed a bilibili video.
- Use the exact iframe format from the existing lessons: `https://` URL, `&autoplay=0`, a descriptive `title`, and `allowfullscreen="true"`. Do not add attributes such as `scrolling`, `border`, `frameborder`, or `framespacing`.

  English (YouTube):

  ```html
  <iframe src="https://www.youtube.com/embed/<video-id>?autoplay=0" title="Demo: ..." allowfullscreen="true"></iframe>
  ```

  Chinese (bilibili):

  ```html
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=<aid>&bvid=<bvid>&cid=<cid>&p=1&autoplay=0" title="演示：..." allowfullscreen="true"></iframe>
  ```

- The English and Chinese versions of a page use their own video source (YouTube for English, bilibili for Chinese). Localize only the `title` attribute: `Demo: ...` in English, `演示：...` in Chinese.
- `mem-video-loading.js` automatically wraps lesson video iframes (bilibili or YouTube) with a 16:9 frame, loading state, and a fallback link, so no extra markup is needed around the iframe.
- Do not invent a video URL. If the demo video is not ready, leave a `{/* TODO: ... */}` comment where the iframe will go and keep the lesson's availability state consistent with the missing video.

## Localization

- When changing reader-facing content, update the corresponding English and Simplified Chinese pages in the same change unless the task explicitly targets one locale.
- Preserve the same meaning, lesson order, links, examples, component structure, and availability state across locales.
- Localize prose naturally. Do not translate product names, UI labels, commands, code, URLs, or file paths unless the product itself localizes them.
- Use locale-specific internal links: English pages link to root paths such as `/essentials/first-memory`; Chinese pages link to `/zh/...`.
- Use the localized full-docs URL when available: `https://mem.nowledge.co/docs` for English and `https://mem.nowledge.co/zh/docs` for Chinese.
- Keep course metadata internally consistent. English may use `Beginner`, `lessons`, and `min`; Chinese should use natural equivalents such as `入门`, `课`, and `分钟`.

## MDX and navigation

- Every published `.mdx` page must start with valid YAML frontmatter containing at least `title` and `description`. Use `sidebarTitle` and a Lucide `icon` when the surrounding pages do.
- Use kebab-case for new page file names.
- Use root-relative internal links without `.mdx` extensions. Do not use `../` links.
- Add every discoverable new page to the correct English and Chinese navigation branches in `docs.json`. A page omitted from navigation is still publicly reachable, so omission is not access control.
- Check that card links, previous/next links, footer links, and navigation paths resolve to the intended locale.
- Keep JSX tags balanced and use valid MDX. Avoid adding raw HTML when a Mintlify component or existing site pattern is sufficient.
- Store reusable content in a snippet only when the same content must remain identical in more than one place. Prefer separate localized prose for translations.

## Content boundaries

- Document public, learner-facing Nowledge Mem workflows only.
- Do not document internal administration, unreleased implementation details, private infrastructure, credentials, analytics, or operational procedures.
- Do not present planned lessons or features as available.
- Do not invent UI labels, product behavior, compatibility claims, timing estimates, or supported integrations. Verify them or state the uncertainty to the user.
- Do not duplicate long feature-reference explanations from the full docs. Link to the relevant full-docs page under **Go deeper** or **深入了解**.
- Never add secrets, personal data, or real private memories to examples, screenshots, prompts, or repository files.

## Validation

- Review the diff for unintended changes and confirm English/Chinese parity.
- Run `mint validate` after changes to MDX or `docs.json`.
- Run `mint broken-links` after changing pages, navigation, or links.
- Run `mint a11y` after changing content, components, or media.
- If the Mintlify CLI is unavailable, report which checks could not run. Do not claim validation succeeded without running it.
- For visual or layout changes, run `mint dev` and inspect the affected pages in both desktop and mobile widths, in both locales and both color modes when applicable.

## Pull requests

- Write pull requests in English: the PR title, the PR description, and commit messages must use English.
- Keep each pull request focused on a single task, and review the diff for unintended changes before opening it.
