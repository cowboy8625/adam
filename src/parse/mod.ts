import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";
import Result from "../utils/result.ts";
import {
  Unary,
  Add,
  Mul,
  Div,
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
  Let,
  Not,
} from "../ast/mod.ts";
import Parser from "../combinators/mod.ts";
import type { ParserResult } from "../combinators/mod.types.ts";

export type ParserError = "Nothing";

export function parse(src: string): Result<Function[], ParserError[]> {
  const num = Parser.number()
    .removeLeadingWhitespace()
    .map((x) => new Number(x) as Expression);

  const str = Parser.string()
    .removeLeadingWhitespace()
    .map((x) => new StringLiteral(x) as Expression);

  const ident = Parser.identifier()
    .removeLeadingWhitespace()
    .map((x) => new Ident(x) as Expression);

  const primary = num.or(str).or(ident);

  const unary = Parser.oneOf(Parser.tag("!"), Parser.tag("-"))
    .andThen(primary)
    .map(([op, expr]) => {
      if (op === "!") {
        return new Unary(new Not(), expr) as Expression;
      }
      if (op === "-") {
        return new Unary(new Sub(), expr) as Expression;
      }
      std.unreachable();
    })
    .or(primary);

  const factor = unary
    .andThen(
      Parser.oneOf(Parser.tag("*"), Parser.tag("/")).andThen(unary).many1(),
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
    .or(unary);

  const term = factor
    .andThen(
      Parser.oneOf(Parser.tag("+"), Parser.tag("-")).andThen(factor).many1(),
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
    .or(factor);

  const expression = term;

  const statement = expression
    .andThen(Parser.tag(";"))
    .map(([expr, _]) => new ExprStmt(expr));

  const block = Parser.tag("{")
    .removeLeadingWhitespace()
    .andThen(statement.many0())
    .andThen(Parser.tag("}").removeLeadingWhitespace())
    .map(([[_, stmts], __]) => new Block(stmts));

  const params = Parser.tag("(")
    .then(expression.many0())
    .andThen(Parser.tag(")"))
    .map(([expr, _]) => expr);

  const func = Parser.tag("fn")
    .then(ident)
    .andThen(params.map((x) => x as Ident[]))
    .andThen(block)
    .map(
      ([[name, params], block]) => new Function(name as Ident, params, block),
    );

  return func
    .many0()
    .parse(src)
    .map(({ value }) => value)
    .orElse((_) => Result.err(["Nothing"]));
}

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("parse function", () => {
  assertEquals(
    parse("fn main() { 1; }"),
    Result.ok([
      new Function(
        new Ident("main"),
        [],
        new Block([new ExprStmt(new Number("1"))]),
      ),
    ]),
  );
});

// Deno.test("parse number", () => {
//   assertEquals(parse("1"), Result.ok([new Number("1")]));
// });
//
// Deno.test("parse unary", () => {
//   assertEquals(parse("-1"), Result.ok([new Unary(new Sub(), new Number("1"))]));
// });
//
// Deno.test("parse factor", () => {
//   assertEquals(
//     parse("1*1"),
//     Result.ok([new Binary(new Mul(), new Number("1"), new Number("1"))]),
//   );
//
//   assertEquals(
//     parse("1/-1"),
//     Result.ok([
//       new Binary(
//         new Div(),
//         new Number("1"),
//         new Unary(new Sub(), new Number("1")),
//       ),
//     ]),
//   );
//
//   assertEquals(
//     parse("1/-1*23"),
//     Result.ok([
//       new Binary(
//         new Mul(),
//         new Binary(
//           new Div(),
//           new Number("1"),
//           new Unary(new Sub(), new Number("1")),
//         ),
//         new Number("23"),
//       ),
//     ]),
//   );
// });
//
// Deno.test("parse term", () => {
//   assertEquals(
//     parse("1-1"),
//     Result.ok([new Binary(new Sub(), new Number("1"), new Number("1"))]),
//   );
//
//   assertEquals(
//     parse("1+-1"),
//     Result.ok([
//       new Binary(
//         new Add(),
//         new Number("1"),
//         new Unary(new Sub(), new Number("1")),
//       ),
//     ]),
//   );
//
//   assertEquals(
//     parse("1+-1-23"),
//     Result.ok([
//       new Binary(
//         new Sub(),
//         new Binary(
//           new Add(),
//           new Number("1"),
//           new Unary(new Sub(), new Number("1")),
//         ),
//         new Number("23"),
//       ),
//     ]),
//   );
// });

// export function parse(src: string): Result<Declaration[], ParserError[]> {
//   return programParser(src)
//     .map(({ value }) => value)
//     .orElse<ParserError[]>((_) => Result.err(["Nothing"]));
// }
//
// export function programParser(src: string): ParserResult<Declaration[]> {
//   return functionParser().many0().parse(src);
// }
//
// export function functionParser(): Parse<Function> {
//   return Parse.tag("fn")
//     .then<Ident>(identifierParser<Ident>())
//     .andThen<Ident[]>(paramParser())
//     .andThen<Block>(blockParser())
//     .map(([[name, params], body]) => {
//       return new Function(name, params, body);
//     });
// }
//
// export function paramParser(): Parse<Ident[]> {
//   return Parse.surround(
//     Parse.tag("("),
//     Parse.left(identifierParser<Ident>(), Parse.tag(",").optional()).many0(),
//     Parse.tag(")"),
//   );
// }
//
// export function blockParser(): Parse<Block> {
//   return Parse.surround(
//     Parse.right(Parse.whitespace().optional(), Parse.tag("{")),
//     statementParser().many0(),
//     Parse.right(Parse.whitespace().optional(), Parse.tag("}")),
//   ).map((value) => new Block(value));
// }
//
// export function statementParser(): Parse<Statement> {
//   return letBindingParser()
//     .inspect((value) => console.log("let binding parser: ", value))
//     .or(expressionParser())
//     .inspect((value) => console.log("after or for expression", value))
//     .andThen(Parse.tag(";"))
//     .inspect((value) => console.log("tag ';'", value))
//     .map(([value, _]) => new ExprStmt(value));
// }
//
// export function letBindingParser(): Parse<Expression> {
//   return Parse.tag("let")
//     .then(identifierParser<Ident>().removeLeadingWhitespace())
//     .andThen(Parse.tag("=").removeLeadingWhitespace().then(expressionParser()))
//     .map(([name, expression]) => new Let(name, expression));
// }
//
// export function expressionParser(): Parse<Expression> {
//   return binaryParser();
// }
//
// export function opParser(...ops: string[]): Parse<Op> {
//   return Parse.oneOf(...ops.map(Parse.tag))
//     .removeLeadingWhitespace()
//     .map((op) => {
//       switch (op) {
//         case "+":
//           return new Add();
//         case "-":
//           return new Sub();
//         default:
//           std.unreachable();
//       }
//     });
// }
//
// export function binaryParser(): Parse<Expression> {
//   return callParser()
//     .andThen(Parse.pair(opParser("+", "-"), callParser()).many1())
//     .map(([lhs, items]) =>
//       items.reduce(
//         (lhs, [op, rhs]) => new Binary(lhs, rhs, op) as Expression,
//         lhs,
//       ),
//     )
//     .or(callParser());
// }
//
// export function callParser(): Parse<Expression> {
//   const nameParaser = primaryParser().removeLeadingWhitespace();
//   const argParser = Parse.tag("(").then();
//   return (
//     primaryParser()
//       .removeLeadingWhitespace()
//       .andThen(argumentParser())
//       // TODO: make call name be a Expression
//       .map(([name, args]) => new Call(name as Ident, args) as Expression)
//       .or(primaryParser())
//   );
// }
//
// export function argumentParser(): Parse<Expression[]> {
//   return Parse.tag("(").then(
//     Parse.left(
//       expressionParser().optional(),
//       Parse.tag(",").optional().removeLeadingWhitespace(),
//     )
//       .many0()
//       .then(Parse.tag(")")),
//   );
//
//   return Parse.surround(
//     Parse.tag("("),
//     Parse.left(
//       expressionParser(),
//       Parse.tag(",").optional().removeLeadingWhitespace(),
//     ).many0(),
//     Parse.tag(")"),
//   ).removeLeadingWhitespace();
// }
//
// export function primaryParser(): Parse<Expression> {
//   return Parse.oneOf<Expression>(
//     identifierParser<Expression>(),
//     stringParser(),
//     numberParser(),
//   ).removeLeadingWhitespace();
// }
//
// export function identifierParser<T>(): Parse<T> {
//   return Parse.identifier()
//     .map((value: string) => new Ident(value) as T)
//     .removeLeadingWhitespace();
// }
//
// export function stringParser(): Parse<Expression> {
//   return Parse.string().map((value) => new StringLiteral(value));
// }
//
// export function numberParser(): Parse<Expression> {
//   return Parse.number().map((value) => new Number(String(value)));
// }
