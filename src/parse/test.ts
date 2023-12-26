import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import {
  parse,
  identParser,
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
  Statement,
  Function,
  Ident,
  Binary,
  Block,
  Add,
  Call,
  Expression,
  ExprStmt,
} from "../ast/mod.ts";
import Result from "../utils/result.ts";

Deno.test("parse bianary", () => {
  const result = parse("fn add(x, y) { x + y }");
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
        new Ident("add"),
        [new Ident("x"), new Ident("y")],
        new Block([
          new ExprStmt(
            new Call(new Ident("add"), [new Ident("x"), new Ident("y")]),
          ),
        ]),
      ),
    ]),
  );
});

Deno.test("statementParser", () => {
  const result = statementParser("add(x, y);");
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
  const result = paramParser({
    src: "(x, y, z,)",
    value: new Ident("add"),
  });
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [
        new Ident("add"),
        [new Ident("x"), new Ident("y"), new Ident("z")],
      ],
    }),
  );
});

Deno.test("identParser", () => {
  const result = identParser({
    src: "   add",
    value: "fn",
  });
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: new Ident("add"),
    }),
  );
});

Deno.test("blockParser", () => {
  const result = blockParser({
    src: "{ x + y; }",
    value: [new Ident("add"), [new Ident("x"), new Ident("y")]],
  });
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [
        new Ident("add"),
        [new Ident("x"), new Ident("y")],
        new Block([
          new ExprStmt(new Binary(new Ident("x"), new Ident("y"), new Add())),
        ]),
      ],
    }),
  );
});

Deno.test("expressionParser", () => {
  const result = expressionParser(" x       + y ");
  assertEquals(
    result,
    Result.ok({
      src: " ",
      value: new Binary(new Ident("x"), new Ident("y"), new Add()),
    }),
  );
});

Deno.test("binaryParser", () => {
  const result = binaryParser(" x + y");
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: new Binary(new Ident("x"), new Ident("y"), new Add()),
    }),
  );
});

Deno.test("callParser", () => {
  const callExpr = callParser("add(x, y)");
  assertEquals(
    callExpr,
    Result.ok({
      src: "",
      value: new Call(new Ident("add"), [new Ident("x"), new Ident("y")]),
    }),
  );
});

Deno.test("argumentParser", () => {
  const result = argumentParser({ src: "(x, y)", value: new Ident("add") });
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [
        new Ident("add"),
        [new Ident("x") as Expression, new Ident("y") as Expression],
      ],
    }),
  );
});

Deno.test("primaryParser", () => {
  const result = primaryParser("     add");
  assertEquals(result, Result.ok({ src: "", value: new Ident("add") }));
});
