# Nowledge Mem 101

A hands-on tutorial for people who use AI tools and want their existing knowledge to be reusable across those tools. The tutorial teaches by asking readers to complete real tasks in [Nowledge Mem](https://mem.nowledge.co), starting with the core **Capture → Recall** loop and later covering **Connect → Reuse**.

The site is built with [Mintlify](https://mintlify.com) and is bilingual: English pages live at the repository root, and Simplified Chinese pages mirror them under `zh/`.

## Structure

- `docs.json` — Mintlify site configuration: language navigation, branding, and global links
- `index.mdx` / `zh/index.mdx` — English and Chinese landing pages
- `essentials/` / `zh/essentials/` — the beginner course (6 lessons, ~20 minutes)
- `custom.css` — site presentation and the course design system
- `mem-video-loading.css` / `mem-video-loading.js` — bilibili demo video embed behavior
- `logo/`, `cover-image/` — static assets
- `prompts/` — production prompts, not published tutorial content

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) if you don't have it yet:

```bash
npm i -g mint
```

Run the dev server from the repository root (where `docs.json` lives):

```bash
mint dev
```

View your local preview at `http://localhost:3000`.

### Preview unpublished course drafts

Use `just drafts` to preview every unpublished draft at its final local URL without including it in the published site:

```bash
just drafts
```

The current AI Workflow, AI Now, and Playground drafts are available at their final local URLs. See [`drafts/README.md`](drafts/README.md) for the full URL list and promotion checklist.

## Validation

After changing MDX, navigation, or content, run the Mintlify checks:

```bash
mint validate
mint broken-links
mint a11y
```

## Localization

- English and Simplified Chinese pages are updated in the same change, preserving meaning, order, links, and structure across locales.
- English pages use root-relative links (for example `/essentials/first-memory`); Chinese pages use `/zh/...`.
- Full product documentation lives at [mem.nowledge.co/docs](https://mem.nowledge.co/docs) (Chinese: [mem.nowledge.co/zh/docs](https://mem.nowledge.co/zh/docs)). This repository only contains the tutorial.

## License

[MIT](LICENSE)
