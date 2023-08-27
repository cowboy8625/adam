import lexer from "./lexer/lexer.js";
import { parser } from "./parse/parser.js";
import { codeGen } from "./codegen/mod.js";
if (Deno.args.length == 0) {
  console.log("give a file name to compile");
  Deno.exit(1);
}

const filename = Deno.args[0];
const text = await Deno
  .readTextFile(filename);

const [leftover, tokens] = lexer(text);
if (leftover.length > 0) {
  console.log("leftover text");
  console.log(leftover.split("\n")[0], "..");
  console.log(tokens.map((i) => i.toString()));
  Deno.exit(1);
}
const ast = parser(tokens);
codeGen(filename, ast);
