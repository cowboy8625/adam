import Result from "./../utils/result.ts";
import Parser from "./mod.ts";
import type { Success } from "./mod.types.ts";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("combinators-then", () => {
  const p1 = Parser.number()
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.literal(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.literal(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.literal(","))
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.identifier())
    .then(Parser.number())
    .then(Parser.literal(","))
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
    Result.ok({
      src: "",
      value: '"This is a string"',
    } satisfies Success<string>),
  );
});

Deno.test("combinators-number", () => {
  assertEquals(
    Parser.number().parse("100"),
    Result.ok({ src: "", value: "100" }),
  );
  assertEquals(
    Parser.number().parse("100, 123"),
    Result.ok({ src: ", 123", value: "100" }),
  );

  assertEquals(Parser.number().parse(" 100, 123"), Result.err(" 100, 123"));
});

Deno.test("combinators-left", () => {
  const { src, value } = Parser.left(Parser.number(), Parser.literal(")"))
    .parse("100)")
    .unwrap();
  const right: Success<string> = { src: "", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-surround", () => {
  const { src, value } = Parser.surround(
    Parser.literal("("),
    Parser.number(),
    Parser.literal(")"),
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
  const { src, value } = Parser.right(Parser.literal("("), Parser.number())
    .parse("(100)")
    .unwrap();
  const right: Success<string> = { src: ")", value: "100" };
  assertEquals(right, { src, value });
});

Deno.test("combinators-literal", () => {
  const result = Parser.literal("foo").parse("foo");
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

Deno.test("combinators-many1", () => {
  const parser = Parser.right(
    Parser.whitespace().optional(),
    Parser.number(),
  ).many1();

  // Case 1: Successful match (like many0)
  const result1 = parser.parse("123 321 1 2 3").unwrap();
  const expected1: Success<string[]> = {
    src: "",
    value: ["123", "321", "1", "2", "3"],
  };
  assertEquals(result1, expected1);

  // Case 2: Should fail if there are no numbers
  const result2 = parser.parse("  ");
  assert(!result2.ok, "many1() should fail when no matches are found");
});

Deno.test("combinators-or-simple", () => {
  const parser = Parser.literal("foo").or(Parser.literal("bar"));
  assertEquals(parser.parse("foo").unwrap(), { src: "", value: "foo" });
  assertEquals(parser.parse("bar").unwrap(), { src: "", value: "bar" });
});

Deno.test("combinators-or-with-map", () => {
  const parser = Parser.literal("foo")
    .map((x: string) => x.toUpperCase())
    .or(Parser.literal("bar"));
  assertEquals(parser.parse("foobar").unwrap(), { src: "bar", value: "FOO" });
  assertEquals(parser.parse("bar").unwrap(), { src: "", value: "bar" });
});

Deno.test("combinators-andThen", () => {
  assertEquals(
    Parser.literal("foo")
      .andThen(() => Parser.literal("bar"))
      .parse("foobar")
      .unwrap(),
    {
      src: "",
      value: ["foo", "bar"],
    },
  );

  assertEquals(
    Parser.literal("foo")
      .andThen(Parser.literal("bar"))
      .parse("foobar")
      .unwrap(),
    {
      src: "",
      value: ["foo", "bar"],
    },
  );
});
