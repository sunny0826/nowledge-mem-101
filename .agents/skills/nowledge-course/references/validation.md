# Validation by changed surface

Run commands from the repository root unless specified otherwise. Report which checks ran and which pages they covered; existing global palette warnings are distinct from content failures.

| Change | Checks |
| --- | --- |
| Instructions or skill Markdown only | Diff, local references, skill frontmatter/unique names; no site build required |
| MDX comments only | Comment snapshot comparison plus `mint validate`; no new layout matrix |
| Lesson prose or media | `mint validate`, `mint broken-links`, `mint a11y`, locale parity |
| Navigation or publication state | Build and links; verify language paths, cards, previous/next links, and draft tags |
| Components or CSS/JS layout | Applicable build/content checks and affected-page desktop/mobile, EN/ZH, light/dark inspection |
| Maintenance scripts | `node --test scripts/maintenance.test.mjs`; run the affected real command |

## Include drafts

`.mintignore` excludes `drafts/` from root checks. Use:

```bash
just check-drafts
```

This reuses the same copy, merge, and navigation logic as `just drafts`, runs `mint validate`, `mint broken-links`, and `mint a11y` sequentially in the temporary site, then removes that site. It stops on the first failure and returns a nonzero exit code. To select only relevant checks:

```bash
node scripts/preview-drafts.mjs --check validate
node scripts/preview-drafts.mjs --check broken-links a11y
```

Stop the preview you started before running a build check if both would use the same Mintlify cache. Do not stop another user's server. For visual work use `just drafts` (or `node scripts/preview-drafts.mjs --port 3018`) and inspect the affected final paths. Inspect changed pages and representative shared-component cases; repeat only when new changes, failures, or unresolved concerns justify it.

## Prove a comment-only change

Before editing, capture the current working tree, including its uncommitted MDX changes:

```bash
node scripts/check-mdx-comments.mjs snapshot /tmp/nowledge-comments-before.json
```

After editing:

```bash
node scripts/check-mdx-comments.mjs check /tmp/nowledge-comments-before.json
```

The checker uses the installed MDX parser to compare structures after removing only valid MDX comment expressions and source-position metadata. It rejects visible changes, malformed MDX, and added/deleted pages. It does not install dependencies, run page code, or replace the Mintlify build check. Use a fresh snapshot path for a new task; an existing snapshot is never overwritten.

If Mintlify or its MDX dependency is unavailable, report the missing check rather than installing tooling as an incidental step. Do not claim root-level checks covered ignored drafts.
