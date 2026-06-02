#!/usr/bin/env bash
FILE=$(node -e "
  try {
    const d = JSON.parse(process.env.TOOL_INPUT || '{}')
    console.log(d.file_path || '')
  } catch(e) {}
" 2>/dev/null)

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  exit 0
fi

case "$FILE" in
  *.css)
    npx prettier --write "$FILE" && echo "prettier: formatted $FILE" || echo "prettier: FAILED on $FILE"
    if ls .stylelintrc* stylelint.config.* 2>/dev/null | grep -q .; then
      npx stylelint "$FILE" --max-warnings=0 2>&1 | tail -5
    fi
    ;;
  *.ts|*.tsx|*.js|*.jsx)
    npx prettier --write "$FILE" && echo "prettier: formatted $FILE" || echo "prettier: FAILED on $FILE"
    npx eslint "$FILE" 2>&1 | tail -10
    ;;
  *.json|*.md|*.yml|*.yaml)
    npx prettier --write "$FILE" && echo "prettier: formatted $FILE" || echo "prettier: FAILED on $FILE"
    ;;
esac

exit 0
