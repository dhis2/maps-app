---
name: community-post
description: Use when drafting a DHIS2 Community of Practice release-announcement post for a new maps-app feature/fix — gathers version/tickets/tone/prerequisites from the user, then dispatches the community-post-writer subagent to draft the post matching the real house format.
---

# Community post

Drafts a release-announcement post for community.dhis2.org, matching a real, consistent format verified across multiple published posts.

## Gather inputs

Before dispatching, collect from the user (suggest, don't assume, where you can):

-   **App version(s)** — can suggest from `package.json`, but confirm since Play/App Hub publishing timing may lag the repo's own version.
-   **The feature(s)/fix(es) to cover** — Jira ticket IDs. Jira is the house link convention; never link a GitHub PR in the post itself.
-   **Audience/tone lever** — default: accessible to non-developer admins/analysts, matching all real examples. Flag if this one should be more technical (rare).
-   **Feature-specific prerequisites** — e.g. "requires a Google Earth Engine API key configured," "requires organisation unit polygons." This is domain knowledge the skill can't guess; ask, or pull from the relevant ticket/PR description if available.
-   **Urgent patch note?** — only needed if this is a bugfix release superseding a broken version (e.g. "update directly to 100.8.1").
-   **Screenshots** — the user supplies real images or says "I'll add them later." Never fabricate a fake UI image; no GIFs in any real example.
-   **Who's signing** — name + title (PM and developer voices are both real precedents).

## Dispatch

Hand all of the above to the **`community-post-writer`** subagent to draft the actual post. Review the draft against the real structure before presenting it: opening line, per-app compatibility sentence, one heading per feature with a screenshot placeholder and a "Jira"-anchor-texted link, closing, signature — no fabricated call-to-action, no fabricated screenshot description.

## Note

Posting to the forum is manual, by the user — this skill only drafts the text.
