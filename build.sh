#!/bin/bash
# Regenerates data/tools.js from tools/*/tool.json
cd "$(dirname "$0")" && node scripts/build-tools.js "$@"
