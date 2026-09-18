# Nowledge Mem 101

A hands-on tutorial for people who use AI tools and want their existing knowledge to be reusable across those tools. The tutorial teaches by asking readers to complete real tasks in [Nowledge Mem](https://mem.nowledge.co), following the **Capture → Recall → Connect → Reuse** learning loop.

The site is built with [Mintlify](https://mintlify.com) and is bilingual: English pages live at the repository root, and Simplified Chinese pages mirror them under `zh/`.

## Structure

- `docs.json` — Mintlify site configuration: language navigation, branding, and global links
- `index.mdx` / `zh/index.mdx` — English and Chinese landing pages
- `essentials/` / `zh/essentials/` — the beginner course (6 lessons, ~25 minutes)
- `ai-now/` / `zh/ai-now/` — the AI Now course (5 interactive lessons, ~25 minutes; guided Playground simulations)
- `custom.css` — site presentation and the course design system
- `mem-video-loading.css` / `mem-video-loading.js` — YouTube and bilibili demo video embed behavior
- `logo/`, `cover-image/` — static assets
- `prompts/` — production prompts, not published tutorial content

## Development

The project pins its toolchain with [mise](https://mise.jdx.dev/); `mise.toml` declares the Node.js, Mintlify CLI, and just versions used here. Install them once:

```bash
mise install
```

Run the dev server from the repository root (where `docs.json` lives):

```bash
mise exec -- mint dev
```

View your local preview at `http://localhost:3000`.

### Preview unpublished course drafts

Use `just drafts` to preview every unpublished draft at its final local URL without including it in the published site:

```bash
just drafts
```

The current Knowledge System and Playground drafts are available at their final local URLs. Published courses, including AI Now, remain available in the merged preview. See [`drafts/README.md`](drafts/README.md) for preview details and the promotion checklist.

## Validation

After changing MDX, navigation, or content, run the Mintlify checks through the mise-managed toolchain:

```bash
mise exec -- mint validate
mise exec -- mint broken-links
mise exec -- mint a11y
```

## Community

Community is a collection of external articles, posts, and websites where people share how they build their own knowledge map with Nowledge Mem — separate from the courses. Entries link directly to their original URLs; do not create local article pages or copy article bodies into this repository.

To add an entry, update the Community menu in both language sections of `docs.json`, the community pages (`community.mdx` and `zh/community.mdx`), and the community section on both landing pages (`index.mdx` and `zh/index.mdx`). Keep the URL and order consistent across locales, localize the title and short summary, and identify the source platform and original language.

## Localization

- English and Simplified Chinese pages are updated in the same change, preserving meaning, order, links, and structure across locales.
- English pages use root-relative links (for example `/essentials/first-memory`); Chinese pages use `/zh/...`.
- Full product documentation lives at [mem.nowledge.co/docs](https://mem.nowledge.co/docs) (Chinese: [mem.nowledge.co/zh/docs](https://mem.nowledge.co/zh/docs)). This repository only contains the tutorial.

## License

[MIT](LICENSE)


## Contributor guidance

Read [AGENTS.md](AGENTS.md) for project conventions. This repository README is English-only; tutorial pages and video scripts are maintained in English and Simplified Chinese.

Use `just drafts` for the merged draft preview and `just check-drafts` to validate all unpublished lessons at their final paths. See [draft publication states](drafts/README.md) for text-first releases and fully available lessons.

Project-specific instructions live in [.agents/skills/nowledge-course/](.agents/skills/nowledge-course/SKILL.md). One upstream Mintlify skill is pinned in `skills-lock.json`; the course and deployment API skills are locally maintained.
