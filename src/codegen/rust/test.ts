import {
  Compile,
  AstVisitor,
  Compiler,
} from "./mod.ts";

import {
  Function,
  Block,
  LetBinding,
  ExprStmt,
  IfElse,
  Binary,
  Number,
  Boolean,
  Ident,
  Add,
} from "./../../ast/mod.ts";

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("code-gen-Funciton", () => {

  const op = new Add();

  const leftNum   = new Number("123");
  const rightNum  = new Number("321");

  const expr  = new Binary(leftNum, rightNum, op);
  const block = new Block([expr]);

  const xIdent = new Ident("x");
  const yIdent = new Ident("y");
  const params = [xIdent, yIdent];

  const funcIdent = new Ident("add");

  const func = new Function(funcIdent, params, block);

  const compiler = new Compiler();
  const left = compiler.compile(func);
  const right = `fn add(x, y) -> Object {
Object::Number(123) + Object::Number(321)
}`;
  assertEquals(right, left);
});

Deno.test("code-gen-Block", () => {
  const op = new Add();
  const left1 = new Ident("left1");
  const right1 = new Ident("right1");

  const expr1 = new Binary(left1, right1, op);
  const stmt1 = new ExprStmt(expr1);

  const left2 = new Ident("left2");
  const right2 = new Ident("right2");

  const expr2 = new Binary(left2, right2, op);
  const stmt2 = new ExprStmt(expr2);

  const firstBinding = new Ident("foo");
  const letBinding1 = new LetBinding(firstBinding, stmt1);

  const secondBinding = new Ident("bar");
  const letBinding2 = new LetBinding(secondBinding, stmt2);

  const block = new Block([letBinding1, letBinding2]);

  const compiler = new Compiler();
  const left = compiler.compile(block);

  const right = `{
let mut foo = left1 + right1;
let mut bar = left2 + right2;
}`;
  assertEquals(right, left);
});

Deno.test("code-gen-LetBinding", () => {
  const identLeft = new Ident("a");
  const identRight = new Ident("b");
  const op = new Add();
  const bin = new Binary(identLeft, identRight, op);
  const stmt = new ExprStmt(bin);
  const name = new Ident("foo");
  const letBinding = new LetBinding(name, stmt);
  const compiler = new Compiler();
  const left = compiler.compile(letBinding);
  const right = `let mut foo = a + b;`;
  assertEquals(right, left);
});

Deno.test("code-gen-IfElse", () => {
  const condition = new Boolean("true");
  const thenBlock = new Block([new Number("1")]);
  const elseBlock = new Block([new Number("2")]);
  const ifElse = new IfElse(condition, thenBlock, elseBlock);
  const compiler = new Compiler();
  const left = compiler.compile(ifElse);
  const right = `if Object::Boolean(true).unwrap_boolean_or_default() {
Object::Number(1)
} else {
Object::Number(2)
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
