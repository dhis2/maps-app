---
name: claude-stack-retro
description: Use at a natural checkpoint after a chunk of work — end of a session, right after a PR merges, weekly — to look back over that stretch (which may span many separate Claude Code conversations over days or weeks) and propose concrete updates to this repo's own .claude/ tooling: new/changed skills, missing subagents, CLAUDE.md gaps. Never edits .claude/skills/*, .claude/agents/*, .claude/commands/*, or CLAUDE.md itself — proposes only, and logs the outcome so a rejected idea doesn't resurface.
disable-model-invocation: true
---

# Claude stack retro

Explicit `/claude-stack-retro` invocation only. Its own side effects are light (it writes a local log + a local state file, nothing else) — it's gated on explicit invocation because _when_ to retrospect is a deliberate checkpoint the user picks, not something worth guessing at automatically.

| Situation                                                                                                                 | Do this                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| First run in this repo (`.claude/retros/.state.json` doesn't exist yet)                                                   | Bootstrap the window — see `references/evidence-gathering.md`                                                |
| Evidence from steps 2-6 doesn't add up to anything concrete                                                               | Ask the user directly what was frustrating/manual/surprising — a "nothing" answer is a complete, valid retro |
| A candidate finding's fingerprint matches `rejectedFingerprints` in state                                                 | Skip it silently — don't re-propose (see `references/output-and-state.md`)                                   |
| A candidate touches `.claude/skills/*`, `.claude/agents/*`, `.claude/commands/*`, `CLAUDE.md`, or `.claude/settings.json` | Never edit directly, ever — propose only                                                                     |
| Checking whether a PR/merge actually happened as evidence                                                                 | Read-only `gh`/`curl` only — never `gh pr merge/edit/ready`, per this repo's universal remote-write rule     |

## What this is (and isn't)

This is about **this repo's own `.claude/` tooling** — skills, subagents, `CLAUDE.md`, hooks, commands. It is a different, narrower thing than the assistant's cross-project memory system (`~/.claude/projects/.../memory/`) — memory persists preferences/corrections _across_ repos and sessions; this skill's output is proposed edits to files committed _in this one repo_. It reads memory as one input signal (an unresolved `feedback-*` entry may point at a real gap in a skill) but never writes memory entries itself — that stays the memory system's own job.

## 1. Determine the review window

Read `.claude/retros/.state.json`. If present, the window is `lastReviewedSha..HEAD`. If missing, this is the first run — see "Bootstrapping the window" in `references/evidence-gathering.md` rather than guessing at a start point.

## 2. Gather evidence

Full detail and exact commands in `references/evidence-gathering.md`. In priority order: git log/diff since the marker (with `.claude/**` changes called out separately) → this thread's own context, free, if you're at the tail end of the session that did the work → memory index entries dated inside the window → `.claude/settings.local.json`'s allow-list as a careful signal (see the caution there — never propose committing that file itself) → other sessions' transcripts since the marker, best-effort/secondary → asking the user directly if the above is thin.

## 3. Analyze — don't manufacture findings

Work through `references/analysis-checklist.md`. The governing rule, adapted from Anthropic's own reviewer-gap caution ("a reviewer prompted to find gaps will usually report some, even when the work is sound"): **only surface a suggestion that would plausibly recur, or that already caused friction or a mistake this stretch** — never "this could theoretically be tidier." If nothing clears that bar, say so and stop; a short or empty retro is a correct outcome.

## 4. Fresh-eyes pass (only if step 3 produced at least one candidate)

Dispatch a plain, fresh-context subagent (Task tool, general-purpose — no bespoke persona file needed, same mechanism `implement-plan` uses for its own end-of-run diff review, and the same "use an Explore subagent" pattern already established in `dhis2-web-api-research`) with **only the raw evidence** you gathered in step 2 — git log/diff excerpts, transcript excerpts, memory entries — not your own draft candidate list. State explicitly in its prompt: read-only, no Edit/Write/git-write/gh-write, just analyze the evidence against the same checklist and report independently.

Reconcile: keep anything either of you found with solid evidence behind it. Drop anything only you found that the fresh pass didn't independently surface and that isn't obviously supported by the evidence alone — that combination is a sign of rationalizing rather than observing.

## 5. Present, never auto-apply

For each surviving suggestion, in this shape (full template in `references/output-and-state.md`): **what** (concrete file/skill/section) / **why** / **evidence** / a **sketch** of the change (a short diff-style snippet for a small edit, or a frontmatter + section-header outline for a new skill/subagent — never a fully polished file inline) / **how to apply** (re-enter Plan Mode for anything nontrivial; direct in-the-moment approval for a one-line addition).

Ask per suggestion, not once for the whole batch — accept / reject / defer. Nothing under `.claude/skills/*`, `.claude/agents/*`, `.claude/commands/*`, `CLAUDE.md`, or `.claude/settings.json` is touched until the user says so for that specific item.

## 6. Log and update state

Write `.claude/retros/YYYY-MM-DD.md` recording every suggestion and its outcome, and update `.claude/retros/.state.json` (`lastReviewedSha`/`lastReviewedDate`, plus any newly-rejected fingerprint). Exact schemas in `references/output-and-state.md`. Writing these files is a local edit like any other (no ask needed — same as `spec-from-ticket` writing its spec file) — but `git add`/`git commit` on them still needs the user's explicit ask, per this repo's existing convention.

## Scope discipline

-   **Cap ~5-7 suggestions per run.** More than that means the window is too large — say so, and recommend running retros more often, rather than dumping a long backlog in one pass.
-   **Skip one-offs.** A single typo or a one-time workaround for something already fixed doesn't earn a slot — only recurring/structural friction does.
-   **Prefer the smallest fix.** A one-line addition to an existing skill's decision table or to `CLAUDE.md` beats a brand-new skill file whenever it covers the same ground — new skill/subagent files are the heaviest suggestion type, reserve them for genuinely repeated multi-step workflows (mirrors `pr-chain`'s own "when to stop and re-plan" restraint).
-   **Never** edits `.claude/skills/*`, `.claude/agents/*`, `.claude/commands/*`, `CLAUDE.md`, or `.claude/settings.json` itself, and never runs `git push`/`gh pr *` — every suggestion is proposed, the user decides, every time, per this repo's universal remote-write/no-silent-tooling-edit rule.

## Optional argument

`/claude-stack-retro --since <date-or-sha>` overrides the stored marker for this run's _analysis_ start point without corrupting state — `.state.json` still advances to the real `HEAD` at the end of the run, same as a normal invocation.
