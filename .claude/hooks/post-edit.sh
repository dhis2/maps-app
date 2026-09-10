#!/usr/bin/env bash
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

case "$file" in
    *.js | *.jsx | *.css | *.json | *.md | *.yml | *.yaml) ;;
    *) exit 0 ;;
esac

output=$(yarn d2-style apply "$file" 2>&1)
status=$?

if [ "$status" -ne 0 ] || printf '%s' "$output" | grep -q '\[warn\]'; then
    notes=$(printf '%s\n' "$output" | grep -vE '^\$ |^yarn run|^Done in|^info Visit|^\s*$')
    jq -n --arg ctx "$notes" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
fi

exit 0
