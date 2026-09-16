# Lesson and visual conventions

Read for lesson content, metadata, cards, or course styling. Publication states are defined in [drafts/README.md](../../../../drafts/README.md).

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
- The course style scope covers `/essentials`, `/ai-workflow`, `/ai-now`, and `/knowledge-system`, their child pages, and their `/zh` equivalents. Page content on these paths is capped at 42rem by the scoped `#content` selectors in `custom.css`; add new course paths to those selectors.
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
- These classes are overview-only: `.course-intro`, `.course-cta`, `.course-grid`, and `.course-card*`. Do not reuse them inside lesson bodies.
- Render course-level progression sequences (the Capture → Recall → Connect → Reuse loop, a course's workflow stages, and similar step flows) with the `.learning-stages` component, not a fenced `text` code block. One `.learning-stage` per step; the grid auto-sizes to the stage count — do not hardcode a column count. Localize the `aria-label` (`Learning stages`, `Workflow stages`, `学习阶段`, `工作流程`). Course overviews mark the first available stage with `.learning-stage-active`.
- Every published lesson repeats its course's stage sequence directly under `.course-meta` as a progress indicator. Mark earlier stages `.learning-stage-done` (blue fill with a check and blue connectors), the lesson's own stage `.learning-stage-active` (blue fill) with `aria-current="step"`, and leave later stages unstyled. Localize the `aria-label` as `Course progress` / `课程进度`.
- AI Now uses Mintlify's bottom previous/next navigation for lesson progression. Do not add a duplicate **Next lesson** heading or card in the article; the final lesson may retain its distinct back-to-course link.
- For courses with an in-article progression section, end an available lesson's **Next lesson** section with `<Card title="..." horizontal href="...">`, which the global `.card` rules restyle to match the course cards. When the next lesson is not yet available, use the muted status line instead of a link or badge:

  ```mdx
  <p className="course-status-line"><i aria-hidden="true"></i>Coming soon</p>
  ```

  Chinese pages render `即将上线` with the same markup.
- Course cards have two states: `.course-card-featured` is an `<a>` linking to an available lesson; `.course-card-upcoming` is a non-link `<div>` labeled **Coming soon** or **即将上线**. A card's state must match the target lesson's availability.

## MDX and reuse

- Published and draft lessons need YAML frontmatter with `title` and `description`; follow nearby `sidebarTitle` and Lucide `icon` conventions.
- Use built-in Mintlify components when they fit, while retaining the site's custom course classes.
- Every discoverable published page belongs in the correct language navigation. Draft navigation is generated only in the temporary preview; do not add unpublished paths to production `docs.json`.
- Pages absent from navigation may still be reachable; `.mintignore` is the draft exclusion mechanism.
- Keep tags balanced. Use a snippet only for content that must remain identical across uses; localize prose in separate pages.
- Course examples may span lessons, but each lesson should end with a checkable result. Compare retrieved claims with their saved records or source passages; include a fallback when retrieval or optional background processing is unavailable.
