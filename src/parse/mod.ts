import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";
import Result from "../utils/result.ts";
import {
  Add,
  Binary,
  Block,
  Call,
  Declaration,
  Div,
  Expression,
  ExprStmt,
  Function,
  Ident,
  Let,
  Mul,
  Not,
  Number,
  Op,
  Statement,
  StringLiteral,
  Sub,
  Unary,
} from "../ast/mod.ts";
import Parser from "../combinators/mod.ts";
import type { ParserResult } from "../combinators/mod.types.ts";

export type ParserError = "Nothing";

export function num(): Parser<Expression> {
  return Parser.number()
    .removeLeadingWhitespace()
    .map((x) => new Number(x) as Expression);
}

export function str(): Parser<Expression> {
  return Parser.string()
    .removeLeadingWhitespace()
    .map((x) => new StringLiteral(x) as Expression);
}

export function ident(): Parser<Expression> {
  return Parser.identifier()
    .removeLeadingWhitespace()
    .map((x) => new Ident(x) as Expression);
}

export function primary(): Parser<Expression> {
  return num().or(str()).or(ident());
}

export function call(): Parser<Expression> {
  return ident().andThen(Parser.surround(
    Parser.tag("("),
    Parser.left(expression(), Parser.tag(",").optional()).many0(),
    Parser.tag(")"),
  )).map(([ident, args]) => new Call(ident as Ident, args) as Expression)
    .or(primary());
}

export function unary(): Parser<Expression> {
  return Parser.oneOf(
    Parser.tag("!"),
    Parser.tag("-"),
  )
    .andThen(call())
    .map(([op, expr]) => {
      if (op === "!") {
        return new Unary(new Not(), expr) as Expression;
      }
      if (op === "-") {
        return new Unary(new Sub(), expr) as Expression;
      }
      std.unreachable();
    })
    .or(call());
}

export function factor(): Parser<Expression> {
  return unary()
    .andThen(
      Parser.oneOf(Parser.tag("*"), Parser.tag("/")).andThen(unary()).many1(),
    )
    .map(([lhs, rest]) => {
      return rest.reduce((lhs, [op, rhs]) => {
        if (op === "*") {
          return new Binary(new Mul(), lhs, rhs) as Expression;
        }
        if (op === "/") {
          return new Binary(new Div(), lhs, rhs) as Expression;
        }
        std.unreachable();
      }, lhs);
    })
    .or(unary());
}

export function term(): Parser<Expression> {
  return factor()
    .andThen(
      Parser.oneOf(Parser.tag("+"), Parser.tag("-")).andThen(factor()).many1(),
    )
    .map(([lhs, rest]) => {
      return rest.reduce((lhs, [op, rhs]) => {
        if (op === "+") {
          return new Binary(new Add(), lhs, rhs) as Expression;
        }
        if (op === "-") {
          return new Binary(new Sub(), lhs, rhs) as Expression;
        }
        std.unreachable();
      }, lhs);
    })
    .or(factor());
}

export function expression(): Parser<Expression> {
  return term();
}

export function statement(): Parser<Statement> {
  return expression()
    .andThen(Parser.tag(";"))
    .map(([expr, _]) => new ExprStmt(expr));
}

export function block(): Parser<Block> {
  return Parser.tag("{")
    .removeLeadingWhitespace()
    .andThen(statement().many0())
    .andThen(Parser.tag("}").removeLeadingWhitespace())
    .map(([[_, stmts], __]) => new Block(stmts));
}

export function params(): Parser<Expression[]> {
  return Parser.tag("(")
    .then(expression().many0())
    .andThen(Parser.tag(")"))
    .map(([expr, _]) => expr);
}

export function func(): Parser<Function> {
  return Parser.tag("fn")
    .then(ident())
    .andThen(params().map((x) => x as Ident[]))
    .andThen(block())
    .map(
      ([[name, params], block]) => new Function(name as Ident, params, block),
    );
}

export function parse(src: string): Result<Function[], ParserError[]> {
  return func()
    .many0()
    .parse(src)
    .map(({ value }) => value)
    .orElse((_) => Result.err(["Nothing"]));
}
