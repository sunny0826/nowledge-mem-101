default:
    @just --list

# Preview every unpublished draft at its final local URL.
drafts:
    node scripts/preview-drafts.mjs

preview-drafts: drafts

# Legacy aliases for existing local workflows. Both now show every draft.
preview-ai-workflow: drafts

playground: drafts

dev:
    mint dev
