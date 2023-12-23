import { parser } from "./parser/mod.ts";
function main() {
  const src = 'fn main() { print("hello world!");}';
  const ast = parser(src);
  console.log(ast);
}

main();
