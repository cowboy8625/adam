import { ParserError, parse } from "./parse/mod.ts";
import Result from "./utils/result.ts";
import { Function } from "./ast/mod.ts";
import { Compiler } from "./codegen/rust/mod.ts";

async function openFile(filename: string): Promise<Result<string, Error>> {
  try {
    return Result.ok(await Deno.readTextFile(filename));
  } catch (error) {
    return Result.err(error);
  }
}

function writeToFile(filePath: string, content: string): Result<null, string> {
  try {
    Deno.writeTextFileSync(filePath, content);
    return Result.ok(null);
  } catch (error) {
    return Result.err(error.message);
  }
}

function displayAstDebug(flag: boolean) {
  return (ast: Function[]) => {
    if (!flag) {
      return;
    }
    console.log(ast);
  };
}

async function main() {
  if (Deno.args.length < 1) {
    console.error("Please provide a file path as an argument");
    Deno.exit(1);
  }
  const showAstDebug = Deno.args.some(
    (arg) => arg === "--ast-debug" || arg === "-ad",
  );
  const filePath = Deno.args[1];
  const objectFile = await openFile("object.rs").then((r) =>
    r.expect("failed to open object.rs"),
  );
  const result = await openFile(filePath).then((r) => {
    return r
      .mapErr((_: Error) => {
        return ["Nothing"];
      })
      .andThen((content: string) => {
        return parse(content);
      })
      .inspect(displayAstDebug(showAstDebug))
      .map((content: Function[]) => {
        const compiler = new Compiler();
        return content
          .map((item) => {
            return compiler.compile(item);
          })
          .join("\n");
      })
      .andThen((content: string) =>
        writeToFile("test.rs", `${objectFile}\n${content}`).mapErr((e) => [e]),
      );
  });
  console.log(result);
}

await main();
