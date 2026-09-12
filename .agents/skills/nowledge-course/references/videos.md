# Demo videos and scripts

Read for video embeds, recording scripts, or replacing a pending demo. A lesson's demonstration sits after its outcome and before the learner procedure, under **Watch how it's done** / **看看怎么做**.

## Recording scripts

- Keep the script in one `{/* ... */}` MDX comment at the future iframe position. Retain the video TODO until an actual URL is supplied. Do not use HTML comments or a rendered Accordion/code block for the script.
- Write English and Chinese scripts alongside their lesson pages, using each locale's prompts and example wording. Script contents should include preparation, an editorial duration target, shot timing, screen actions, voiceover, and a final observable result.
- Existing scripts use approximately two minutes and six shots as an editing plan, not a universal requirement or product latency promise. Adjust the plan to the workflow.
- Record the real app using fictional course material. Identify fictional evidence and dates; keep unrelated course histories separate when they imply different decisions.
- Show actual controls and results. Condense typing or waits after showing the action and label time skips. Optional Research, Wiki, or EVOLVES behavior needs an honest alternative; do not manufacture a successful answer, automatic connection, or failure for the recording.
- Preserve reviewed claims, source limits, and unapproved status. A saved summary is not a captured full conversation; saving a maintenance procedure does not create a scheduled task.
- For script-only changes, use the comment snapshot/check commands in [validation.md](validation.md) to confirm the rendered MDX structure is unchanged.

## Embed a ready video

Use the supplied URL's real IDs. English pages use YouTube and Chinese pages use bilibili; both use `autoplay=0`, with `?` for the first query parameter and `&` for subsequent parameters.

```html
<iframe src="https://www.youtube.com/embed/<video-id>?autoplay=0" title="Demo: save a handoff checkpoint" allowfullscreen="true"></iframe>
```

```html
<iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=<aid>&bvid=<bvid>&cid=<cid>&p=1&autoplay=0" title="演示：保存交接检查点" allowfullscreen="true"></iframe>
```

Use a descriptive localized title. Do not add `scrolling`, `border`, `frameborder`, or `framespacing`. `mem-video-loading.js` supplies the 16:9 wrapper, loading state, and fallback link; do not add another wrapper or duplicate its global loading logic.

An unfinished script stays hidden while the existing visible video-pending note remains. Once both demos and the lesson are ready, follow [the publication workflow](../../../../drafts/README.md) to update cards, next-lesson links, and availability together.
