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
async function main() {
  if (Deno.args.length < 1) {
    console.error("Please provide a file path as an argument");
    Deno.exit(1);
  }
  const filePath = Deno.args[1];
  console.log(filePath);
  const result = await openFile(filePath).then((r) => {
    return r
      .mapErr((_: Error) => {
        return ["Nothing"];
      })
      .andThen((content: string) => {
        return parse(content);
      })
      .map((content: Function[]) => {
        const compiler = new Compiler();
        return content
          .map((item) => {
            return compiler.compile(item);
          })
          .join("\n");
      });
  });
  console.log(result);
}
// Next write output to file and try running it

await main();
