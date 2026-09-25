---
name: spec-from-ticket
description: Use when the user pastes Jira ticket content (title/description/acceptance criteria) and asks for a durable spec or implementation-plan document — phrases like "spec this out", "write a spec for this ticket", "turn this into a plan doc", "I want to hand this to another session/agent". Interviews on genuinely ambiguous points, explores the codebase via a subagent first, then authors a self-contained document to .claude/specs/. Don't use for a same-session "just implement it" request, or a quick approve-and-go plan — that's Plan Mode.
---

# spec-from-ticket

Turns a pasted Jira ticket into a **durable, standalone spec + implementation plan** — meant to be picked up cold, later, by a human or a different AI session, with no memory of this conversation.

| Situation                                                                  | Do this                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| User pasted ticket content and wants a spec/plan doc/handoff artifact      | Run the flow below                                                                           |
| User pasted ticket content and just wants it implemented now, this session | Skip this skill — implement directly, or use Plan Mode if you want sign-off before executing |
| A `.claude/specs/<TICKET-ID>-*.md` already exists for this ticket          | Read it first, update it via the `spec-writer` subagent — don't create a duplicate           |
| A spec produced by this skill is ready to build                            | Hand it to the `implement-plan` skill — don't re-interview                                   |

No Jira/Atlassian connector is authorized here. Work only from what the user pastes into the conversation — never guess at fields the ticket didn't mention.

## 1. Capture the ticket

Note the ticket ID in the real bracket format used elsewhere in this repo's commits/branches: `PROJECTKEY-NUMBER` (e.g. `DHIS2-20564`, `CLIM-501`). If the user didn't paste one, ask for it once; if there genuinely isn't one, proceed ticket-less.

## 2. Explore before you interview

Dispatch a plain Explore subagent with the pasted ticket content and ask it to report back: concrete files/components/actions/reducers likely touched, existing patterns to follow (check the `map-layer-architecture` skill if a layer is involved), and anything it _couldn't_ resolve from code alone. Do this in a subagent so the broad reading doesn't burn the main session's context — you only need the findings, not the search process.

Use those unresolved points to sharpen step 3 — don't ask the user something the exploration already answered.

## 3. Interview — only what changes the plan

See `references/interview-and-scoping.md` for the full guidance on what to ask vs. assume. Short version: ask about real technical forks (2+ reasonable implementations), unstated scope boundaries, and edge cases the AC is silent on. Batch questions via `AskUserQuestion`. Don't ask anything answerable by reading the code, or anything with one obviously-sane default — state the default as an assumption in the spec instead.

## 4. Write the spec

Dispatch the **`spec-writer`** subagent with the ticket content, the interview answers from step 3, and the Explore findings from step 2. Its job is authoring the actual document to `.claude/specs/<TICKET-ID>-<slug>.md` (`.claude/specs/<slug>.md` if ticket-less) — not `docs/`, which is the published end-user manual, a different audience entirely. Review its draft before presenting it to the user; check the "Implementation plan" section is broken into steps small and file-scoped enough that each could plausibly be one commit — that's what lets `implement-plan` consume the plan mechanically later.

Re-running this skill against a ticket that already has a spec updates that file in place via the same subagent — never create a `-2`.

## Handoff

-   **Plan Mode vs this skill**: Plan Mode's plan is ephemeral and session-scoped — "I approve this, execute it now." This skill's output is a durable artifact — designed to be read cold, possibly days later, possibly by a different agent entirely. Use Plan Mode when the user is at the keyboard right now and ready to go immediately; use this skill when the work might not start immediately, or the implementer isn't known yet.
-   **Feeding forward**: once written, point the user at the `implement-plan` skill (`/implement-plan .claude/specs/<file>.md`) to execute it, or open a fresh Plan Mode session against the spec file directly. Either way, don't re-run the interview — the spec already captured the decisions.
