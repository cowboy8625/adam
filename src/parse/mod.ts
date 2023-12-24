import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";
import Result from "../utils/result.ts";
import Option from "../utils/option.ts";
import {
  Add,
  Binary,
  Block,
  Expression,
  Function,
  Ident,
  Op,
  Sub,
} from "../ast/mod.ts";
import Parse from "../combinators/mod.ts";
import type {
  ParserResult,
  ParserResultSuccess,
} from "../combinators/mod.types.ts";

export type ParserError = "Nothing";
// export type ParserResult<T> = Result<T, ParserError>;

export function parse(src: string): Result<Function[], ParserError[]> {
  const result = Parse.many0(functionParser)(src);
  if (result.isErr()) {
    // TODO: Handle error
    return Result.err(["Nothing"]);
  }

  const { value } = result.unwrap();

  return Result.ok(value);
}

function identParser(i: ParserResultSuccess<string>): ParserResult<Ident> {
  return Parse.right(
    Parse.optional(Parse.whitespace),
    Parse.identifier,
  )(i.src).map(({ src, value }) => ({
    src,
    value: new Ident(value),
  }));
}

function functionParser(src: string): ParserResult<Function> {
  const result = Parse.tag<string>("fn")(src)
    .andThen(identParser)
    .andThen(paramParser)
    .andThen(blockParser)
    .map(({ src, value: [name, params, body] }) => {
      return { src, value: new Function(name, params, body) };
    });
  if (result.isErr()) {
    return Result.err(result.unwrapErr());
  }
  return result;
}

function paramParser({
  src,
  value: name,
}: ParserResultSuccess<Ident>): ParserResult<[Ident, Ident[]]> {
  console.log("param", src);
  return Parse.surround(
    Parse.tag("("),
    Parse.many0(
      Parse.surround<Option<string>, string, Option<string>>(
        Parse.optional<string>(Parse.whitespace),
        Parse.identifier,
        Parse.optional<string>(Parse.tag(",")),
      ),
    ),
    Parse.tag(")"),
  )(src).map(({ src, value }) => ({
    src,
    value: [name, value.map((name) => new Ident(name))],
  }));
}

function blockParser({
  src,
  value: [name, params],
}: ParserResultSuccess<[Ident, Ident[]]>): ParserResult<
  [Ident, Ident[], Block]
> {
  return Parse.surround(
    Parse.right(Parse.optional(Parse.whitespace), Parse.tag("{")),
    Parse.many0(expressionParser),
    Parse.right(Parse.optional(Parse.whitespace), Parse.tag("}")),
  )(src).map(({ src, value }) => ({
    src,
    value: [name, params, new Block(value)],
  }));
}

function expressionParser(src: string): ParserResult<Expression> {
  return binaryParser(src);
}

function binaryParser(src: string): ParserResult<Expression> {
  const result = Parse.pair<[Expression, Op, Expression]>(
    primaryParser,
    Parse.oneOf([new Add(), new Sub()]),
    primaryParser,
  );
  if (result.isErr()) {
    return result;
  }
  const {
    src: srcNew,
    value: [lhs, op, rhs],
  } = result.unwrap();
  return Result.ok({
    src: srcNew,
    value: new Binary(lhs, op, rhs),
  });
}

function primaryParser(src: string): ParserResult<Expression> {
  return Parse.identifier(src).map(({ src, value }) => ({
    src,
    value: new Ident(value),
  }));
}
