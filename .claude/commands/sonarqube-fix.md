# SonarQube Issue Resolution Workflow

Fix SonarQube quality gate issues for the current branch's PR, fetching issues directly from the SonarCloud API and addressing them in priority order.

**Note**: this project (`dhis2_maps-app` on SonarCloud) is public, so every call below works anonymously — no `SONAR_TOKEN` needed. There is no local scanner/CI step to run — analysis happens automatically server-side on every push (SonarCloud "Automatic Analysis"), so there's no local "publish" step, just push and wait.

## Instructions

### 1. Identify the PR

```bash
gh pr view --json number,title -q '"#\(.number) \(.title)"'
```

No `gh`/`GH_TOKEN` set up yet? Use the public GitHub REST API instead:

```bash
git remote get-url origin  # → parse org/repo
curl -s "https://api.github.com/repos/<org>/<repo>/pulls?state=open&head=<org>:$(git rev-parse --abbrev-ref HEAD)" \
  | jq -r '.[0].number'
```

### 2. Fetch and prioritize issues

```bash
curl -s "https://sonarcloud.io/api/issues/search?componentKeys=dhis2_maps-app&pullRequest=<pr-number>&resolved=false&ps=100" \
  | jq -r '.issues[] | "\(.severity) - \(.type) - \(.message) - \(.component):\(.line)"' | sort
```

Fix order: **BLOCKER → CRITICAL → MAJOR → MINOR → INFO**, and within a severity, BUG before CODE_SMELL. Group by rule — fix every instance of the same rule together.

Create a todo list (TodoWrite) with every issue before starting fixes, so progress stays visible.

### 3. Fix in priority order

For each issue: read the file for context, understand what's being flagged and why, apply the minimal fix that addresses it — don't refactor beyond what's reported.

### 4. Test after each batch

After every 3-5 related fixes:

```bash
yarn lint && yarn test
```

Fix regressions immediately rather than accumulating unverified changes.

### 5. Push and let Automatic Analysis catch up

There's no local scanner to run. Push the commit, then re-poll the PR-scoped issues endpoint from step 2 — SonarCloud's GitHub App re-analyzes automatically on push, usually within a couple of minutes. Poll every 15-20s, capped at ~5 minutes so a stuck webhook doesn't hang the workflow.

### 6. Done when

-   All todos completed
-   `yarn lint && yarn test` pass
-   The PR-scoped issues query returns none of the issues you fixed

## Troubleshooting

-   **No matching PR** — confirm the branch has an open PR (`gh pr list` or the GitHub UI).
-   **Issues still show after pushing** — re-analysis can lag a few minutes; re-poll rather than assuming the fix didn't take. If issues persist past ~5 minutes, check the PR's checks tab for a failed analysis run.
-   **`gh` not authenticated** — not required; all the calls above work anonymously against this public repo.
