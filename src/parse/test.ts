import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import {
  func,
  block,
  call,
  expression,
  factor,
  functionArgs,
  num,
  parse,
  primary,
  term,
  unary,
  returnStmt,
} from "./mod.ts";
import {
  Add,
  Binary,
  Block,
  Call,
  Div,
  ExprStmt,
  Function,
  Ident,
  Mul,
  Number,
  ReturnStmt,
  StringLiteral,
  Sub,
  Unary,
} from "../ast/mod.ts";

import Result from "../utils/result.ts";
import Option from "../utils/option.ts";

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

  assertEquals(
    func().parse(`
fn main() {
    print(1);
}`),
    Result.ok({
      src: "",
      value: new Function(
        new Ident("main"),
        [],
        new Block([
          new ExprStmt(new Call(new Ident("print"), [new Number("1")])),
        ]),
      ),
    }),
  );
});

Deno.test("parse number", () => {
  assertEquals(
    num().parse("1"),
    Result.ok({ src: "", value: new Number("1") }),
  );
});

Deno.test("parse primary", () => {
  assertEquals(
    primary().parse("1"),
    Result.ok({ src: "", value: new Number("1") }),
  );

  assertEquals(
    primary().parse("number"),
    Result.ok({ src: "", value: new Ident("number") }),
  );

  assertEquals(
    primary().parse('"1 + 1"'),
    Result.ok({ src: "", value: new StringLiteral('"1 + 1"') }),
  );
});

Deno.test("parse call", () => {
  assertEquals(
    call().parse("add(123, 321)"),
    Result.ok({
      src: "",
      value: new Call(new Ident("add"), [new Number("123"), new Number("321")]),
    }),
  );

  assertEquals(
    call().parse("add(123 + 321)"),
    Result.ok({
      src: "",
      value: new Call(new Ident("add"), [
        new Binary(new Add(), new Number("123"), new Number("321")),
      ]),
    }),
  );

  assertEquals(
    call().parse('print("hello there")'),
    Result.ok({
      src: "",
      value: new Call(new Ident("print"), [new StringLiteral('"hello there"')]),
    }),
  );
});

Deno.test("parse unary", () => {
  assertEquals(
    unary().parse("-1"),
    Result.ok({ src: "", value: new Unary(new Sub(), new Number("1")) }),
  );

  assertEquals(
    unary().parse("--1"),
    Result.ok({
      src: "",
      value: new Unary(new Sub(), new Unary(new Sub(), new Number("1"))),
    }),
  );
});

Deno.test("parse factor", () => {
  assertEquals(
    factor().parse("1*1"),
    Result.ok({
      src: "",
      value: new Binary(new Mul(), new Number("1"), new Number("1")),
    }),
  );

  assertEquals(
    factor().parse("1/-1"),
    Result.ok({
      src: "",
      value: new Binary(
        new Div(),
        new Number("1"),
        new Unary(new Sub(), new Number("1")),
      ),
    }),
  );

  assertEquals(
    factor().parse("1/-1*23"),
    Result.ok({
      src: "",
      value: new Binary(
        new Mul(),
        new Binary(
          new Div(),
          new Number("1"),
          new Unary(new Sub(), new Number("1")),
        ),
        new Number("23"),
      ),
    }),
  );
});

Deno.test("parse term", () => {
  assertEquals(
    term().parse("1-1"),
    Result.ok({
      src: "",
      value: new Binary(new Sub(), new Number("1"), new Number("1")),
    }),
  );

  assertEquals(
    term().parse("1+-1"),
    Result.ok({
      src: "",
      value: new Binary(
        new Add(),
        new Number("1"),
        new Unary(new Sub(), new Number("1")),
      ),
    }),
  );

  assertEquals(
    term().parse("1+-1-23"),
    Result.ok({
      src: "",
      value: new Binary(
        new Sub(),
        new Binary(
          new Add(),
          new Number("1"),
          new Unary(new Sub(), new Number("1")),
        ),
        new Number("23"),
      ),
    }),
  );
});

Deno.test("parse function args", () => {
  assertEquals(
    functionArgs().parse("(1 + 1)"),
    Result.ok({
      src: "",
      value: [new Binary(new Add(), new Number("1"), new Number("1"))],
    }),
  );
});

Deno.test("parse expression", () => {
  assertEquals(
    expression().parse("1+1"),
    Result.ok({
      src: "",
      value: new Binary(new Add(), new Number("1"), new Number("1")),
    }),
  );
  assertEquals(
    expression().parse("1 + 1"),
    Result.ok({
      src: "",
      value: new Binary(new Add(), new Number("1"), new Number("1")),
    }),
  );

  assertEquals(
    expression().parse('print("Hello, Adam!")'),
    Result.ok({
      src: "",
      value: new Call(new Ident("print"), [
        new StringLiteral('"Hello, Adam!"'),
      ]),
    }),
  );
});

Deno.test("parse block", () => {
  const input = '{print("Hello, Adam!");}';
  const result = block().parse(input);
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: new Block([
        new ExprStmt(
          new Call(new Ident("print"), [new StringLiteral('"Hello, Adam!"')]),
        ),
      ]),
    }),
  );
});

Deno.test("parse return", () => {
  {
    const input = "return 1 + 1;";
    const result = returnStmt().parse(input);
    assertEquals(
      result,
      Result.ok({
        src: "",
        value: new ReturnStmt(
          Option.some(new Binary(new Add(), new Number("1"), new Number("1"))),
        ),
      }),
    );
  }
  {
    const input = "fn add(x, y) {\n  return x + y;\n}";
    const result = parse(input);
    assertEquals(
      result,
      Result.ok([
        new Function(
          new Ident("add"),
          [new Ident("x"), new Ident("y")],
          new Block([
            new ReturnStmt(
              Option.some(
                new Binary(new Add(), new Ident("x"), new Ident("y")),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
});
