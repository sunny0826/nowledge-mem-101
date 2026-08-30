# Draft content

These files are intentionally excluded from publication by `.mintignore`.

## Preview every draft locally

Run this from the repository root:

```bash
just drafts
```

The preview automatically discovers every `.mdx` page under `drafts/`, maps it to its final site path, and adds draft-only navigation in both languages. Current overview routes include:

- English: `http://localhost:3000/ai-workflow`
- Simplified Chinese: `http://localhost:3000/zh/ai-workflow`
- AI Now: `http://localhost:3000/ai-now`
- AI Now (Simplified Chinese): `http://localhost:3000/zh/ai-now`
- Playground: `http://localhost:3000/playground`
- Playground (Simplified Chinese): `http://localhost:3000/zh/playground`
- Knowledge System: `http://localhost:3000/knowledge-system`
- Knowledge System (Simplified Chinese): `http://localhost:3000/zh/knowledge-system`

The preview runs in a temporary directory. Changes under `drafts/`, `snippets/`, and the shared site assets synchronize while the preview is running. Stop the command to remove the temporary preview.

`just preview-drafts` is an equivalent alias. `just preview-ai-workflow` and `just playground` remain available for existing local workflows; both now open the same complete preview.

## Promote a draft

When a draft is ready to publish:

1. Move its English and Chinese paths from `drafts/` to their matching publish paths, for example `drafts/ai-workflow/` to `ai-workflow/` and `drafts/zh/ai-workflow/` to `zh/ai-workflow/`.
2. When promoting Playground, move `drafts/playground-assets/playground.css` and `drafts/playground-assets/playground.js` to the repository root.
3. For a course, replace every video TODO with its localized iframe and change its status from `Coming soon` or `即将上线` to the matching link.
4. Add the published pages to `docs.json`, then make the matching home-page course cards available when applicable.
5. Run `mint validate`, `mint broken-links`, and `mint a11y` before opening the PR.
