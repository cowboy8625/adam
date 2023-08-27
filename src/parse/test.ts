import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

import { lexer, tokenBuilder, tokenKind } from "./../lexer/lexer.js";
import { parser } from "./parser.js";
import { exprBinary, exprKind } from "./expr.js";

Deno.test("parser-binary", () => {
  const src = "123 + 321";
  const tokens = lexer(src);
  const ast = parser(tokens);
  assertEquals(ast, [
    exprBinary(
      {
        kind: exprKind.ValueNumber,
        item: tokenBuilder(tokenKind.Number, "123"),
      },
      {
        kind: exprKind.ValueNumber,
        item: tokenBuilder(tokenKind.Number, "321"),
      },
      tokenBuilder(tokenKind.Plus, "+"),
    ),
  ]);
});
