#!/usr/bin/env bash
# Copy the latest published data (branch `perpetual-data`) into ./data
set -euo pipefail
mkdir -p data
if git ls-remote --exit-code --heads origin perpetual-data >/dev/null 2>&1; then
  git fetch --depth=1 origin perpetual-data
  git archive FETCH_HEAD | tar -x -C data
  echo "fetched existing data:"; ls -la data
else
  echo "no data branch yet: starting a new world"
fi
