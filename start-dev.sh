#!/bin/bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /Users/shotpro3/Desktop/vms-demo
npx next dev --port ${PORT:-3000}
