default:
    @just --list

drafts:
    node scripts/preview-drafts.mjs

preview-drafts: drafts

preview-ai-workflow: drafts

playground: drafts

dev:
    mint dev

check-drafts:
    node scripts/preview-drafts.mjs --check

check-maintenance:
    node --test scripts/maintenance.test.mjs
