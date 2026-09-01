# Evidence gathering

## 1. Review window

Read `.claude/retros/.state.json`. If present, the window is `lastReviewedSha..HEAD`.

**Bootstrapping (first run, no state file yet):** don't default to this repo's entire history — that's almost certainly too large a window to produce a useful, bounded retro. Ask the user: "No prior retro state — since when should I look? Since the `.claude/` tooling was first added (`git log --diff-filter=A --format=%H -- CLAUDE.md | tail -1`), or a shorter window (last 30 days / since the last release tag / a specific date)?" State whichever is chosen in the eventual retro log.

## 2. Git history in the window

```bash
git log <window> --oneline                       # overview
git log <window> --stat -- .claude/               # did the tooling change by hand,
                                                   # outside this skill? worth understanding
                                                   # why, and noting even without a "suggestion"
git log <window> --name-only                      # spot new top-level dirs/patterns
git diff <window> -- package.json                 # new scripts/deps implying new
                                                   # commands worth documenting
```

## 3. This thread's own context

Free — no tool call needed. If this retro runs at the tail end of the session that did the work, everything discussed is already here: corrections the user gave, commands that failed and got worked around, places you had to ask the user something a skill should already have told you.

## 4. Other sessions' transcripts since the window started (best-effort, secondary)

Claude Code stores one JSONL transcript per session, under a per-project directory whose name is this repo's absolute path with `/`, `_`, and `.` replaced by `-`:

```bash
slug=$(printf '%s' "$CLAUDE_PROJECT_DIR" | sed 's/[\/_.]/-/g')
ls -t ~/.claude/projects/"$slug"/*.jsonl
```

Skim (grep/Read, don't fully parse the JSONL structure) files modified since `lastReviewedDate` for: the user correcting a factual/procedural claim, a tool call repeated many times in a row (thrashing), an explicit "that's frustrating" / "why doesn't X exist" remark. Treat this as **color, not primary evidence** — this is undocumented internal storage and its format could change between Claude Code versions; if the directory or files aren't there, skip silently and lean on git history + the interactive question instead.

## 5. Memory index

Same project slug, under `memory/` instead of the transcript directory: `~/.claude/projects/<slug>/memory/MEMORY.md` plus any `feedback-*.md`/`project-*.md` entries dated inside the window. A `feedback-*` entry is a strong signal — it exists because something already surprised or corrected the assistant once. If it also would have changed a skill's or `CLAUDE.md`'s guidance, that's this skill's business — cite it as evidence, but never edit or create memory files here.

## 6. `.claude/settings.local.json` signal (careful)

Read its `permissions.allow` list. A repeated, clearly-safe, repo-wide entry (e.g. a read-only `curl`/`git log` pattern used across multiple sessions) is worth a "promote to committed `settings.json`" suggestion. Do **not** propose promoting anything that looks personal or machine-specific (local absolute paths, one-off debug commands) or anything write-capable — err toward not suggesting if unsure. This file is gitignored on purpose (personal, per this repo's convention); most of its entries should stay personal.

## 7. Ask, if evidence is thin

If steps 2-6 don't add up to anything concrete, ask directly: "What was frustrating, manual, or surprising this stretch?" — one open question, not a checklist interrogation. "Nothing, it was smooth" is a valid, complete answer.
