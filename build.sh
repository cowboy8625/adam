#!/bin/bash

if [[ "$1" == "debug" ]]; then
  deno run --allow-read --allow-write --allow-net --inspect-brk=127.0.0.1:9229 src/main.ts -- "${@:2}";
elif [[ "$1" == "run" ]]; then
  deno run --allow-read --allow-write --allow-net src/main.ts -- "${@:2}" && rustc -o output test.rs && ./output;
else
  deno run --allow-read --allow-write --allow-net src/main.ts -- "$1" "$2" && rustc -o output test.rs
fi
