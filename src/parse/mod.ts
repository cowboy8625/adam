import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";
import { type Result as ResultType } from "../utils/result.ts";
import {
  Add,
  Binary,
  Block,
  Call,
  Div,
  Expression,
  ExprStmt,
  Function,
  Ident,
  Mul,
  Not,
  Number,
  Statement,
  StringLiteral,
  Sub,
  Unary,
} from "../ast/mod.ts";

import Parser from "../combinators/mod.ts";

export type ParserError = string;

function isIdent(e: Expression): e is Ident {
  return e instanceof Ident;
}

export function num(): Parser<Expression> {
  return Parser.number()
    .removeLeadingWhitespace()
    .map((x): Expression => new Number(x));
}

export function str(): Parser<Expression> {
  return Parser.string()
    .removeLeadingWhitespace()
    .map((x) => new StringLiteral(x));
}

export function ident(): Parser<Expression> {
  return Parser.identifier()
    .removeLeadingWhitespace()
    .map((x) => new Ident(x));
}

export function primary(): Parser<Expression> {
  return num()
    .or(str)
    .or(ident)
    .or(() =>
      Parser.surround(Parser.literal("("), expression(), Parser.literal(")")),
    );
}

export function functionArgs(): Parser<Expression[]> {
  return Parser.surround(
    Parser.literal("("),
    Parser.left(expression(), Parser.literal(",").optional()).many0(),
    Parser.literal(")"),
  );
}

export function call(): Parser<Expression> {
  return ident()
    .andThen(() => functionArgs().optional())
    .map(([ident, args]): Expression => {
      if (!isIdent(ident)) std.unreachable();
      return new Call(ident, args.unwrap());
    })
    .or(primary);
}

export function unary(): Parser<Expression> {
  const notParser = Parser.literal("!").removeLeadingWhitespace();
  const minusParser = Parser.literal("-").removeLeadingWhitespace();
  const prefixParser = notParser.or(minusParser).many0();

  return prefixParser
    .andThen(call)
    .map(([ops, expr]) =>
      ops.reduce((acc, op) => {
        if (op === "!") return new Unary(new Not(), acc);
        if (op === "-") return new Unary(new Sub(), acc);
        std.unreachable();
      }, expr),
    )
    .or(call);
}

export function factor(): Parser<Expression> {
  const op = Parser.oneOf(Parser.literal("*"), Parser.literal("/"))
    .removeLeadingWhitespace()
    .andThen(unary)
    .many1();

  return unary()
    .andThen(op)
    .map(([lhs, rest]) => {
      return rest.reduce<Expression>((lhs, [op, rhs]) => {
        if (op === "*") {
          return new Binary(new Mul(), lhs, rhs);
        } else if (op === "/") {
          return new Binary(new Div(), lhs, rhs);
        }
        std.unreachable();
      }, lhs);
    })
    .or(unary);
}

export function term(): Parser<Expression> {
  const op = Parser.oneOf(Parser.literal("+"), Parser.literal("-"))
    .removeLeadingWhitespace()
    .andThen(factor)
    .many1();

  return factor()
    .andThen(op)
    .map(([lhs, rest]) => {
      return rest.reduce<Expression>((lhs, [op, rhs]) => {
        if (op === "+") {
          return new Binary(new Add(), lhs, rhs);
        }
        if (op === "-") {
          return new Binary(new Sub(), lhs, rhs);
        }
        std.unreachable();
      }, lhs);
    })
    .or(factor);
}

export function expression(): Parser<Expression> {
  return term();
}

export function statement(): Parser<Statement> {
  return expression()
    .andThen(() => Parser.literal(";").removeLeadingWhitespace())
    .map(([expr, _]) => new ExprStmt(expr));
}

export function block(): Parser<Block> {
  return Parser.literal("{")
    .removeLeadingWhitespace()
    .andThen(() => statement().many0())
    .andThen(() => Parser.literal("}").removeLeadingWhitespace())
    .map(([[_, stmts], __]) => new Block(stmts));
}

export function params(): Parser<Ident[]> {
  return Parser.surround(
    Parser.literal("("),
    Parser.left(
      ident().map((x) => x as Ident),
      Parser.literal(",").optional(),
    ).many0(),
    Parser.literal(")"),
  );
}

export function func(): Parser<Function> {
  return Parser.literal("fn")
    .removeLeadingWhitespace()
    .then(ident)
    .andThen(() => params().map((x) => x.filter(isIdent)))
    .andThen(block)
    .map(([[name, params], body]) => {
      if (!isIdent(name)) {
        std.unreachable();
      }
      return new Function(name, params, body);
    });
}

export function parse(src: string): ResultType<Function[], ParserError[]> {
  return func()
    .many0()
    .parse(src)
    .map(({ value }) => value)
    .mapErr<string[]>((err) => [err]);
}
