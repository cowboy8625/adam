import Result from "./../utils/result.ts";
import Parse from "./mod.ts";
import type { Success } from "./mod.types.ts";
import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("combinators-string", () => {
  assertEquals(
    Parse.string().parse('"This is a string"'),
    Result.ok({
      src: "",
      value: '"This is a string"',
    } satisfies Success<string>),
  );
});

Deno.test("combinators-number", () => {
  const { src, value } = Parse.number().parse("100").unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-left", () => {
  const { src, value } = Parse.left(Parse.number(), Parse.tag(")"))
    .parse("100)")
    .unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-surround", () => {
  const { src, value } = Parse.surround(
    Parse.tag("("),
    Parse.number(),
    Parse.tag(")"),
  )
    .parse("(100)")
    .unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-oneOf", () => {
  const parser = Parse.oneOf(
    Parse.number().map((x) => String(x)),
    Parse.string(),
  );
  // Number
  assertEquals(parser.parse("123").unwrap(), { src: "", value: "123" });
  // String
  assertEquals(parser.parse('"123"').unwrap(), { src: "", value: '"123"' });
});

Deno.test("combinators-right", () => {
  const { src, value } = Parse.right(Parse.tag("("), Parse.number())
    .parse("(100)")
    .unwrap();
  const right: Success<string> = { src: ")", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-tag", () => {
  const result = Parse.tag("foo").parse("foo");
  const { src, value } = result.unwrap();
  const right: Success<string> = { src: "", value: "foo" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-many0", () => {
  const parser = Parse.right(
    Parse.whitespace().optional(),
    Parse.number(),
  ).many0();
  const result = parser.parse("123 321 1 2 3").unwrap();
  const right: Success<string[]> = {
    src: "",
    value: ["123", "321", "1", "2", "3"],
  };
  assertEquals(right, result);
});
