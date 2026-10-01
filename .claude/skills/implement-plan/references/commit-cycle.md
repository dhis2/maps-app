# Commit granularity and message drafting

## Splitting/merging plan steps into commits

-   Default: one commit per numbered "Implementation plan" step, if the plan came from `spec-from-ticket` (that skill deliberately writes steps at commit granularity).
-   Split a step if it spans clearly unrelated files/concerns.
-   Merge adjacent steps if either one alone would leave the tree non-compiling or tests red (e.g. "add action creator" + "wire into reducer" — neither makes sense alone).
-   Rule of thumb before committing: `yarn lint` and the touched-file tests should be green. Avoid deliberately-broken intermediate commits.

## Commit message format

See the `commit-and-pr-messages` skill for the full format rules and real examples. In short: Conventional Commits, `<type>: <description> [<TICKET-ID>]`, header ≤120 chars, **never** append `(#PRNUM)` (GitHub adds that automatically at squash-merge), **never** hand-write a `chore(release):` message.

These are step-commits on a feature branch that will eventually be **squash-merged** — so the final PR title matters more for permanent history than any individual step message, but step messages still matter for reviewers reading commit-by-commit, so don't get sloppy just because they'll be squashed away.

## Mid-flight master sync

If the run is long enough that `master` moves meaningfully, **merge** master into the feature branch (this team's real convention — see the `branch-update` skill — never rebase), then re-run the full suite before continuing. This falls under the pre-negotiated `git merge*` allowlist entry — do it, but say so in the summary, don't do it silently.
