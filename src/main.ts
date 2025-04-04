import { parse } from "./parse/mod.ts";
import Result, { type Result as ResultType } from "./utils/result.ts";
import { Function } from "./ast/mod.ts";
import { Compiler } from "./codegen/rust/mod.ts";

function isRustcInstalled(): boolean {
  try {
    const command = new Deno.Command("rustc", { args: ["--version"] });
    const { success } = command.outputSync();
    return success;
  } catch {
    return false;
  }
}

async function openFile(filename: string): Promise<ResultType<string, Error>> {
  try {
    return Result.ok(await Deno.readTextFile(filename));
  } catch (error) {
    if (error instanceof Error) {
      return Result.err(error);
    }
    return Result.err(Error("Unknown error occurred in reading file"));
  }
}

function writeToFile(
  filePath: string,
  content: string,
): ResultType<null, string> {
  try {
    Deno.writeTextFileSync(filePath, content);
    return Result.ok(null);
  } catch (error) {
    if (error instanceof Error) {
      return Result.err(error.message);
    }
    return Result.err("Unknown error occurred in writing to file");
  }
}

function displayAstDebug(flag: boolean) {
  return (ast: Function[]): void => {
    if (!flag) {
      return;
    }
    console.log(ast);
  };
}

function newFilePath(oldFilePath: string, newExtension: string): string {
  const path = oldFilePath.split(".");
  path[path.length - 1] = newExtension;
  return path.join(".");
}

async function main() {
  if (!isRustcInstalled) {
    console.error("rustc is not installed");
    Deno.exit(1);
  }
  if (Deno.args.length < 1) {
    console.error("Please provide a file path as an argument");
    Deno.exit(1);
  }
  const showAstDebug = Deno.args.some(
    (arg) => arg === "--ast-debug" || arg === "-ad",
  );

  const filePath = Deno.args[Deno.args.length - 1];

  if (!filePath.endsWith(".adam")) {
    console.error("Please provide a .adam file as an argument");
    Deno.exit(1);
  }

  const objectFile = (await openFile("object.rs")).expect(
    "failed to open object.rs",
  );
  const result = (await openFile(filePath))
    .mapErr((_: Error) => {
      return ["Nothing"];
    })
    .andThen<Function[]>((content: string) => {
      return parse(content);
    })
    .inspect(displayAstDebug(showAstDebug))
    .map<string>((content: Function[]) => {
      console.log("Compiling [", filePath, "]...");
      const compiler = new Compiler();
      return content
        .map((item) => {
          return compiler.compile(item);
        })
        .join("\n");
    })
    .andThen((content: string) => {
      let code = content;
      if (!content.length)
        code = "// Default when empty\nfn main() {\n" + content + "\n}\n";
      return writeToFile(
        newFilePath(filePath, "rs"),
        `${objectFile}\n// ----------\n${code}\n//-------------`,
      ).mapErr((e) => [e]);
    });
  if (!result.ok) {
    console.error(result.error);
    Deno.exit(1);
  }

  const command = new Deno.Command("rustc", {
    args: ["-o", filePath.split(".")[0], newFilePath(filePath, "rs")],
  });
  const { success, stderr } = command.outputSync();
  if (!success) {
    console.error("Compilation failed with stderr:\n", stderr);
    Deno.exit(1);
  }

  console.log("Compilation successful");

  if (Deno.args.includes("run")) {
    console.log("Running", filePath.split(".")[0]);
    const command = new Deno.Command(`./${filePath.split(".")[0]}`, {
      args: [],
      stdout: "inherit",
      stderr: "inherit",
    });
    command.outputSync();
  }
}

await main();
