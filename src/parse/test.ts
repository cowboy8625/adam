import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import { parse } from "./mod.ts";
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
