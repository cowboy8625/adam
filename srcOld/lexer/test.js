import { print } from "./../util.ts";
import { lexer, parserBuilder, tokenBuilder, tokenKind } from "./lexer.js";

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("lexer", () => {
  const src = '(100 "abc" ident_ifier)';
  const [_, tokens] = lexer(src);
  assertEquals(tokens.map((t) => t.toString()), [
    tokenBuilder(tokenKind.LeftParan, "(").toString(),
    tokenBuilder(tokenKind.Number, "100").toString(),
    tokenBuilder(tokenKind.String, "abc").toString(),
    tokenBuilder(tokenKind.Ident, "ident_ifier").toString(),
    tokenBuilder(tokenKind.RightParan, ")").toString(),
  ]);
});
