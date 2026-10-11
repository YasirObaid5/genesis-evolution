#!/usr/bin/env bash
# Publish ./data as a single commit on branch `perpetual-data` (force-pushed, so history never grows).
# Needs GITHUB_TOKEN (Actions) or GENESIS_PUSH_URL (any machine, e.g. a VPS) to push.
set -euo pipefail
msg="${1:-data update}"
cd data
# this branch should never trigger a Vercel deployment
printf '{\n  "git": { "deploymentEnabled": false }\n}\n' > vercel.json
rm -rf .git
git init -q
git checkout -q -b perpetual-data
git add -A
git -c user.name="genesis-bot" -c user.email="genesis-bot@users.noreply.github.com" commit -qm "$msg $(date -u +%Y-%m-%dT%H:%MZ)"
if [ -n "${GENESIS_PUSH_URL:-}" ]; then
  url="$GENESIS_PUSH_URL"
else
  url="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
fi
git push -qf "$url" perpetual-data
echo "published to perpetual-data"
