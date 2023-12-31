import Result from "./../utils/result.ts";
import Parser from "./mod.ts";
import type { Success } from "./mod.types.ts";
import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("combinators-then", () => {
  const p1 = Parser.number()
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.tag(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.tag(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.tag(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.tag(","))
    .then(Parser.number())
    .then(Parser.identifier());

  const { src, value } = p1
    .then(p1)
    .then(p1)
    .then(p1)
    .then(p1)
    .then(p1)
    .parse(
      "100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k100abc200,1k",
    )
    .unwrap();
  const right: Success<string> = { src: "", value: "k" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-string", () => {
  assertEquals(
    Parser.string().parse('"This is a string"'),
    Result.ok(
      {
        src: "",
        value: '"This is a string"',
      } satisfies Success<string>,
    ),
  );
});

Deno.test("combinators-number", () => {
  const { src, value } = Parser.number().parse("100").unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-left", () => {
  const { src, value } = Parser.left(Parser.number(), Parser.tag(")"))
    .parse("100)")
    .unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-surround", () => {
  const { src, value } = Parser.surround(
    Parser.tag("("),
    Parser.number(),
    Parser.tag(")"),
  )
    .parse("(100)")
    .unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-oneOf", () => {
  const parser = Parser.oneOf(
    Parser.number().map((x) => String(x)),
    Parser.string(),
  );
  // Number
  assertEquals(parser.parse("123").unwrap(), { src: "", value: "123" });
  // String
  assertEquals(parser.parse('"123"').unwrap(), { src: "", value: '"123"' });
});

Deno.test("combinators-right", () => {
  const { src, value } = Parser.right(Parser.tag("("), Parser.number())
    .parse("(100)")
    .unwrap();
  const right: Success<string> = { src: ")", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-tag", () => {
  const result = Parser.tag("foo").parse("foo");
  const { src, value } = result.unwrap();
  const right: Success<string> = { src: "", value: "foo" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-many0", () => {
  const parser = Parser.right(
    Parser.whitespace().optional(),
    Parser.number(),
  ).many0();
  const result = parser.parse("123 321 1 2 3").unwrap();
  const right: Success<string[]> = {
    src: "",
    value: ["123", "321", "1", "2", "3"],
  };
  assertEquals(right, result);
});

Deno.test("combinators-or-simple", () => {
  const parser = Parser.tag("foo").or(Parser.tag("bar"));
  assertEquals(parser.parse("foo").unwrap(), { src: "", value: "foo" });
  assertEquals(parser.parse("bar").unwrap(), { src: "", value: "bar" });
});

Deno.test("combinators-or-with-map", () => {
  const parser = Parser.tag<string>("foo")
    .map((x: string) => x.toUpperCase())
    .or(Parser.tag<string>("bar"));
  assertEquals(parser.parse("foo").unwrap(), { src: "", value: "FOO" });
  assertEquals(parser.parse("bar").unwrap(), { src: "", value: "bar" });
});
