---
name: pre-review
description: Use before converting a PR from draft to "ready for review" — the final quick self-check so issues get caught before a human reviewer spends time on them. Verifies tests (Jest and Cypress), SonarQube, code quality/conventions, and the PR title/description, in that order.
---

# Pre-review

Still iterating on feedback from manual testing? Use `pr-polish` instead — come back here once a round of testing passes clean; this is the last, quick pass, not the place to work through a fix list.

Before marking a PR ready for review and requesting a human review, verify all four in order:

## 1. Zero failing tests

```
yarn lint && yarn test
```

Plus any relevant `yarn cy:run <spec>` if the change touches map rendering or other Cypress-covered UI. Don't proceed past this step with anything red.

## 2. Zero remaining SonarQube issues

Query the same anonymous SonarCloud endpoint `/sonarqube-fix` uses:

```
curl -s "https://sonarcloud.io/api/issues/search?projectKeys=dhis2_maps-app&pullRequest=<pr-number>&resolved=false&ps=100"
```

If anything's still open, fix it now in the same BLOCKER→INFO order `/sonarqube-fix` uses, or explicitly hand off to that command if the list is long. Don't mark ready with open issues on this PR.

## 3. Code quality

Self-review the diff — either invoke the `/code-review` skill, or fetch it directly (`gh pr diff`) and read it critically. Specifically check for, not just "does it look reasonable":

-   **DRY** — logic duplicated across files/components that should share a helper.
-   **Convention adherence** — matches this repo's real patterns (`CLAUDE.md`, and the `map-layer-architecture` skill for anything layer-related), not a plausible-but-different approach.
-   Correctness bugs and genuine simplification opportunities — not style nits.

## 4. PR title/description

Complete, succinct, "what"-focused (not overlong on "why"/"how"), and matches `.github/pull_request_template.md`'s structure exactly — see the `commit-and-pr-messages` skill for the format rules rather than re-deriving them here. Every `- [ ]` in the body must be genuinely expected to complete or replaced with `_N/A_` — `check-tasklist.yml` blocks the PR on any unchecked box left anywhere in it, not just the Quality checklist section.

## 5. Check CI, then mark ready

```
gh pr checks
```

Don't mark ready while checks are still running or failing. Marking ready (`gh pr ready`) is a remote write — per this repo's universal rule, this always needs a fresh, explicit, in-the-moment ask before running it, regardless of how this skill was invoked; never treat "the user asked for a pre-review" as blanket permission to also mark the PR ready without asking separately.

If `gh` isn't set up (no `GH_TOKEN` configured yet), use `curl` against the public GitHub REST API instead:

-   Diff: `curl -s -H "Accept: application/vnd.github.v3.diff" "https://api.github.com/repos/{owner}/{repo}/pulls/{n}"`
-   Checks: `curl -s "https://api.github.com/repos/{owner}/{repo}/commits/{sha}/check-runs"`
-   PR number for the current branch: `curl -s "https://api.github.com/repos/{owner}/{repo}/pulls?head={owner}:{branch}&state=open"`

`{owner}/{repo}` comes from `git remote get-url origin`; `{branch}` from `git rev-parse --abbrev-ref HEAD`.
