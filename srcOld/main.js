import lexer from "./lexer/lexer.js";
import { parser } from "./parse/parser.js";
import { codeGen } from "./codegen/mod.js";

const compileWithRustC = async (fileName) => {
  let rustc = new Deno.Command("rustc", { args: [fileName] });
  let { code, stdout, stderr } = await rustc.output();
  console.log(new TextDecoder().decode(stdout));
  if (code > 0) {
    console.log(new TextDecoder().decode(stderr));
    Deno.exit(code);
  }
};

const fmtRustFile = async (fileName) => {
  let rustfmt = new Deno.Command("rustfmt", { args: [fileName] });
  let { code, stdout, stderr } = await rustfmt.output();
  console.log(new TextDecoder().decode(stdout));
  if (code > 0) {
    console.log(new TextDecoder().decode(stderr));
    Deno.exit(code);
  }
};

if (Deno.args.length == 0) {
  console.log("give a file name to compile");
  Deno.exit(1);
}

const filename = Deno.args[0];
const text = await Deno
  .readTextFile(filename);

const [leftoverSrc, tokens] = lexer(text);
if (leftoverSrc.length > 0) {
  console.log("leftover text");
  console.log(leftoverSrc.split("\n")[0], "..");
  console.log(tokens.map((i) => i.toString()));
  Deno.exit(1);
}

const [leftoverTokens, ast] = parser(tokens);

if (leftoverTokens.length > 0) {
  console.log("leftover tokens");
  console.log(Deno.inspect(leftoverTokens));
  console.log(Deno.inspect(ast));
  Deno.exit(1);
}

// console.log(Deno.inspect(ast));

const rustFile = await codeGen(filename, ast);
await compileWithRustC(rustFile);
await fmtRustFile(rustFile);
