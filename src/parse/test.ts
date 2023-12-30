import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import {
  parse,
  binaryParser,
  expressionParser,
  blockParser,
  paramParser,
  primaryParser,
  callParser,
  argumentParser,
  statementParser,
} from "./mod.ts";
import {
  Function,
  Ident,
  Binary,
  Block,
  Add,
  Call,
  Expression,
  ExprStmt,
  StringLiteral,
  Number,
} from "../ast/mod.ts";
import Result from "../utils/result.ts";

Deno.test("parse bianary", () => {
  const result = parse("fn add(x, y) { x + y; }");
  assertEquals(
    result,
    Result.ok([
      new Function(
        new Ident("add"),
        [new Ident("x"), new Ident("y")],
        new Block([
          new ExprStmt(new Binary(new Ident("x"), new Ident("y"), new Add())),
        ]),
      ),
    ]),
  );
});

Deno.test("parse call", () => {
  const result = parse("fn main() { add(x, y); }");
  assertEquals(
    result,
    Result.ok([
      new Function(
        new Ident("main"),
        [],
        new Block([
          new ExprStmt(
            new Call(new Ident("add"), [new Ident("x"), new Ident("y")]),
          ),
        ]),
      ),
    ]),
  );
});

Deno.test("hello world", () => {
  const result = parse('fn main() { print("Hello World!"); }');
  assertEquals(
    result,
    Result.ok([
      new Function(
        new Ident("main"),
        [],
        new Block([
          new ExprStmt(
            new Call(new Ident("print"), [new StringLiteral('"Hello World!"')]),
          ),
        ]),
      ),
    ]),
  );
});

Deno.test("statementParser", () => {
  const result = statementParser().parse("add(x, y);");
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: new ExprStmt(
        new Call(new Ident("add"), [new Ident("x"), new Ident("y")]),
      ),
    }),
  );
});

Deno.test("paramParser", () => {
  const result = paramParser().parse("(x, y, z,)");
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [new Ident("x"), new Ident("y"), new Ident("z")],
    }),
  );
});

Deno.test("blockParser", () => {
  const result = blockParser().parse("{ x + y; }");
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: new Block([
        new ExprStmt(new Binary(new Ident("x"), new Ident("y"), new Add())),
      ]),
    }),
  );
});

Deno.test("expressionParser", () => {
  const result = expressionParser().parse(" x       + y ");
  assertEquals(
    result,
    Result.ok({
      src: " ",
      value: new Binary(new Ident("x"), new Ident("y"), new Add()),
    }),
  );
});

Deno.test("binaryParser", () => {
  assertEquals(
    binaryParser().parse(" x + y"),
    Result.ok({
      src: "",
      value: new Binary(new Ident("x"), new Ident("y"), new Add()),
    }),
    "x + y",
  );

  assertEquals(
    binaryParser().parse(" 1 + 2 + 3"),
    Result.ok({
      src: "",
      value: new Binary(
        new Binary(new Number("1"), new Number("2"), new Add()),
        new Number("3"),
        new Add(),
      ),
    }),
    "1 + 2 + 3",
  );
});

Deno.test("callParser", () => {
  const callExpr = callParser().parse("add(x, y)");
  assertEquals(
    callExpr,
    Result.ok({
      src: "",
      value: new Call(new Ident("add"), [new Ident("x"), new Ident("y")]),
    }),
  );
});

Deno.test("argumentParser", () => {
  const result = argumentParser().parse("(x, y)");
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [new Ident("x") as Expression, new Ident("y") as Expression],
    }),
  );
});

Deno.test("primaryParser ident", () => {
  const result = primaryParser().parse("     add");
  assertEquals(result, Result.ok({ src: "", value: new Ident("add") }));
});

Deno.test("primaryParser number", () => {
  const result = primaryParser().parse("     123");
  assertEquals(result, Result.ok({ src: "", value: new Number("123") }));
});

Deno.test("primaryParser string", () => {
  const result = primaryParser().parse('"123"');
  assertEquals(
    result,
    Result.ok({ src: "", value: new StringLiteral('"123"') }),
  );
});
