# n8n Review Callback — Scope and Flow

## Overview

This document defines the CaptionSan-side scope for the n8n review callback integration. CaptionSan remains the source of truth for all review states and audit history.

## Review States

| State | Description | Triggered By |
|-------|-------------|--------------|
| `draft` | Content generated, not yet submitted for review | AI generation / revision |
| `in_review` | Content submitted to external review via n8n | CaptionSan (outbound trigger) |
| `approved` | Content approved by reviewer | n8n callback or manual approval |
| `rejected` | Content rejected by reviewer | n8n callback |
| `revision_requested` | Reviewer requests changes with notes | n8n callback |

## Callback Flow

```
┌─────────────┐         ┌─────────┐         ┌─────────────┐
│ CaptionSan  │────────▶│   n8n   │────────▶│  Reviewer   │
│ (source of  │         │(workflow)│         │  (human or  │
│   truth)    │◀────────│         │◀────────│   system)   │
└─────────────┘         └─────────┘         └─────────────┘
     │                       │                     │
     │  1. Submit for review │                     │
     │──────────────────────▶│                     │
     │                       │  2. Route to        │
     │                       │     reviewer        │
     │                       │────────────────────▶│
     │                       │                     │
     │                       │  3. Review decision │
     │                       │◀────────────────────│
     │  4. Callback with     │                     │
     │     status + notes    │                     │
     │◀──────────────────────│                     │
     │                       │                     │
     │  5. Update status     │                     │
     │     + audit history   │                     │
     └───────────────────────┘                     │
```

### Step-by-step

1. **Submit for review** — CaptionSan marks a platform output as `in_review`. This can trigger an n8n workflow (via webhook or polling).
2. **Route to reviewer** — n8n routes the content to the appropriate reviewer (Slack, email, custom UI, etc.).
3. **Review decision** — The reviewer approves, rejects, or requests revision with optional notes.
4. **Callback** — n8n sends a POST request to CaptionSan's callback endpoint with the review result.
5. **Update** — CaptionSan validates the callback, updates the status, and records the event in audit history.

## Valid State Transitions

```
draft ──────────────────▶ in_review
draft ──────────────────▶ approved (manual approval, no n8n)
in_review ──────────────▶ approved
in_review ──────────────▶ rejected
in_review ──────────────▶ revision_requested
revision_requested ─────▶ draft (user revises content)
revision_requested ─────▶ in_review (resubmit after revision)
rejected ───────────────▶ draft (user revises content)
rejected ───────────────▶ in_review (resubmit after revision)
```

## Scope Boundaries

### In scope
- Receiving review callbacks from n8n.
- Validating callback payloads (job ID, status, auth).
- Updating platform output approval status.
- Recording audit history for all status transitions.
- Supporting reviewer notes and metadata.
- Allowing manual retry/resync of failed callbacks.

### Out of scope
- Triggering n8n workflows from CaptionSan (future task).
- Auto-posting approved content to platforms.
- Complex routing logic (handled by n8n).
- Reviewer assignment or notification (handled by n8n).

## Constraints

- CaptionSan is the source of truth for review status.
- The prompt-first workflow is preserved — content must be generated before review.
- Bilingual UI (Indonesian default, English supported).
- Invite-only access remains enforced.
- Callbacks must be authenticated (API key or shared secret).
- Duplicate callbacks for the same transition must be idempotent.
- No status can be overwritten without a valid transition.

## Authentication for Callbacks

n8n callbacks authenticate using one of:
- **API key** — Standard `csan_` prefixed token via `Authorization: Bearer csan_xxx` header.
- **Webhook secret** — HMAC signature in `X-Webhook-Signature` header (future option).

The API key approach reuses the existing `requireApiAuth` middleware, keeping the implementation simple and consistent.
