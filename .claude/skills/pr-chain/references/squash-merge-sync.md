# Squash-merge sync: why PR2 breaks when PR1 merges, and how to fix it

## The failure mode, concretely

Say `feat/DHIS2-18821-PR1-toolbar` has commits A, B, C. `feat/DHIS2-18821-PR2-bidirectional-sync` was branched from it and has its own commits D, E, plus a couple of `Merge branch 'pr1...' into pr2...` merge commits picked up while PR1 was still being revised. Its ancestry is:

```
master(old) - A - B - C - [merge] - D - [merge] - E     <- pr2 branch tip
```

PR1 merges to `master` via squash. `master` now looks like:

```
master(old) - S                                          <- S = squash of A+B+C, one commit
```

PR2's diff is computed as `git diff master...pr2-branch` (merge-base to tip). The merge-base of `master`(new) and `pr2-branch` is still `master(old)` — S is a _sibling_ of A/B/C, not a descendant of them, so `master`(new) doesn't dominate A/B/C at all. The diff therefore includes A, B, C's changes a second time (once as the squash commit's shadow, once as pr2's own inherited history) stacked on top of PR2's real D/E changes. Result: PR2 in the GitHub UI suddenly shows the entire epic's diff, usually with conflicts, even though nothing about PR2's actual intent changed.

## Why `git rebase --onto` is the right tool here (and why it's an exception)

This team's rule for keeping branches in sync is merge, not rebase (confirmed: this repo's history is full of `Merge branch 'master' into <feature>` commits and has no rebases). That rule works precisely because merging never changes commit identity — A/B/C keep their SHAs everywhere they're merged in, so nothing downstream ever gets confused about what's "already there."

Squash-merging breaks that invariant on GitHub's side, not this team's: `master` gets a _new_ commit (S) with a _new_ SHA that has no ancestry relationship to A/B/C at all. There is no merge you can perform that fixes this — merging `master`(new) into `pr2-branch` would just add S alongside A/B/C, worsening the duplication rather than resolving it. The only way to make PR2's diff correct again is to give PR2 a history where A/B/C literally aren't there anymore, replaced by "master already has S." That requires rewriting pr2-branch's history — a rebase. This is a deliberate, narrow exception: rebase only at the moment a stack member has _merged_, and only to re-anchor the immediate child, never as a general substitute for the merge convention above.

## The fix, step by step

### 1. Get PR1's exact final commit — before its branch ref disappears

Repos with "delete head branch on merge" enabled remove `origin/feat/DHIS2-18821-PR1-toolbar` right after merge. GitHub keeps a permanent ref for every PR regardless: `refs/pull/<PR1_NUMBER>/head`, resolvable forever, readable through the project's normal read-only `GH_TOKEN` (this is a read, not a write):

```bash
git fetch origin refs/pull/<PR1_NUMBER>/head
OLD_PR1_TIP=$(git rev-parse FETCH_HEAD)
```

Equivalent alternative (also read-only-token-safe): `gh pr view <PR1_NUMBER> --json headRefOid -q .headRefOid`.

Do this as early as possible after seeing the merge notification — don't rely on the local `feat/DHIS2-18821-PR1-toolbar` branch still being the right pointer; if PR1 got any late-breaking commits right before merge that never made it to your local checkout, the ref-based fetch is the authoritative source.

### 2. Re-anchor PR2 onto the new master

```bash
git fetch origin master
git checkout feat/DHIS2-18821-PR2-bidirectional-sync
OLD_PR2_TIP=$(git rev-parse HEAD)     # save this before rewriting — PR3 needs it
git rebase --onto origin/master "$OLD_PR1_TIP" feat/DHIS2-18821-PR2-bidirectional-sync
```

What this actually does: plain `git rebase` (no `--rebase-merges`/`-p`) walks the range `$OLD_PR1_TIP..pr2-branch`, **drops every merge commit in that range entirely**, and replays only the ordinary (non-merge) commits — i.e. exactly D and E, PR2's own real work — on top of `origin/master`. Since `$OLD_PR1_TIP` is A/B/C's own tip, A/B/C themselves are excluded from the range in the first place (they're ancestors of the boundary, not part of it). No manual commit-picking is needed; this is git already doing "PR2's own commits only," automatically and correctly.

Verify before pushing — run the full lint/test/build, not just a conflict-free `rebase --continue` (see "Known limitation" below), then, after an explicit, in-the-moment ask (this repo's universal remote-write rule — the rebase rewrote history, so this push needs `--force-with-lease`, which makes the ask especially important):

```bash
git push --force-with-lease origin feat/DHIS2-18821-PR2-bidirectional-sync
gh pr edit <PR2_NUMBER> --base master
```

If GitHub already auto-retargeted PR2's base to `master` because it deleted `pr1`'s branch, `gh pr edit --base master` is a no-op — safe to run either way. Retargeting the base alone does **not** fix the diff; the rebase is what fixes the diff, retargeting the base is just bookkeeping so GitHub compares against the right side going forward.

### 3. Cascade down the rest of the tail

PR3 was based on PR2, but PR2's commits just got new SHAs. A merge of the rebased PR2 into PR3 would not resolve the duplication — it needs the same `--onto` treatment, using PR2's _pre-rebase_ tip (saved as `$OLD_PR2_TIP` above) as the boundary. As before, verify with the full suite before pushing, and get an explicit, in-the-moment ask before the push itself — this repo's universal remote-write rule applies to every push in this cascade, not just the first one:

```bash
git checkout feat/DHIS2-18821-PR3-filtering
git rebase --onto feat/DHIS2-18821-PR2-bidirectional-sync "$OLD_PR2_TIP" feat/DHIS2-18821-PR3-filtering
git push --force-with-lease origin feat/DHIS2-18821-PR3-filtering
```

PR3's _base_ branch setting doesn't change here — it's still `feat/DHIS2-18821-PR2-bidirectional-sync`, just now pointing at that branch's new tip. Repeat the same pattern for PR4..PRN, always using the previous branch's pre-rebase tip as the boundary and its post-rebase tip as the new base. Do the whole cascade top-to-bottom in one sitting — a half-migrated stack (PR2 fixed, PR3 not) is worse than not starting, since PR3's diff is now broken in a _new_ way relative to the just-rewritten PR2.

Once the cascade reaches the tail, resume plain merge-based propagation for any further changes among the remaining open PRs (see the main `SKILL.md`) — this rebase pass is one-time, triggered by the merge event, not an ongoing change of technique.

## Known limitation: merge-commit-only resolutions get silently dropped

Because plain rebase drops merge commits from the replay list entirely, if a past `Merge branch 'pr1' into pr2` was more than a mechanical merge — e.g., it hand-resolved a real conflict by updating a call site for a function PR1 renamed — that resolution lives _only_ in the merge commit's own diff, not in any of D/E. Dropping the merge commit drops that fix too, and because the surrounding text often still applies cleanly against the new base, this usually does **not** show up as a rebase conflict — it just silently reverts, and you find out later from a broken build or a failing test.

Mitigation: after every rebase in this cascade, before pushing, run the full build/lint/test suite — don't rely on "the rebase completed without conflicts" as a correctness signal. Treat any resulting failure as "this logic needs to be re-added as a new small commit on top," not as evidence the technique is wrong.

## Why not the alternatives

| Technique                                                                            | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git rebase --onto <new-master> <old-PR1-tip> <branch>` (chosen)                     | Automatically replays exactly the downstream branch's own non-merge commits onto the new master. Same result as manual cherry-picking, with git doing the sequencing.                                                                                                                                                                                                                                                                                                         |
| Manually recreate the branch from `master` and cherry-pick each of PR2's own commits | Produces an identical result to `rebase --onto` (same commit set, same order), but requires hand-enumerating `git log --no-merges <old-PR1-tip>..pr2-branch` and cherry-picking one at a time — more manual bookkeeping for no behavioral difference. Worth falling back to only if you also want to interactively squash/reorder PR2's own fixup commits (e.g. folding "chore: sonarqube issues" into the commit it's fixing) while you're already rewriting history anyway. |
| `git rebase --rebase-merges --onto ...`                                              | Reconstructs the merge topology instead of flattening it — which means it _replays_ the old `Merge branch master into pr1`/`Merge branch pr1 into pr2` merges too, reintroducing exactly the duplicate-content conflict against the new master that this whole exercise exists to avoid. Does not fix the problem.                                                                                                                                                            |
