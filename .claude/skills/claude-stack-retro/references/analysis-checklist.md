# Analysis checklist

Work through these; a "no" is a fine answer for most of them, most of the time. The bar for surfacing a suggestion: **it would plausibly recur, or it already caused friction or a mistake this stretch** — not "this could theoretically be tidier." (The same caution Anthropic's own best-practices doc gives about review prompts always finding _something_ — don't manufacture busywork here either.)

1. **Repeated manual sequence → candidate skill.** The same ≥3-step Bash/tool sequence shows up across ≥2 separate sessions or commits in the window, with no skill covering it yet.
2. **Existing skill gave wrong/stale/incomplete guidance.** A skill or reference doc names a command, file, or convention that a commit in the window changed or removed; or the transcript shows the user correcting something a skill said.
3. **New file/architecture pattern `CLAUDE.md` doesn't mention.** A new top-level directory, state pattern, build step, or repo convention appears in the window's commits with no matching line in `CLAUDE.md`.
4. **A subagent would have helped but didn't exist.** The transcript/history shows the same skill improvising a different tone/persona more than once — not "this would be nice," only "this concretely happened and cost something."
5. **A mid-session correction reveals a missing standing rule.** The user said "don't do X" / "actually we always Y" — check it isn't already captured in `CLAUDE.md`, a skill, or memory; if genuinely new and phrased like a standing rule (not a one-off aside), it's a candidate `CLAUDE.md`/skill line. (This is exactly how this repo's own universal remote-write rule was born — one clear correction, documented once, applied everywhere. One clear correction can be enough; ten vague mentions of the same thing are one finding, not ten.)
6. **A referenced command/file no longer resolves.** Spot-check commands named in touched skills against `package.json` scripts / actual file paths — a skill telling the agent to run something that no longer exists is always worth flagging, regardless of how it was found.
7. **Old-style artifact newly inconsistent.** e.g. `.claude/commands/sonarqube-fix.md` predates the skills convention — true every retro, so don't flag it every retro just because it's still true; only surface it if something in _this_ window makes the inconsistency newly load-bearing (e.g. it needed the universal remote-write rule applied to it and doesn't have it).
8. **`.claude/settings.local.json` drift** — see the caution in `references/evidence-gathering.md`.

Do not turn this into a linter. If nothing here clears the "would recur / already cost something" bar, the correct output is "nothing rose to that bar this stretch" — a complete, successful run, not a weak one.
