#!/usr/bin/env bash
set -euo pipefail

if (( $# > 1 )); then
  echo 'Usage: bash setup-worktree.sh [source-worktree]' >&2
  exit 1
fi

TARGET="$(git rev-parse --show-toplevel)"
TARGET="$(cd "$TARGET" && pwd -P)"

if [[ -n "${1:-}" ]]; then
  SOURCE="$1"
else
  WORKTREES="$(git -c core.quotePath=false worktree list --porcelain)"
  FIRST_LINE="${WORKTREES%%$'\n'*}"
  SOURCE="${FIRST_LINE#worktree }"
fi
SOURCE="$(cd "$SOURCE" && pwd -P)"

if [[ "$SOURCE" == "$TARGET" ]]; then
  echo 'Source and target are the same. Run this script from a new worktree.' >&2
  exit 1
fi
if [[ ! -f "$SOURCE/package.json" ]]; then
  echo 'The source must be a Commission Quote worktree root.' >&2
  exit 1
fi
command -v npm > /dev/null

echo "Source worktree: $SOURCE"
echo "Target worktree: $TARGET"

COPY_FILES=(.env .env.local .env.development.local .env.test.local .env.production.local)
for file in "${COPY_FILES[@]}"; do
  if [[ -e "$TARGET/$file" || -L "$TARGET/$file" ]]; then
    echo "Skipped $file (already exists in target)"
  elif [[ -f "$SOURCE/$file" ]]; then
    (umask 077; cp "$SOURCE/$file" "$TARGET/$file")
    echo "Copied $file"
  else
    echo "Skipped $file (not found in source)"
  fi
done

cd "$TARGET"
echo 'Installing dependencies with npm ci...'
npm ci

echo 'Done. Worktree is ready.'
