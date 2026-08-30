default:
    @just --list

# Preview unpublished course drafts at their final URLs.
drafts:
    node scripts/preview-ai-workflow-drafts.mjs

preview-ai-workflow: drafts

dev:
    mint dev
