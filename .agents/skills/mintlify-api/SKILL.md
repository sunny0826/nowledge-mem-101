---
name: mintlify-api
description: Trigger an authorized Mintlify deployment or branch preview and inspect deployment status. Use for platform API operations, not local course editing.
license: MIT
metadata:
  author: nowledge-mem-101 maintainers
  based-on: Mintlify API skill
---

# Mintlify deployment API

This project-maintained skill covers three deployment endpoints. Read the linked current reference before calling one. For local previews and builds, use repository commands instead; do not provision an API key or remote preview just to validate MDX.

## Scope and authentication

Use the existing authorized project ID and an Admin API key from the user's configured credential source. Send it as a Bearer token in the Authorization header without exposing it in logs, command arguments, files committed to Git, or client code. Admin, Assistant, and Index keys serve different endpoints; see the [authentication reference](https://www.mintlify.com/docs/api/introduction).

Before a POST, establish the target project and deployment branch or preview branch, and whether the user's request authorizes that action. Reuse existing authorization; do not ask again for an already approved deployment. A request to edit content does not itself request deployment.

## Endpoints

Base URL: `https://api.mintlify.com/v1`.

| Operation | Request | Result and source |
| --- | --- | --- |
| Deploy configured branch | `POST /project/update/{projectId}`; no JSON body required | `202` with `statusId`; [trigger deployment](https://www.mintlify.com/docs/api/update/trigger) |
| Preview an existing branch | `POST /project/preview/{projectId}`; JSON `branch` field | `202` with `statusId` and `previewUrl`; [preview requirements](https://www.mintlify.com/docs/api/preview/trigger) |
| Read deployment status | `GET /project/update-status/{statusId}` | `status`, `summary`, and logs; [status reference](https://www.mintlify.com/docs/api/update/status) |

The preview branch must exist in the connected repository; fork branches are not supported by this endpoint. A second preview request for the same branch redeploys it. Confirm preview visibility from the project settings rather than assuming it is private.

## Verify and handle failure

- A `202` acknowledges a queued request, not a successful deployment. Preserve `statusId` and poll GET with bounded waits and backoff until `success`, `failure`, or a task-appropriate deadline. `queued` and `in_progress` are pending states.
- On failure, inspect the earliest relevant error in the returned logs. Stop after identifying a blocker instead of triggering repeated builds.
- Do not blindly retry POST after a timeout or ambiguous response; check existing deployment state first. For authentication, authorization, or invalid-branch errors, report the specific missing prerequisite; do not rotate credentials or change targets on your own.
- Respect any rate-limit retry interval for GET requests. When the polling deadline is reached, report pending status and its ID, not success.
- Do not infer generic domain/navigation administration endpoints from this skill. Read local `docs.json` for repository configuration and consult the specific official API reference for other requested operations.

This local adaptation is intentionally not recorded as an unchanged upstream download in `skills-lock.json`.
