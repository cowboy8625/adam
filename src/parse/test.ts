import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import { call, factor, num, parse, primary, term, unary } from "./mod.ts";
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
  StringLiteral,
  Sub,
  Unary,
} from "../ast/mod.ts";

import Result from "../utils/result.ts";

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
});
Deno.test("parse unary", () => {
  assertEquals(
    unary().parse("-1"),
    Result.ok({ src: "", value: new Unary(new Sub(), new Number("1")) }),
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
