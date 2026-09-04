---
name: mockup-pr
description: Build and open a draft "mockup" PR — real, clickable code on a throwaway branch that's never intended to merge, so stakeholders can react to something concrete before the team commits to full implementation. Explicit invocation only.
disable-model-invocation: true
---

# Mockup PR

| Situation                                             | Do                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Haven't yet identified what this mockup is de-risking | Step 1 — ask, don't guess                                                   |
| UI/UX or information-architecture question            | `references/ui-ux-fidelity.md`                                              |
| Algorithmic/statistical feasibility question          | `references/algorithmic-fidelity.md`                                        |
| Architecture/integration feasibility question         | `references/architecture-fidelity.md`                                       |
| Ready to push + open the PR                           | See "Pushing and opening the PR" below — always a fresh, explicit ask first |

A "mockup" here is a **draft, never-merged PR** whose job is to give stakeholders something they can click through on a live preview, before real implementation work starts. It is not one recipe — three real precedents in this repo (#3684, #3673, #3655) each picked a different fidelity strategy depending on _what uncertainty they were de-risking_. Picking the wrong one either wastes effort (over-building a throwaway UI mock) or fails to actually answer the open question (under-building when the risk is algorithmic or architectural).

## Step 0 — Scope

Before writing anything, get from the user (don't assume):

-   A one-line pitch of the feature being mocked up.
-   A Jira ticket ID or link, if one already exists (there's no live Jira API access — take it as pasted text; it's fine if there isn't one yet, see PR #3673, which validated a not-yet-ticketed direction).

## Step 1 — What is this de-risking?

Ask (`AskUserQuestion`), single-select, always — even if it looks obvious from the user's initial description:

> **What's the biggest open question this mockup needs to answer before real implementation starts?**
>
> -   **UI/UX & information architecture** — Will this layout/workflow make sense to users? Stub data locally, no Redux/API wiring. Cheapest, most disposable. → `references/ui-ux-fidelity.md`
> -   **Algorithmic/statistical feasibility** — Does the calculation actually work and perform acceptably on real data? Implement it for real, with real tests, gated by a new config flag. → `references/algorithmic-fidelity.md`
> -   **Architecture/integration feasibility** — Can a new subsystem integrate with the app's real state/actions? Wire the real "hands", stub only the expensive/uncertain "brain". → `references/architecture-fidelity.md`
> -   **Not sure / a mix** — talk it through before picking one.

Don't split effort across strategies for one PR — pick the single primary uncertainty and build to answer that one.

## Step 2 — Branch

-   Ticket exists → `mockup/<TICKET-ID>` (e.g. `mockup/DHIS2-21453`).
-   No ticket yet / exploratory → `feat/<short-slug>` (e.g. `feat/spatial-analysis`, `feat/ai-agent-poc`). Branch prefix tracks "does a ticket exist," not which fidelity strategy was picked — either naming style is fine either way.

Always branch from latest `master`.

## Step 3 — Build

Open the reference file matched in Step 1 and follow its guidance for what to fake and what to build real. Regardless of which strategy: use real `@dhis2/ui` components, real `core/` field-wrapper components (`src/components/core/`), real colocated `ComponentName.module.css`, real `i18n.t()` for all strings, and put files in the correct `src/components/<feature>/` location. If the mockup touches a layer type or classification/thematic config, see the `map-layer-architecture` skill for the real conventions there — don't reinvent them for the mockup.

Commit normally as you go (`feat(scope): ...`, `fix(scope): ...`, etc. — see `commit-and-pr-messages`) — there's no special "mockup:" commit-message prefix requirement; that convention belongs to the PR title, not every commit.

## Step 4 — Confirm before pushing

Before running any push or PR-create command, show the user:

-   Final branch name
-   The commit list (`git log master..HEAD --oneline`)
-   The PR title
-   The filled-in PR body (see template below)

Get an explicit go-ahead. This isn't extra bureaucracy on top of the skill's own invocation — it's the one checkpoint before something becomes visible to the rest of the team, and per this repo's universal rule, remote writes always need a fresh, in-the-moment ask regardless of how the skill was invoked.

## PR title

`mockup: <short description>` — optionally append `[DHIS2-XXXXX]` if there's a ticket and the user wants it visible in the PR list. Not required even when a ticket exists (precedent: #3684 has no ticket in its title despite one in the body).

## PR body template

```
Mockup{ for [<TICKET-ID>](https://dhis2.atlassian.net/browse/<TICKET-ID>)}

DO NOT MERGE

### Description

**What:** <one sentence — what this demonstrates and why now>

- <what's built>
- <what's built>
- <what's explicitly faked/stubbed and why, per the chosen fidelity strategy>
- <out-of-scope/follow-up work, named explicitly — not vague>

---

### Screenshots

<!-- Drag screenshots into the PR description on github.com after it's open —
     gh/the API can't embed inline images (github.com's drag-and-drop is a
     private endpoint, not part of the public REST API or gh CLI). Omitting
     this section entirely is also fine and has precedent (#3655) when the
     live preview is expected to carry that weight instead. -->
```

Drop the `{ for [...] }` bracketed clause entirely (leaving plain `Mockup`) if there's no ticket.

## Pushing and opening the PR

**Per this repo's universal rule: never push or open a PR without a fresh, explicit, in-the-moment ask — every time, no exceptions, regardless of how this skill was invoked.** There's no pre-provisioned write credential to reach for and no way to bundle this into an earlier approval. Confirm with the user right before running either command, then attempt it through the normal tool-permission flow (which will prompt) — don't try to route around that prompt.

```bash
git checkout master && git pull origin master
git checkout -b mockup/DHIS2-21453   # or feat/<short-slug>

# ... commits happen during Step 3 ...

git push -u origin mockup/DHIS2-21453

gh pr create \
  --draft \
  --base master \
  --title "mockup: <short description>" \
  --label mockup \
  --body-file <path-to-pr-body.md>
```

`--label mockup` assumes the label exists on the target repo (it does on `dhis2/maps-app`, confirmed). If it's missing on a fork, `gh pr create` fails with `could not add label: 'mockup' not found` — surface that error rather than retrying without the label.

## After opening

-   **Never run `gh pr ready`** on this PR — it's meant to stay in draft forever.
-   A SonarQube quality-gate failure comment is expected on these PRs — don't try to clean it up; that would defeat the point of a cheap, fast mockup.
-   A Netlify bot comment with the live preview URL (`pr-<n>.maps.netlify.dhis2.org`) usually appears within a couple of minutes (`gh pr view <n> --comments` to check) — this is how stakeholders click through the mockup without pulling the branch. It's not guaranteed to post every time; don't block the handoff on it.
