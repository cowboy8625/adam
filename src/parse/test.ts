import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import {
  parse,
  identParser,
  binaryParser,
  expressionParser,
  blockParser,
  paramParser,
} from "./mod.ts";
import { Function, Ident, Binary, Block, Add } from "../ast/mod.ts";
import Result from "../utils/result.ts";

Deno.test("parse", () => {
  const result = parse("fn add(x, y) { x + y }");
  assertEquals(
    result,
    Result.ok([
      new Function(
        new Ident("add"),
        [new Ident("x"), new Ident("y")],
        new Block([new Binary(new Ident("x"), new Ident("y"), new Add())]),
      ),
    ]),
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
    src: "{ x + y }",
    value: [new Ident("add"), [new Ident("x"), new Ident("y")]],
  });
  assertEquals(
    result,
    Result.ok({
      src: "",
      value: [
        new Ident("add"),
        [new Ident("x"), new Ident("y")],
        new Block([new Binary(new Ident("x"), new Ident("y"), new Add())]),
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

Deno.test("identParser", () => {
  const result = identParser({ src: "     add", value: "fn" });
  assertEquals(result, Result.ok({ src: "", value: new Ident("add") }));
});
