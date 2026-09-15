# Drafts and staged publication

`drafts/` and `*.draft.mdx` are excluded from publication by `.mintignore`. English drafts mirror their eventual root paths; Chinese drafts mirror `zh/` paths.

## Preview and validate

```bash
just drafts
just check-drafts
```

The preview discovers draft MDX, merges it over a temporary copy of published content, and generates bilingual navigation at final paths such as `/ai-workflow`, `/zh/ai-now`, and `/knowledge-system`. Existing published pages remain available. Mixed courses use their existing tab, ordered by lesson number; fully draft courses get a separate draft-labeled tab.

`just check-drafts` uses the same merged site without starting a server. It runs build, link, and accessibility checks, returns the first failure, and removes the temporary site. Root-level `mint` checks exclude the drafts. Select individual checks with `node scripts/preview-drafts.mjs --check validate` or `--check broken-links a11y`.

During preview, changes under `drafts/`, `snippets/`, and shared site assets synchronize. Restart after other published-page edits. Stop the preview to remove its temporary directory. `just preview-drafts`, `just preview-ai-workflow`, and `just playground` remain aliases for the same full preview. A custom port can be passed to `node scripts/preview-drafts.mjs --port 3018`.

## Publication states

| State | Files and navigation | Cards, next links, and video |
| --- | --- | --- |
| Draft | Under `drafts/`; no production navigation entry | Course progression remains Coming soon / 即将上线; video TODO and script stay in comments |
| Published text awaiting video | Matching root / `zh/` path, added to `docs.json`, draft tag removed | Sidebar page is reachable; course entry card and previous lesson's next link remain Coming soon / 即将上线; page explains that the demo is pending |
| Fully available lesson | Published paths and bilingual navigation | Real locale-specific videos embedded; entry card and previous lesson's next link become available |

The next-lesson section of any page reflects the next lesson's own state, not the current page's state. A published text page awaiting video is intentionally reachable before its course progression entry is activated.

## Promote only the requested state

1. Move the English and Chinese draft files to their matching published paths. Remove `tag: "Draft"` / `tag: "草稿"` when present, and add the published paths to the correct `docs.json` language branches.
2. For a text-first release, keep the video TODO, hidden script, pending-video note, and muted course progression entry. Do not invent an iframe or activate all course cards just because a file moved.
3. When the lesson and both demos are ready, insert the supplied YouTube/bilibili iframes and remove obsolete video-pending notices. Activate the corresponding course card and previous lesson's next link; update affected counts and availability in both languages.
4. Review state parity and run the applicable checks in the [validation guide](../.agents/skills/nowledge-course/references/validation.md).

Only draft lessons in a mixed published/draft course need a frontmatter `tag` (`Draft` / `草稿`). Fully draft courses already have a draft-labeled preview tab. Do not add a draft overview for a mixed course; its published overview remains the entry point.

Playground demo pages use the existing root `playground.js` and `playground.css`. Promoting a host page does not move or duplicate these shared assets.
