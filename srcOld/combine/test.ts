import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

import { either, left, oneOrMore, right } from "./combin.js";

import {
  comment,
  identifier,
  literal,
  number,
  string,
  whitespace,
} from "./prim.js";

Deno.test("literal", () => {
  const src = "(";
  let [leftoverSrc, item] = literal("(")(src);
  assertEquals(leftoverSrc, "");
  assertEquals(item, "(");
});

Deno.test("identifier", () => {
  const src = "test_ident";
  let [leftoverSrc, item] = identifier(src);
  assertEquals(leftoverSrc, "", "identifier");
  assertEquals(item, "test_ident");
});

Deno.test("left-right-pass", () => {
  const src = '100 "abc" 200';
  let [leftoverSrc, item] = right(
    left(number, whitespace),
    left(left(string, whitespace), number),
  )(src);

  assertEquals(leftoverSrc, "");
  assertEquals(item, "abc");
});

Deno.test("either", () => {
  const src = "100";
  let [leftoverSrc, item] = either(string, number)(src);
  assertEquals(leftoverSrc, "");
  assertEquals(item, "100");
});

Deno.test("oneOrMore", () => {
  const src = "1 2 3 4";
  let [leftoverSrc, item] = oneOrMore(either(left(number, whitespace), number))(
    src,
  );
  assertEquals(leftoverSrc, "");
  assertEquals(item, ["1", "2", "3", "4"]);
});

Deno.test("comment-no-new-line", () => {
  const src = "// Hello ";
  let [leftoverSrc, item] = comment(src);
  assertEquals(leftoverSrc, "");
  assertEquals(item, "// Hello ");
});

Deno.test("comment-new-line", () => {
  const src = "// Hello \n// new line";
  let [leftoverSrc, item] = comment(src);
  assertEquals(leftoverSrc, "// new line");
  assertEquals(item, "// Hello \n");
});
