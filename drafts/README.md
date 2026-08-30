# Draft courses

These files are intentionally excluded from publication by `.mintignore`.

## Preview courses locally

Run this from the repository root:

```bash
just drafts
```

Open:

- English: `http://localhost:3000/ai-workflow`
- Simplified Chinese: `http://localhost:3000/zh/ai-workflow`
- AI Now: `http://localhost:3000/ai-now`
- AI Now (Simplified Chinese): `http://localhost:3000/zh/ai-now`

The preview runs in a temporary directory. It adds draft-only navigation and maps the files in this directory to their final URLs. Changes under `drafts/ai-workflow`, `drafts/zh/ai-workflow`, and `custom.css` synchronize while the preview is running. Stop the command to remove the temporary preview.

`just preview-ai-workflow` is an equivalent, more explicit alias.

## Promote the course

After every English and Chinese video URL is ready:

1. Move each course directory from `drafts/` to its matching English or Chinese publish path, for example `drafts/ai-workflow/` to `ai-workflow/` and `drafts/zh/ai-workflow/` to `zh/ai-workflow/`.
2. Replace each video TODO with its localized iframe.
3. Change every course card and next-lesson status from `Coming soon` or `即将上线` to its matching link.
4. Add both course branches to `docs.json`, then make the home-page AI Workflow cards available.
5. Run `mint validate`, `mint broken-links`, and `mint a11y` before opening the PR.
