# Playground integration

Read only when changing the shared simulation, course guide, or popup styling. Check the current script and lesson bindings first: memories describing an older version are historical context.

## Ownership and supported flows

- Root `playground.js`, `playground-ai-now.js`, and `playground.css` implement the reusable app replica; `snippets/playground.mdx` mounts it. `course-playground-guide.js` owns course-specific guidance outside the component.
- The replica includes Timeline capture/recall, Memories, Threads, Library, and AI Now. The AI Now extension uses fictional Atlas fixtures and preset replies, with local task history, source/memory readers, a Research toggle, and save/retrieve state. It never calls a model or the web. A document URL or filename with an extension sent in Timeline imports a Library row; the simulated indexing delay and answer behavior belong to the replica, not the real product contract.
- Course pages select `data-course-guide-scenario`; the guide's `SCENARIOS` table is the current mapping. Do not invent simulation flows for external AI connections or other UI that the replica does not support.

| Scenario | Interaction | Completion / changed element |
| --- | --- | --- |
| `save` (default) | Timeline → input → send | Input clears / saved entry |
| `recall` | Question → send | Answer appears / `.mp-answer` |
| `threads` | Threads → search → Enter or search button | Non-empty query / found thread row |
| `save-ask` | Save brief → ask to find it | First send advances on clear; final answer completes |
| `library` | Import in Timeline → ask about document → open Library | Final navigation / imported row |
| `ai-context`, `ai-source`, `ai-evidence`, `ai-research`, `ai-save` | AI Now tasks → typed prompts → checked source/memory → fresh-task retrieval | Verified `mp:action` events; missing prerequisites never advance |

Each scenario supplies its fill step, completion mode (`cleared`, `answer`, or `query`), and changed element. `data-course-guide-fillable-N` can supply per-step values; the final changed hint uses `data-course-guide-hint-(steps+1)`. Inspect actual lesson attributes before changing a binding.

## Interaction invariants

- The window opens on demand. Highlight the current existing control using `data-course-guide-target` and the localized `.course-playground-hint`; do not restore historical connecting lines.
- Keep the fill button inside the fill-step hint, using the root fill attributes. Cache hint content by key: replacing the button between mousedown and mouseup swallows clicks.
- Only the red titlebar dot closes the window. Yellow and green dots are decorative (`aria-hidden`, no interactive role). Do not wire minimize/maximize to them.
- Programmatic minimization may leave the icon-only `.course-playground-mini` restore button. The close glyph uses CSS `::after` with the `.mp-dots` ancestor for specificity; colors use `--course-dot-*`.
- Step changes scroll the article to its matching step via the `renderedStep` comparison. While docked, `html[data-course-playground-docked]` hides `#sidebar`; close or minimize restores it.
- The popup, hint, status, launch button, and mini button are hidden below 1024px, and launch is a no-op. This does not prohibit the standalone Playground's own responsive layout.
- Wide screens center the full `#content-area` (header, prose, and pagination) beside the Playground with a bounded gap and readable column widths; narrower desktop screens overlay from the right. `data-course-playground-split` and its width/offset properties must clear on close, minimize, navigation, and below the desktop breakpoint. The window, hint, and completion dialog live under `body`, outside the Playground.
- Lesson steps describe real-app actions. Keep simulation-only instructions in the popup. Do not inject course nodes into the replica or alter its save logic.

## Completion and asset changes

- After the final action, highlight the changed element and show `.course-playground-done` after the guide's delay (currently five seconds). This is simulation behavior, not a product response-time promise.
- The localized confirm button only dismisses the dialog so practice can continue. The Open Nowledge Mem button closes the simulation, attempts `nowledgemem://`, and uses the configured web URL in a new tab only if the app did not take focus.
- When changing `course-playground-guide.js`, bump its `?v=` query in every English/Chinese lesson that loads it. Find current callers with `rg`, rather than keeping a version or exhaustive page list in instructions.
- Verify affected scenarios, hint fill clicks, close/restore, sidebar restoration, both locales and color modes, and desktop/mobile boundaries. Keep root asset locations unchanged when promoting a demo host page.

## Library layout

- Match the real app's source sidebar and document detail layout; do not reuse Thread rows. The Artifacts tab contains compact grouped sources, search, type/status filters, sorting, and a source count. Other tabs remain explicitly unavailable in the simulation.
- Selecting a Library source opens its text in the adjacent detail pane (a list/detail switch on narrow containers), and emits the existing source-read event. Keep import/indexing and course events intact. AI Now citations and saved-memory references still use its shared reader.
- Inspect the loaded Library body, not only the app heading: navigation updates the heading before the lazy-loaded content arrives. Use DOM/source and computed styles when screenshots are not requested.

## AI Now extension

- `playground.js` exposes a mount-local `mpAPI` and emits `mp:ready` after initialization. The extension handles either load order and only initializes once per mount. Keep the existing Timeline save/recall behavior independent.
- `mp:ai-seed` accepts prerequisite state (`source: true/false`, `history: [{text, research}]`) from the course guide. The guide selects cumulative earlier turns for AI Now lessons 2–5; the replica rebuilds them in the current task without emitting live reply events or advancing the guide. Seeded history is preset practice context, not persisted learner input. Preparing a new lesson or replay resets its local result; ordinary **New Task** preserves saved knowledge and Library while clearing conversation history and draft state. Nothing persists after a page reload.
- Course step maps, fill prompts, and hints remain outside the replica. The guide advances on completed `mp:action` events, including indexed imports and opened evidence; clicking Send alone is insufficient.
- Replies display a short, labeled simulation of processing stages, with an optional Stop action. Run model work and memory writes only after the stages finish; stop, task switches, reseeding, and detached mounts must not produce stale replies or writes. Emit the reply event only after the answer is rendered.
- Research replies explicitly say no web search was run. Completing this simulation does not complete real research or turn a recommendation into an approval.
- Run `node --test scripts/playground-ai-now.test.cjs` for prerequisite, save/retrieve, duplicate-save, and simulated-research behavior; also exercise the browser flows and existing scenarios.
