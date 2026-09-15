---
name: nowledge-course
description: Maintain Nowledge Mem 101 lessons, localization, video scripts, publication states, and course UI with project-specific checks.
metadata:
  author: nowledge-mem-101 maintainers
---

# Nowledge Mem 101 course maintenance

Use this skill for this repository's tutorial workflow. Apply the root `AGENTS.md`; use the separate Mintlify skill only when platform mechanics are relevant.

## Read by task

| Change | Read |
| --- | --- |
| Lesson prose, examples, metadata, cards, or course styling | [Lesson and visual conventions](references/lessons.md) |
| Add an iframe or design/update a recording script | [Video production](references/videos.md) |
| Promote a lesson or change course availability | [Draft and publication workflow](../../../drafts/README.md) |
| Change Playground behavior, scenario bindings, or popup layout | [Playground integration](references/playground.md) |
| Select checks or verify draft/comment changes | [Validation](references/validation.md) |

Read only the relevant rows. A typo does not require Playground implementation details or deployment setup.

## Course editing loop

1. Identify the page pair and intended learner outcome. Read the current page, prerequisites, and next lesson so the example remains continuous.
2. Verify any changed product claim in the real UI or full docs. A source is not a saved memory; an AI recommendation is not an approval; a plausible answer is not proof that a link or history was consulted.
3. Edit both locales and any dependent navigation/card state. Use a fictional practice set when learners need starting material, retaining its dates, evidence limits, and open questions through the sequence.
4. Run checks selected from the validation reference, then report their actual scope. Preserve course and video drafts until the user requests the corresponding publication transition.

## Ownership

This is project-maintained guidance. The retained `mintlify` skill is an upstream copy tracked in `skills-lock.json`; do not copy its manual here or add another alias of it. `mintlify-api` is a separate project-maintained operational skill, not a prerequisite for course editing.
