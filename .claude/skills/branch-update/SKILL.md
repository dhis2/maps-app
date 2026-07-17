---
name: branch-update
description: Bring the current feature branch up to date with master by merging (not rebasing) origin/master in — this team's real convention — then resolve any conflicts. Creates a merge commit, so only run when the user explicitly asks; notice and mention a stale branch, don't auto-run this.
disable-model-invocation: true
---

# Branch update

This repo's real convention is **merge master into the feature branch**, repeatedly, during development — not rebase. The whole branch gets squash-merged into master via the PR at the end, so the intermediate merge commits never land on master's mainline; they only exist in the feature branch's own history. Don't rebase, and don't "clean up" these merge commits afterward — they're the norm, confirmed by real history (e.g. `Merge remote-tracking branch 'origin/master' into chore/setup-claude`).

This skill creates a merge commit. `CLAUDE.md`'s "don't stage or commit unless explicitly asked" applies to merge commits too — that's why this skill requires explicit invocation. If you notice a branch is stale, say so; don't run this unasked.

## Steps

1. **Fetch.**
    ```
    git fetch origin master
    ```
2. **Check how stale you actually are** before merging blindly:
    ```
    git log --oneline HEAD..origin/master
    git log --oneline origin/master..HEAD
    ```
    Skip the merge entirely if there's nothing new to bring in.
3. **Merge.**
    ```
    git merge origin/master
    ```
4. **No conflicts** — done. Mention the new merge commit exists; pushing it is a remote write and per this repo's universal rule needs its own explicit, in-the-moment ask, same as any other push.
5. **Conflicts** — see below. Never resolve by blindly taking "ours" or "theirs" wholesale; read both sides first.

## Resolving conflicts

For each conflicted file:

1. Read the full conflict region plus enough surrounding context to understand _why_ each side changed it — not just what the diff lines say. `git log -p` on the conflicting commits from each side shows intent.
2. Prefer the minimal resolution that preserves _both_ changes' purpose — e.g. two additions to the same list/switch/reducer usually both belong, even when git can't auto-merge the surrounding lines.
3. After resolving, remove the conflict markers completely and re-read the result as if reviewing someone else's diff — a resolution that merges syntactically but silently drops one side's behavior is worse than an open conflict.
4. Run the touched files' tests (`npx jest <file>`) plus `yarn d2-style check <file>` on every file you resolved, then the full `yarn lint && yarn test` before considering the merge done.

### When to stop and ask instead of resolving

Stop and hand back to the user — don't guess — when a conflict is a genuine business-logic collision, not line-adjacency noise: both sides changed the _behavior_ of the same function/condition in ways that don't obviously compose (one side changed a threshold, the other changed the formula it feeds into; one side removed a code path the other just extended). Signs it's this kind, not a mechanical one:

-   Resolving it requires deciding which behavior is "more correct," not just how to combine two edits.
-   The two sides touch the same logic for unrelated reasons (different tickets), and combining them isn't obviously safe without domain knowledge you don't have.

In that case, **leave the conflict markers in place** — don't `git merge --abort` unless the user asks you to. Run `git status` to show which files are still unresolved, describe what each side was trying to do, and ask the user how to reconcile them. Aborting loses the "you got this far" context for no benefit once you've already identified the ambiguity; leaving it in progress preserves both sides' intent for the user to inspect directly.

## Done when

-   `git status` shows a clean merge (no unresolved paths).
-   `yarn lint && yarn test` pass.
-   The merge commit's message is left as git's default (`Merge branch 'master' into <branch>` / `Merge remote-tracking branch 'origin/master' into <branch>`) — don't rewrite it to Conventional Commits format. These merge commits are exempt: they never land on master's mainline after the eventual squash-merge, and this team's real history confirms the default message is what's actually used.

## Related

-   `commit-and-pr-messages` — for the _feature_ commits this branch carries, not the merge commit created here.
-   `pr-chain` — has its own, more involved version of this problem once a stack member actually squash-merges (a plain merge stops working at that point; see that skill's `references/squash-merge-sync.md`).
