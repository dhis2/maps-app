# Permission negotiation script

Run this before touching any file. Use `AskUserQuestion`.

## The one question — local operations only

> This will run for a while without stopping to ask each time. Pick one:
> (a) Grant the allowlist below for this session (I'll ask once via the permission prompt).
> (b) Switch to auto mode (`/permission-mode auto`) for the duration — a classifier reviews each command and only escalates risky ones.
> (c) Ask me before every command (default — slow, not really compatible with an unattended run; confirm you actually want this).

Concrete Bash patterns this workflow realistically needs — **all local, nothing that touches a remote**:

-   `Bash(yarn d2-style check*)` / `Bash(yarn lint*)` — touched-file and full-suite lint
-   `Bash(npx jest*)` / `Bash(yarn test*)` — touched-file and full-suite tests
-   `Bash(yarn build*)` — only if the plan's verification step needs it
-   `Bash(yarn cy:run*)` — only if the plan touches map rendering / Cypress-covered UI; ask specifically if it comes up, don't pre-grant broadly
-   `Bash(git status*)`, `Bash(git diff*)`, `Bash(git log*)`, `Bash(git add*)`, `Bash(git commit*)` — the commit cycle itself
-   `Bash(git merge*)` — for syncing master into the feature branch mid-flight (merge, not rebase — team convention, see `branch-update`)
-   `Skill(code-review)` / `Skill(code-review:*)` — per-step and final self-review
-   Edit/Write on the repo tree (implicit, not a Bash pattern)

**Deliberately never included here, no matter what — ask fresh, in the moment, only if actually reached (see the main SKILL.md's "Handoff" section):**

-   `Bash(git push*)`
-   `Bash(gh pr create*)`, `Bash(gh pr edit*)`, `Bash(gh pr ready*)`

This isn't a stricter default that can be relaxed by the user pre-authorizing further upfront — it's a hard boundary. Even a user who says "just go all the way through, don't stop" at the start of the run still gets a fresh, explicit ask at the actual push/PR-create moment.
