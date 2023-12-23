import Result from "./../utils/result.ts";
import Parse from "./mod.ts";
import type { ParserResultSuccess } from "./mod.types.ts";
import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("combinators-string", () => {
  const { src, value } = Parse.string('"This is a string"').unwrap();
  const right: ParserResultSuccess<string> = {
    src: "",
    value: '"This is a string"',
  };
  assertEquals(right, { src, value });
});

Deno.test("combinators-number", () => {
  const { src, value } = Parse.number("100").unwrap();
  const right: ParserResultSuccess<number> = { src: "", value: 100 };
  assertEquals(right, { src, value });
});

Deno.test("combinators-tag", () => {
  const result = Parse.tag("foo")("foo");
  const { src, value } = result.unwrap();
  const right: ParserResultSuccess<string> = { src: "", value: "foo" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-many0", () => {
  const { src, value } = Parse.many0((src) => {
    const r1 = Parse.whitespace(src);
    src = r1.isOk() ? r1.unwrap().src : src;

    const result = Parse.number(src);
    if (result.isErr()) {
      return result;
    }
    const { src: src1, value } = result.unwrap();
    return Result.ok({
      src: src1,
      value,
    });
  })("123 321 1 2 3").unwrap();
  const right: ParserResultSuccess<number[]> = {
    src: "",
    value: [123, 321, 1, 2, 3],
  };
  assertEquals(right, { src, value });
});
