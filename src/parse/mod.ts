import Result from "../utils/result.ts";
import { Function } from "../ast/mod.ts";
import Parse from "../combinators/mod.ts";

export type ParserError = "Nothing";
export type ParserResult<T> = Result<T, ParserError>;

export function parse(src: string): Result<Function[], ParserError[]> {
  const {  Parse.many0(functionParser)(src);
}

function functionParser(src: string): ParserResult<Function> {
  return Result.err("Nothing");
}
