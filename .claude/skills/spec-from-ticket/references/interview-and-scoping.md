# Interview and scoping guidance

## Order of operations

1. Explore first (subagent), interview second. The interview should be _informed_ by what the code actually looks like — "I see two existing dialogs use pattern X vs. pattern Y for this, which do you want?" beats a generic open-ended question.
2. If the interview surfaces a decision that changes which files are affected, do a second, narrower Explore pass before handing off to `spec-writer` — again via subagent, so it doesn't cost the main session's context.
3. Hand off to `spec-writer` last, once decisions are made.

## What to ask

-   **Real technical forks**: at least two reasonable implementations exist, and the ticket doesn't pick one (new layer type vs. config on an existing layer; Redux thunk vs. local component state).
-   **Unstated scope boundaries**: does this need to work in the dashboard plugin (no Redux store — see `map-layer-architecture` skill) as well as the standalone app? One layer type or all of them?
-   **Edge cases the AC is silent on**: empty states, permission/authority checks, what happens on API failure.
-   **Tradeoffs against repo norms**: e.g. this app is in "live, released app" mode per `CLAUDE.md` — prefer minimal diffs over opportunistic refactors. If a ticket's ask nudges toward a bigger refactor than strictly needed, surface that tradeoff explicitly rather than silently picking the bigger scope.

## What NOT to ask

-   Anything answerable by reading the code — that's what the Explore pass is for.
-   Anything already stated in the ticket description or AC.
-   Generic questions with one obviously-sane default — write the default into the spec's "Assumptions" section instead of interrupting the user. Reserve `AskUserQuestion` for things where a wrong guess would be expensive to unwind.

## Batching

Use `AskUserQuestion` with multiple questions in one call rather than serial round-trips. Stop interviewing once the remaining unknowns are cheap to fix later (i.e. would just mean editing the spec, not re-architecting).
