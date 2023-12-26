import { parse } from "./parse/mod.ts";
function main() {
  const src = 'fn main() { print("hello world!");}';
  const ast = parse(src);
  console.log(ast);
}

main();
