import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";
import Result from "../utils/result.ts";
import {
  Add,
  Binary,
  Block,
  Call,
  Declaration,
  ExprStmt,
  Expression,
  Function,
  Ident,
  Number,
  Op,
  Statement,
  StringLiteral,
  Sub,
} from "../ast/mod.ts";
import Parse from "../combinators/mod.ts";
import type { ParserResult } from "../combinators/mod.types.ts";

export type ParserError = "Nothing";

export function parse(src: string): Result<Declaration[], ParserError[]> {
  return programParser(src)
    .map(({ value }) => value)
    .orElse<ParserError[]>((_) => Result.err(["Nothing"]));
}

export function programParser(src: string): ParserResult<Declaration[]> {
  return functionParser().many0().parse(src);
}

export function functionParser(): Parse<Function> {
  return Parse.tag("fn")
    .then<Ident>(identifierParser<Ident>())
    .andThen<Ident[]>(paramParser())
    .andThen<Block>(blockParser())
    .map(([[name, params], body]) => {
      return new Function(name, params, body);
    });
}

export function paramParser(): Parse<Ident[]> {
  return Parse.surround(
    Parse.tag("("),
    Parse.left(identifierParser<Ident>(), Parse.tag(",").optional()).many0(),
    Parse.tag(")"),
  );
}

export function blockParser(): Parse<Block> {
  return Parse.surround(
    Parse.right(Parse.whitespace().optional(), Parse.tag("{")),
    statementParser().many0(),
    Parse.right(Parse.whitespace().optional(), Parse.tag("}")),
  ).map((value) => new Block(value));
}

export function statementParser(): Parse<Statement> {
  return Parse.left(
    Parse.oneOf<Expression>(letBindingParser(), expressionParser()),
    Parse.tag(";"),
  ).map((value) => new ExprStmt(value));
}

export function letBindingParser(): Parse<Expression> {
  return new Parse((src: string) => {
    const whitespaceParser = Parse.whitespace().optional();
    const result = Parse.right(
      whitespaceParser,
      Parse.right(whitespaceParser, identifierParser<Ident>()),
    ).parse(src);
    if (result.isOk()) {
      std.unimplemented(
        `letBindingParser ${src}, ${result.unwrap().value instanceof Ident}`,
      );
    }
    return Result.err(result.unwrapErr());
  });
}

export function expressionParser(): Parse<Expression> {
  return binaryParser();
}

export function opParser(...ops: string[]): Parse<Op> {
  return Parse.oneOf(...ops.map(Parse.tag)).map((op) => {
    switch (op) {
      case "+":
        return new Add();
      case "-":
        return new Sub();
      default:
        std.unreachable();
    }
  });
}

export function binaryParser(): Parse<Expression> {
  return primaryParser()
    .andThen<Op>(opParser("+", "-"))
    .andThen<Expression>(binaryParser())
    .map(([[lhs, op], rhs]) => new Binary(lhs, rhs, op));
}

export function callParser(): Parse<Expression> {
  return Parse.oneOf(
    identifierParser<Ident>()
      .andThen<Expression[]>(argumentParser())
      .map(([name, args]) => new Call(name, args)),
    primaryParser(),
  );
}

export function argumentParser(): Parse<Expression[]> {
  return Parse.surround(
    Parse.tag("("),
    Parse.left(expressionParser(), Parse.tag(",").optional()).many0(),
    Parse.tag(")"),
  );
}

export function primaryParser(): Parse<Expression> {
  return Parse.right(
    Parse.whitespace().optional(),
    Parse.oneOf(identifierParser<Expression>(), stringParser(), numberParser()),
  );
}

export function identifierParser<T>(): Parse<T> {
  return new Parse<T>(
    (src: string): ParserResult<T> =>
      Parse.identifier()
        .map((value: string) => new Ident(value) as T)
        .parse(src),
  );
}

export function stringParser(): Parse<Expression> {
  return Parse.string().map((value) => new StringLiteral(value));
}

export function numberParser(): Parse<Expression> {
  return Parse.number().map((value) => new Number(String(value)));
}
