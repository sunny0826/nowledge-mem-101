# Nowledge Mem 101 documentation instructions

## Purpose and source of truth

- Teach public, learner-facing Nowledge Mem workflows through short lessons with observable outcomes. This is a hands-on tutorial, not the full product reference.
- Preserve the learning model: **Capture → Recall → Connect → Reuse**; in Chinese diagrams, **Capture 留下 → Recall 找回 → Connect 连接 AI → Reuse 复用**. Check the current pages and navigation for lesson availability.
- Use current product UI and [Nowledge Mem Docs](https://mem.nowledge.co/docs) for product behavior. Do not infer capabilities from tutorial copy or the Playground simulation.
- Use Nowledge memories and prior tasks to recover decisions and reasons. Verify current behavior, paths, and publication state against repository files and current docs before applying an old memory; do not restore superseded UI behavior.
- Document no internal administration, private infrastructure, credentials, analytics, or operational procedures in learner-facing pages. Never add secrets, personal data, or real private memories to examples, recordings, or repository files.

## Repository map

- `docs.json`: branding and bilingual navigation. English pages live at the root; Chinese pages mirror them under `zh/`.
- `essentials/`, `ai-workflow/`, and `ai-now/`: published courses. AI Now is available as five guided interactive lessons; videos are not required for this course. `drafts/` and `drafts/zh/`: unpublished additions, including Knowledge System and Playground host pages. `.mintignore` excludes drafts from publication and root-level checks.
- `custom.css`: shared presentation and course tokens. `mem-video-loading.js` and `.css`: video frames, loading states, and fallback links.
- Root `playground.js`, `playground-ai-now.js`, and `playground.css`: shared simulated app. `course-playground-guide.js`: course-side guidance. `snippets/playground.mdx`: mount point. Demo host pages remain under `drafts/playground/` and `drafts/zh/playground/`.
- `scripts/preview-drafts.mjs`: merged draft preview and checks. `prompts/`: production material, not tutorial pages.
- Reuse purpose-specific asset directories such as `logo/` and `cover-image/`; use descriptive kebab-case names.

## Task routing

- For course writing, localization, video scripts, publication changes, or course UI, use [.agents/skills/nowledge-course/SKILL.md](.agents/skills/nowledge-course/SKILL.md). Read only the references needed for the change.
- Use [.agents/skills/mintlify/SKILL.md](.agents/skills/mintlify/SKILL.md) for Mintlify platform mechanics. Project rules here take precedence over generic skill examples, including navigation, asset paths, and validation.
- Prefer configured MCP tools; distinguish content/settings tools at `https://mcp.mintlify.com` from platform-doc retrieval at `https://www.mintlify.com/docs/mcp`. If unavailable, read current official documentation directly. For ordinary editing, do not run `mint index`, install packages globally, or change AI-tool configuration; those belong to a requested setup task.
- Use [.agents/skills/mintlify-api/SKILL.md](.agents/skills/mintlify-api/SKILL.md) only for deployment/status API work. Local editing or validation is not authorization to deploy remotely.
- Before editing content or navigation, read `docs.json` and two or three relevant pages. For configuration, components, and MDX behavior, consult the relevant current [Mintlify docs](https://www.mintlify.com/docs); avoid repeating unrelated research for a wording-only edit.

## Writing and localization

- Use **Nowledge Mem** on first mention, **Mem** afterward; **memory** / **记忆** for a saved item; **AI tool** for connected products; **lesson** / **课** and **course** / **课程**. Keep **Timeline** and exact product UI labels untranslated.
- Use **full docs** or **Nowledge Mem Docs** for the product reference. Link to `https://mem.nowledge.co/docs` in English and `https://mem.nowledge.co/zh/docs` in Chinese.
- Update English and Chinese course pages together unless one locale is explicitly requested. Preserve meaning, examples, order, structure, and availability; use locale-specific root-relative links without `.mdx`.
- Repository `README.md` is English-only. Contributor instructions and skills do not require a Chinese mirror. Localize learner prose and sample prompts naturally; preserve commands, file names, URLs, and actual UI labels.
- Write concise, active instructions and lead with the learner's outcome. Use sentence case for English headings. Avoid marketing language, filler, emoji, and decorative formatting.
- Bold exact controls; use code formatting for files, commands, paths, and keys. Give code fences a language and media descriptive alt text or titles. Use `→` for forward progression.
- Use plausible examples and identify fictional practice material. Do not invent product behavior, UI labels, integrations, evidence, or response-time promises. Keep recommendations, approved decisions, and unknowns distinct.

## Boundaries that apply across courses

- Preserve existing components and CSS classes unless a redesign is requested. Keep custom styling in `custom.css`, using `--course-*` variables and their dark-mode values.
- Keep course-specific behavior outside the Playground. Do not inject course UI into it, change its save logic for a lesson, or invent a simulation for unsupported workflows. The course popup is available only at viewport widths of at least 1024px; hide it below that boundary.
- Lesson steps describe the real app; simulation hints belong inside the popup. Read the Playground reference before changing its behavior.
- Maintain three publication states: draft, published text awaiting video, and fully available lesson. Follow [drafts/README.md](drafts/README.md) for navigation, tags, cards, and promotion.
- Keep unfinished video scripts in MDX comments at the video slot, synchronized across locales. Do not display scripts or invent video URLs. English videos use YouTube; Chinese videos use bilibili.

## Validation and delivery

- Review the diff and locale parity. Use the [validation matrix](.agents/skills/nowledge-course/references/validation.md) for the changed surface.
- MDX or `docs.json` changes require `mint validate`. Draft changes require the merged temporary site (`just check-drafts`), because root checks exclude them. Report unavailable checks accurately.
- Content/navigation/link changes require link checks; visible content/media changes require accessibility checks; visual changes require affected-page desktop/mobile, locale, and color-mode inspection. Pure comments require an unchanged-rendering check, not a new visual matrix.
- Do not rerun unrelated checks after a passing result without new changes or unresolved evidence. Instruction-only changes require reference/skill validation, not a site build; executable helpers require behavioral checks.
- PR titles, descriptions, and commit messages are English. Keep changes focused and preserve other working-tree edits.
