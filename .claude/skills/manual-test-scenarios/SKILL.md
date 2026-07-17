---
name: manual-test-scenarios
description: Use when drafting the "Manual testing" section of a PR body (or a combined write-up spanning a pr-chain) — gathers the ticket list, Netlify preview info, and real map/dashboard UIDs, then dispatches the test-scenario-writer subagent to draft the section matching this repo's real convention.
---

# Manual test scenarios

Drafts the "Manual testing" section of a PR body, matching a real, consistent, already-established convention (verified across multiple real PRs) — one bullet per Jira ticket, a working link + a screenshot, not numbered click-steps.

| Situation                                                      | Do this                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Single PR, tickets already known                               | Gather inputs (below), dispatch `test-scenario-writer`                                     |
| A `pr-chain` — multiple PRs, each with its own Netlify preview | Ask the user: one consolidated write-up (in the tail PR) or per-PR sections? Don't assume  |
| No real map/dashboard UID available yet for a scenario         | Ask the user for one — never invent a UID, it has to actually exist on the pinned instance |

## Gather inputs

Before dispatching, collect:

-   **Ticket list** — the same `[TICKET-ID](url)` links already used under "Implements" in the PR body; reuse them verbatim, don't re-derive the URL.
-   **Netlify PR number and instance** — `Netlify: https://pr-<PR#>.maps.netlify.dhis2.org/ + Instance: https://dev.im.dhis2.org/maps-app-42-3` is the real fixed pattern; confirm the PR number if not obvious.
-   **Real map/dashboard UIDs** to link per scenario, from the user — this skill can't invent working test data.
-   **Whether the "Dashboard tested" checklist item applies** — if so, also gather the `interpretationId` for a paired "- plugin" link alongside each "- main" link.

## Dispatch

Hand all of the above to the **`test-scenario-writer`** subagent to draft the actual section in the tester-facing voice (trusts a technically-comfortable internal tester with a link + screenshot, never prose click-paths). Review its draft before inserting it into the PR body — confirm every ticket has either a real test-map link or an explicit "still needs a link" placeholder, never a silently-dropped bullet.

## For a `pr-chain`

Each PR in the stack gets its own Netlify preview URL. Ask the user which they want: one consolidated write-up organized by ticket across the whole set (living in the tail PR), or per-PR sections each referencing that PR's own preview. Don't default to one without asking — both are reasonable and it depends on how the reviewers actually work through the chain.

## Ties to the PR template

This section is the evidence that lets a named tester actually check the `Tester approved (name)` Quality-checklist item — `check-tasklist.yml` blocks the PR while that box (or any other) is left unchecked with no `_N/A_`. See `commit-and-pr-messages` for the full checklist-constraint rule.
