import { Compiler } from "./mod.ts";

import {
  // Div,
  // Mul,
  Sub,
  Add,
  Unary,
  Binary,
  Block,
  Boolean,
  ExprStmt,
  Function,
  Ident,
  IfElse,
  Let,
  Number,
  Call,
  StringLiteral,
} from "./../../ast/mod.ts";

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("code-gen-hello-world", () => {
  const func = new Function(
    new Ident("main"),
    [],
    new Block([
      new ExprStmt(
        new Call(new Ident("print"), [new StringLiteral('"Hello World!"')]),
      ),
    ]),
  );
  const compiler = new Compiler();
  const left = compiler.compile(func);
  console.log(left);
});

Deno.test("code-gen-Funciton", () => {
  const op = new Add();
  const xIdent = new Ident("x");
  const yIdent = new Ident("y");

  const expr = new ExprStmt(new Binary(xIdent, yIdent, op));
  const block = new Block([expr]);

  const params = [xIdent, yIdent];

  const funcIdent = new Ident("add");

  const func = new Function(funcIdent, params, block);

  const compiler = new Compiler();
  const left = compiler.compile(func);
  const right = `fn add(args: Vec<Object>) -> Object {
let x = args[0].clone();
let y = args[1].clone();
x + y
}`;
  assertEquals(right, left);
});

Deno.test("code-gen-Block", () => {
  const op = new Add();
  const left1 = new Ident("left1");
  const right1 = new Ident("right1");

  const expr1 = new Binary(left1, right1, op);

  const left2 = new Ident("left2");
  const right2 = new Ident("right2");

  const expr2 = new Binary(left2, right2, op);

  const firstBinding = new Ident("foo");
  const letBinding1 = new ExprStmt(new Let(firstBinding, expr1));

  const secondBinding = new Ident("bar");
  const letBinding2 = new Let(secondBinding, expr2);

  const block = new Block([letBinding1, letBinding2]);

  const compiler = new Compiler();
  const left = compiler.compile(block);

  const right = `{
let mut foo = left1 + right1;
let mut bar = left2 + right2;
}`;
  assertEquals(right, left);
});

Deno.test("code-gen-Let", () => {
  const identLeft = new Ident("a");
  const identRight = new Ident("b");
  const op = new Add();
  const bin = new Binary(identLeft, identRight, op);
  const name = new Ident("foo");
  const letBinding = new Let(name, bin);
  const compiler = new Compiler();
  const left = compiler.compile(letBinding);
  const right = `let mut foo = a + b;`;
  assertEquals(right, left);
});

Deno.test("code-gen-IfElse", () => {
  const condition = new Boolean("true");
  const thenBlock = new Block([new ExprStmt(new Number("1"))]);
  const elseBlock = new Block([new ExprStmt(new Number("2"))]);
  const ifElse = new IfElse(condition, thenBlock, elseBlock);
  const compiler = new Compiler();
  const left = compiler.compile(ifElse);
  const right = `if Object::Boolean(true).unwrap_boolean_or_default() {
Object::Number(1);
} else {
Object::Number(2);
}`;
  assertEquals(right, left);
});

Deno.test("code-gen-Binary", () => {
  const identLeft = new Ident("a");
  const identRight = new Ident("b");
  const op = new Add();
  const bin = new Binary(identLeft, identRight, op);
  const compiler = new Compiler();
  const left = compiler.compile(bin);
  const right = `a + b`;
  assertEquals(right, left);
});

Deno.test("code-gen-Unary", () => {
  const op = new Sub();
  const num = new Number("123");
  const unary = new Unary(op, num);
  const compiler = new Compiler();
  const left = compiler.compile(unary);
  const right = `-Object::Number(123)`;
  assertEquals(right, left);
});

Deno.test("code-gen-Boolean", () => {
  const boolean = new Boolean("true");
  const compiler = new Compiler();
  const left = compiler.compile(boolean);
  const right = `Object::Boolean(true)`;
  assertEquals(right, left);
});

Deno.test("code-gen-Ident", () => {
  const ident = new Ident("identName123");
  const compiler = new Compiler();
  const left = compiler.compile(ident);
  const right = `identName123`;
  assertEquals(right, left);
});
