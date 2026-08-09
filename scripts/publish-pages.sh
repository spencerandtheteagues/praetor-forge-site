#!/usr/bin/env bash
# Build the site and publish it to the gh-pages branch, which GitHub Pages
# serves at theharnesslab.com.
#
# This exists because GitHub Actions is locked on this account for billing, so
# .github/workflows/pages.yml cannot run. Publishing from a branch costs no
# Actions minutes and is how titledesk.theharnesslab.com has always worked.
#
# Usage:  scripts/publish-pages.sh
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$PWD"
BRANCH="gh-pages"

echo "==> building"
npm ci
npm run build

# Pages drops the custom domain the moment this file goes missing, and the
# resulting failure looks exactly like a DNS problem. Fail here instead.
test -f dist/CNAME || { echo "FATAL: dist/CNAME missing — public/CNAME did not survive the build"; exit 1; }
echo "==> custom domain: $(cat dist/CNAME)"

# Jekyll would otherwise ignore any path starting with an underscore, which is
# most of a Vite build's asset names on some configs. Cheap insurance.
touch dist/.nojekyll

WORKTREE="$(mktemp -d -p "$(git rev-parse --git-common-dir)/..")"
# cd out of the worktree before removing it — the script ends up inside it, and
# `git worktree remove` refuses to delete the directory it is being run from,
# which silently leaves a registered worktree behind on every publish.
trap 'cd "$REPO_ROOT"; git worktree remove --force "$WORKTREE" 2>/dev/null || true; rm -rf "$WORKTREE"; git worktree prune' EXIT

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add --quiet "$WORKTREE" "$BRANCH"
else
  git worktree add --quiet --detach "$WORKTREE"
  git -C "$WORKTREE" checkout --orphan "$BRANCH"
  git -C "$WORKTREE" rm -rq --cached . 2>/dev/null || true
fi

# Replace the published tree wholesale, so a file deleted in src disappears from
# the live site instead of lingering.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$REPO_ROOT/dist/." "$WORKTREE/"

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "==> no change to publish"
  exit 0
fi

git commit -q -m "Publish site from $(git -C "$REPO_ROOT" rev-parse --short HEAD)"
git push -q origin "$BRANCH"
echo "==> published to $BRANCH"
