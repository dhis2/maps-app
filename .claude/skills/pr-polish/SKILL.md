---
name: pr-polish
description: Use when iterating on an already-open PR across multiple rounds of manual testing and feedback — organizing fix lists, re-verifying each fix narrowly, and deciding when to hand off to the pre-review skill for the final self-check. Heavier and more interactive than pre-review, which is only the last quick pass.
---

# PR polish

The umbrella workflow for an open PR (yours, or handed off from another Claude session) that isn't done after one pass — the user manually tests, reports back a list of things to fix, Claude fixes them, and this repeats until the user is satisfied. `pre-review` is the last, quick step of this loop, run once per "I think we're done" moment — not a replacement for it.

| Situation                                                      | Do this                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Picking this PR up cold (new session, or another agent's work) | Orient first — step 1                                                                |
| User just handed you a list of desired fixes                   | Turn it into a todo list — step 2                                                    |
| A fix from the todo list is implemented                        | Verify narrowly, not the whole suite — step 3                                        |
| Todo list is fully checked off                                 | Report back and wait for the next round of manual testing — don't assume you're done |
| User says something like "I think this is it" / "ship it"      | Run the `pre-review` skill — step 4                                                  |
| `pre-review`'s self-review surfaces a new issue                | Loop back to step 2 — see "Repeated final passes"                                    |

## 1. Orient

Before touching anything, confirm what state the PR is actually in — don't assume your session's memory matches reality, especially if earlier rounds happened without you:

```
gh pr view --json number,title,body,state
gh pr diff
```

Skim the diff and the PR body's ToDos/Known issues sections; don't re-litigate decisions already reflected there.

## 2. Turn feedback into a todo list

When the user gives you a batch of fixes (from manual testing, a review comment, a screenshot, whatever), convert each distinct item into a `TodoWrite` entry before starting on any of them — this keeps the list visible and resumable across a long session, the same pattern the `sonarqube-fix` command uses for its issue list. Word each item as a concrete, checkable outcome ("org unit dialog closes on Escape"), not a vague restatement ("fix the dialog").

If an item is ambiguous, ask rather than guessing — this workflow exists because manual testing catches things automated tests don't, so precision matters more than speed here.

## 3. Fix, then verify narrowly

For each todo:

1. Implement the fix.
2. Verify just that fix — the touched file(s), per `CLAUDE.md`'s "Lint/test workflow for agents" (`npx jest <file>`, `yarn d2-style check <file>`). Don't run the full `yarn lint && yarn test` after every single item; that's step 4's job.
3. Mark the todo complete and tell the user _specifically_ what changed and what to re-check — manual testing only catches regressions if the user knows where to look.

Run the full suite after a batch (roughly 3-5 related fixes, or whenever the todo list empties) — same cadence as `sonarqube-fix`.

Don't commit as you go unless the user asks — `CLAUDE.md`'s "don't stage or commit unless explicitly asked" applies throughout this loop, not just at the very end.

### Keeping the PR body honest (optional, ask first)

If a Quality checklist item becomes true (tests added, dashboard tested, etc.), propose the updated checklist text to the user. Never leave a box unchecked that's actually done, and never leave `- [ ]` on something that turned out not to apply — replace it with `_N/A_` per the template's own instruction. `check-tasklist.yml` blocks the PR while _any_ unchecked box exists anywhere in the body, so an accurate checklist matters more here than in most repos.

Editing the PR body is a remote write (`gh pr edit`) — per this repo's universal rule, propose the text and get an explicit, in-the-moment ask before applying it, every time. Never apply it just because the checklist item is objectively true now.

## 4. Know when it's actually done

Finishing the current todo list means "ready for another round of manual testing," not "ready for review." Only move to the final pass when the user explicitly confirms the current round passed clean — then invoke `pre-review`.

### Repeated final passes

`pre-review`'s self-review step can itself surface a new issue. When it does: add it as a new todo (step 2), fix and verify it (step 3), then re-run `pre-review` from the top — a changed diff needs a fresh lint/test/self-review pass, not a partial re-check of just the new lines. If you're on a third or later `pre-review` pass for the same PR, say so explicitly — that's often a sign of a design question worth discussing rather than another quick fix.

## See also

-   `pre-review` — the final quick self-check this workflow hands off to once the user confirms a round of testing passed.
-   `sonarqube-fix` — the same todo-list-per-batch pattern, applied to SonarCloud findings instead of user-reported fixes.
-   `commit-and-pr-messages` — format rules for the PR title/description this skill helps keep accurate.
