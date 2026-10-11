#!/usr/bin/env bash
# Run the perpetual world without pause on your own server (e.g. a Hostinger VPS).
# Every cycle: evolve for MINUTES, publish to GitHub (if GENESIS_PUSH_URL is set), repeat.
# Once a day it also adds laws experiments.
#   export GENESIS_PUSH_URL="https://<user>:<token>@github.com/<user>/genesis-evolution.git"
#   nohup bash runner/daemon.sh > genesis.log 2>&1 &
set -uo pipefail
cd "$(dirname "$0")/.."
MINUTES="${MINUTES:-30}"
last_laws=0
while true; do
  if [ -n "${GENESIS_PUSH_URL:-}" ]; then
    git fetch -q "$GENESIS_PUSH_URL" perpetual-data 2>/dev/null && { rm -rf data; mkdir -p data; git archive FETCH_HEAD | tar -x -C data; }
  fi
  MINUTES="$MINUTES" DATA_DIR=data node runner/perpetual.mjs
  now=$(date +%s)
  if [ $((now - last_laws)) -gt 86400 ]; then
    MINUTES=45 DATA_DIR=data node runner/laws.mjs && last_laws=$now
  fi
  [ -n "${GENESIS_PUSH_URL:-}" ] && bash runner/publish-data.sh "server update" || echo "not publishing (GENESIS_PUSH_URL not set)"
  # the data folder is re-created from the branch next cycle; keep a local copy too
  sleep 5
done
