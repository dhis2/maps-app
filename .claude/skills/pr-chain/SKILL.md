---
name: pr-chain
description: Use when planning, creating, or maintaining a stacked chain of dependent PRs (PR1 -> PR2 -> ... -> PRn, each branched from the previous) for one large epic. Covers slicing a plan into a 5-10 PR chain, propagating review-feedback changes down the still-open stack, and re-anchoring downstream PRs after an earlier one squash-merges to master. Creates real branches/PRs — always requires explicit invocation, never trigger this automatically.
disable-model-invocation: true
---

# PR chain

A "chain" is a stack of dependent branches for one epic: `pr1 -> pr2 -> ... -> prN`, each branched from the previous one's branch (not from `master`), each its own small, independently-reviewable PR. This repo squash-merges everything, which is the one fact that makes chains tricky — see "After a stack member merges" below before touching anything post-merge.

| Situation                                                                                       | Do this                                                           |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| You have (or need to produce) a plan with 3-10 discrete steps and want it as a reviewable chain | "Creating the chain"                                              |
| Review feedback changed an earlier PR that **hasn't merged yet**                                | "Propagating a change down the chain"                             |
| An earlier PR in the chain **just squash-merged to master**                                     | "After a stack member merges" + `references/squash-merge-sync.md` |
| The chain is pushing past ~10 PRs, or a propagation is turning into a conflict-fest             | "When to stop and re-plan"                                        |
| You just want to sanity-check the chain's current shape                                         | "Chain health check"                                              |

## Before creating anything

This skill only runs when explicitly invoked — it stages branches and opens PRs, which `CLAUDE.md`'s "don't stage or commit unless explicitly asked" policy puts squarely behind explicit consent. **Every push, `gh pr create`, and `gh pr edit` in this workflow still needs its own fresh, explicit, in-the-moment ask** — per this repo's universal rule, the initial `/pr-chain` invocation authorizes the workflow conceptually, not a standing blanket permission for every subsequent remote write across what could be a long-running, multi-day epic. Confirm before each one.

Interview the user before creating branches:

-   **Slices**: if there's an existing plan (e.g. from `implement-plan`) with numbered steps, use those as the slice boundaries and confirm the count; otherwise ask them to describe the epic and propose a slicing, then confirm it — don't invent slice boundaries unilaterally.
-   **Ticket scheme**: this team typically uses **one shared epic ticket across the whole chain**, with PRs numbered `[PR1]`, `[PR2]`, ... in their titles — confirm that's what's wanted here rather than assuming a sub-ticket per slice.
-   **Count check**: if the plan has more than ~10 steps, flag it before creating anything (see "When to stop and re-plan") rather than mechanically making a 14-PR chain.

## Rollout

**PR1 opens ready-for-review; PR2..N open as drafts incrementally**, each only once its own branch/commits actually exist — not all upfront. This keeps upfront churn low while still building the dependency graph naturally as work progresses.

## Naming convention

No prior real chain exists in this repo's history to copy exactly (a seeded example, `feat/datatable-pr1-toolbar` → `pr2-bidirectional-sync` → ..., confirms the merge-based sync convention but predates a ticket-based naming scheme — and also contains a decoy `feature/...` branch using the wrong, non-existent type prefix; don't copy that). This is a new convention layered onto the existing `<type>/<TICKET-ID>[-short-description][-vN]` pattern:

```
<type>/<TICKET-ID>-PRk-<short-description>
```

e.g. for a 4-PR chain against `DHIS2-18821`:

```
feat/DHIS2-18821-PR1-toolbar
feat/DHIS2-18821-PR2-bidirectional-sync
feat/DHIS2-18821-PR3-filtering
feat/DHIS2-18821-PR4-columns
```

Keeping one shared `TICKET-ID` (the epic's) across every branch in the chain makes the whole stack `grep`-able and sortable together: `git branch -a | grep DHIS2-18821-PR`.

PR titles get the bracketed position marker matching the user's real convention (confirmed by real `[PR7] [DHIS2-18242]`-style tags already seen in this team's PRs): `[PRk] <type>: <description> [<TICKET-ID>]`.

## Creating the chain

Build branches strictly in order, each one rooted on the previous, pushing and opening each PR before starting the next slice (so cross-links can reference real PR numbers) — confirming with the user before each push/`gh pr create`:

```bash
git fetch origin master

git checkout -b feat/DHIS2-18821-PR1-toolbar origin/master
# ... implement slice 1, commit ...
# ask before pushing:
git push -u origin feat/DHIS2-18821-PR1-toolbar
# ask before opening the PR:
gh pr create --base master --head feat/DHIS2-18821-PR1-toolbar \
  --title "[PR1] feat: add data table toolbar [DHIS2-18821]" \
  --body "$(cat <<'EOF'
Implements [DHIS2-18821](https://dhis2.atlassian.net/browse/DHIS2-18821)

### Chain

Part 1 of 4: **#<PR1> (this PR)** -> #<PR2 once opened>

- First in the chain — no dependency.
- Merge order matters: this must land before the rest of the chain.

### Description
...
EOF
)"
# capture the PR number gh just printed, e.g. PR1=1234

git checkout -b feat/DHIS2-18821-PR2-bidirectional-sync feat/DHIS2-18821-PR1-toolbar
# ... implement slice 2, commit ...
# ask before pushing:
git push -u origin feat/DHIS2-18821-PR2-bidirectional-sync
# ask before opening the draft PR:
gh pr create --draft --base feat/DHIS2-18821-PR1-toolbar \
  --head feat/DHIS2-18821-PR2-bidirectional-sync \
  --title "[PR2] feat: add bidirectional map/table selection sync [DHIS2-18821]" \
  --body "... Chain: Part 2 of 4: #<PR1> -> **#<PR2> (this PR)** -> #<PR3 once opened> ..."
# capture PR2's number, then ask before backfilling PR1's "Followed by":
gh pr edit <PR1> --body "<PR1's body with the Chain section's 'Followed by' line filled in as #<PR2>>"
```

Repeat for slices 3..N, each branch based on the previous, each new PR's body naming the ones before and after it, and each time backfilling the previous PR's "Followed by" line once the new PR's number exists. The tail PR (`PRN`) has no "Followed by" line.

Base branches are chained on purpose (`gh pr create --base <previous-branch>`, not `--base master`) — that's what makes each PR's diff show only that slice's own changes instead of the whole epic. Only PR1 targets `master`.

## PR body: chain cross-links

Add a `### Chain` section right after the `Implements [...]` line, before `### Description`:

```markdown
Implements [DHIS2-18821](https://dhis2.atlassian.net/browse/DHIS2-18821)

### Chain

Part 2 of 4 in the DHIS2-18821 chain: #1234 -> **#1235 (this PR)** -> #1236 -> #1237

-   Depends on: #1234 — merge that first.
-   Base branch: `feat/DHIS2-18821-PR1-toolbar` (retargets to `master` once #1234 merges).
-   Followed by: #1236.

### Description

...
```

**Gotcha:** `.github/workflows/check-tasklist.yml` (`Shopify/task-list-checker`) fails the PR on _any_ unchecked `- [ ]` box anywhere in the body, not just the Quality checklist section. Write the Chain section with plain `-` bullets, never `- [ ]` — an "unmerged dependency" checkbox would permanently block CI until PR1 merges and someone remembers to tick it.

Since there's no stacked-PR tooling installed (checked: no Graphite config, no `git-branchless`, no `gh` stacking extension, no relevant git aliases in this repo), merge-order is enforced purely by this text plus reviewer discipline — GitHub itself won't block someone from merging PR2 out of order.

## Propagating a change down the chain (all still open)

Team convention for keeping any branch in sync is **merge, never rebase** (this repo's history is full of `Merge branch 'master' into <feature-branch>` commits, no rebases — see `branch-update`) — apply the same rule between stack members while nothing has merged to master yet:

```bash
# PR1's branch got new commits (e.g. addressing review feedback)
git checkout feat/DHIS2-18821-PR2-bidirectional-sync
git fetch origin feat/DHIS2-18821-PR1-toolbar
git merge origin/feat/DHIS2-18821-PR1-toolbar
# resolve conflicts if any, commit the merge
# ask before pushing:
git push origin feat/DHIS2-18821-PR2-bidirectional-sync
```

Then cascade the same merge down the rest of the tail, one generation at a time, in order (pr2 into pr3, the _updated_ pr3 into pr4, ...) — don't skip a link. If several PRs changed around the same time, do one top-to-bottom pass rather than N separate passes.

If a merge conflicts, resolve it in place and commit — don't rebase to dodge the conflict. Rebasing here would both break convention and complicate the eventual squash-merge fix (below), since that fix already has to reason carefully about which commits are "real."

## After a stack member merges

The moment PR1 squash-merges, PR2's branch has a problem: it still contains PR1's original, unsquashed commits, but `master` now has a single new squash commit instead. PR2's diff against `master` will suddenly show PR1's _entire_ changeset again on top of its own — a huge, wrong, likely-conflicting "phantom diff." This is the classic stacked-PR-plus-squash-merge failure mode.

**Fix it immediately after the merge, before accepting further review feedback on PR2 if you can** — the phantom diff is confusing to any reviewer who opens PR2 in the meantime, and delaying lets the problem compound if PR3+ get merged down from PR2 before PR2 is fixed.

The fix is a `git rebase --onto`, re-anchoring PR2 directly onto the new `master` and dropping everything that came from PR1 (git's default rebase already drops merge commits and replays only PR2's own real commits — this is a genuine, narrow exception to "this team doesn't rebase": once a stack member has actually merged, there is no merge-based way to make the downstream branch's diff correct again). Full mechanics, the cascading effect on PR3..PRN, and a real limitation to watch for are in `references/squash-merge-sync.md` — read that before doing this the first time. Condensed version:

```bash
# 1. Get PR1's exact final head commit (works even if its branch was deleted post-merge —
#    GitHub keeps this ref forever). The read-only GH_TOKEN can do this step (a read).
git fetch origin refs/pull/<PR1_NUMBER>/head
OLD_PR1_TIP=$(git rev-parse FETCH_HEAD)

# 2. Re-anchor PR2 directly onto the new master
git fetch origin master
git checkout feat/DHIS2-18821-PR2-bidirectional-sync
OLD_PR2_TIP=$(git rev-parse HEAD)   # keep this — PR3 needs it next
git rebase --onto origin/master "$OLD_PR1_TIP" feat/DHIS2-18821-PR2-bidirectional-sync
# resolve any conflicts, then verify: lint/test/build before pushing — see reference doc for why
# ask before pushing (force-with-lease, since history was rewritten):
git push --force-with-lease origin feat/DHIS2-18821-PR2-bidirectional-sync
# ask before retargeting the base:
gh pr edit <PR2_NUMBER> --base master

# 3. Cascade the same treatment down the rest of the tail (PR3 onto PR2's new tip, etc.)
git checkout feat/DHIS2-18821-PR3-filtering
git rebase --onto feat/DHIS2-18821-PR2-bidirectional-sync "$OLD_PR2_TIP" feat/DHIS2-18821-PR3-filtering
# ask before pushing:
git push --force-with-lease origin feat/DHIS2-18821-PR3-filtering
# PR3's base stays pr2's branch — only the just-merged PR's immediate child retargets to master
```

After the cascade, the chain is back to "merge, not rebase" for any further changes among the remaining open PRs — this rebase pass is a one-time re-anchoring triggered specifically by a squash-merge, not a permanent change of technique.

**Known limitation** (full detail in the reference doc): plain rebase drops merge commits entirely, so if a past merge commit contained a real hand-resolution (not just mechanical merging), that fix silently vanishes and won't reappear as a conflict — mitigate by running the full suite after every rebase in the cascade, treating any failure as "re-add this as a new small commit," not as a sign the technique failed.

## Merge/review order discipline

-   Merge strictly top-down: PR1, then PR2, then PR3, ... Never merge a downstream PR first — its diff still contains every upstream PR's unsquashed commits, so merging it "early" would dump the whole epic onto `master` out of order and out of squash-granularity.
-   State this in every PR body's `### Chain` section (see above) — that's the only enforcement available; there's no installed tooling that blocks out-of-order merges.
-   After each merge, immediately run the "After a stack member merges" fix on the new head of the chain before anything else touches it.

## When to stop and re-plan

Don't mechanically keep propagating if:

-   The chain is at or approaching ~10 PRs (the user's own stated ceiling) — ship what's ready, and treat the remainder as a fresh, shorter chain rooted on the new `master` rather than growing the current one further.
-   A single propagation touches most of the remaining tail with real conflicts (not clean merges) — that usually means a slice boundary was wrong (shared/foundational work leaked into a later PR instead of an earlier one). Pause and discuss re-slicing rather than resolving conflict after conflict.
-   Only 1-2 PRs remain and they're small — consider whether it's still worth maintaining stack machinery versus just merging them into one PR.
-   Rule of thumb: if fixing one thing requires touching more than half the remaining stack with conflicts, stop and raise it with the user instead of continuing to merge-and-resolve.

## Chain health check

```bash
# Find every branch in a chain by its shared ticket ID
git branch -a | grep "DHIS2-18821-PR"

# Confirm branch k is still directly descended from branch k-1
git merge-base --is-ancestor origin/feat/DHIS2-18821-PR1-toolbar origin/feat/DHIS2-18821-PR2-bidirectional-sync && echo ok

# See what branch k adds on top of branch k-1 (should look like "just that slice", not the whole epic)
git log --oneline origin/feat/DHIS2-18821-PR1-toolbar..origin/feat/DHIS2-18821-PR2-bidirectional-sync

# Confirm GitHub's recorded base matches the chain (read-only GH_TOKEN is enough for this)
gh pr view <PR2_NUMBER> --json baseRefName,number,title
```

If a `..` diff between adjacent branches looks like the _whole epic_ rather than one slice, that branch is out of sync with a squash-merge upstream of it — go to "After a stack member merges".

## Related

-   `implement-plan` — a natural source of the numbered plan steps that become this chain's slices.
-   `manual-test-scenarios` — organizing "Manual testing" sections across a whole chain, since each PR gets its own Netlify preview.
-   `branch-update` — the simpler, single-branch version of "merge master in" this skill's own step reuses.
