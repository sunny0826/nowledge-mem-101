# Nowledge Mem 101 documentation instructions

## Project purpose

- This repository contains **Nowledge Mem 101**, a hands-on tutorial for people who use AI tools and want their existing knowledge to be reusable across those tools.
- The tutorial teaches by asking readers to complete real tasks in Nowledge Mem. It starts with the core `Capture → Recall` loop and will later cover `Connect → Reuse`.
- This site complements the [full Nowledge Mem documentation](https://mem.nowledge.co/docs). Keep feature reference material in the full docs and use this site for short, outcome-focused lessons.
- The site is bilingual. English pages live at the repository root. Simplified Chinese pages mirror them under `zh/`.

## Site structure

- `docs.json` defines the Mintlify site, language navigation, branding, and global links.
- `index.mdx` and `zh/index.mdx` are the English and Chinese landing pages.
- `essentials/` and `zh/essentials/` contain the beginner course.
- `custom.css`, `mem-video-loading.css`, and `mem-video-loading.js` provide site-specific presentation and bilibili video embed behavior (loading state, 16:9 frame, and a fallback link).
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
- For visual or layout changes, run `mint dev` and inspect the affected pages in both desktop and mobile widths, in both locales when applicable.
