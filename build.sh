#!/bin/bash

PERMISSIONS="--allow-read --allow-write --allow-net --allow-run"
DEBUG="--inspect-brk=127.0.0.1:9229"

if [[ "$1" == "debug" ]]; then
  deno run $PERMISSIONS $DEBUG src/main.ts -- run "${@:2}";
elif [[ "$1" == "run" ]]; then
  deno run $PERMISSIONS src/main.ts -- run "${@:2}";
elif [[ "$1" == "compile" ]]; then
  deno compile $PERMISSIONS --output adam src/main.ts
else
  deno run $PERMISSIONS src/main.ts -- "${@:1}";
fi
