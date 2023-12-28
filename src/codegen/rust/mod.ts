import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";

import {
  Div,
  Mul,
  Sub,
  Add,
  Binary,
  Unary,
  Block,
  Boolean,
  Expression,
  ExprStmt,
  Function,
  Ident,
  IfElse,
  Array,
  Let,
  Number,
  Op,
  Statement,
  Call,
  StringLiteral,
} from "./../../ast/mod.ts";

export interface Compile {
  accept(visitor: AstVisitor): string;
}

export interface AstVisitor {
  visitFunction(node: Function): string;
  visitFuncParam(node: FuncParam): string;
  visitBlock(node: Block): string;
  visitLet(node: Let): string;
  visitExprStmt(node: ExprStmt): string;
  visitArray(node: Array): string;
  visitIfElse(node: IfElse): string;
  visitBinary(node: Binary): string;
  visitUnary(node: Unary): string;
  visitCall(node: Call): string;
  visitStringLiteral(node: StringLiteral): string;
  visitNumber(node: Number): string;
  visitIdent(node: Ident): string;
  visitOp(node: Op): string;
  visit(
    node: Function | FuncParam | Block | Statement | Expression | Op,
  ): string;
}

export class FuncParam implements Compile {
  id: Ident;
  index: number;
  constructor(id: Ident, index: number) {
    this.id = id;
    this.index = index;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Compiler implements AstVisitor {
  visitFunction(node: Function): string {
    const name = this.visit(node.name);
    const block = this.visit(node.block);
    if (name === "main") {
      return `fn ${name}() ${block}`;
    }
    // FIXME: Not sure how to fix this just yet
    // node.params.reverse().forEach((ident, index) => {
    //   node.block.pushToStart(
    //     new FuncParam(ident, node.params.length - index - 1),
    //   );
    // });
    return `fn ${name}(args: Vec<Object>) -> Object ${block}`;
  }

  visitFuncParam(node: FuncParam): string {
    const id = this.visit(node.id);
    return `let ${id} = args[${node.index}].clone();`;
  }

  visitBlock(node: Block): string {
    const stmts = node.block
      .map((stmt: FuncParam | Statement | Expression) => this.visit(stmt))
      .join("\n");
    return `{
${stmts}
}`;
  }

  visitLet(node: Let): string {
    const name = this.visit(node.name);
    const stmt = this.visit(node.expression);
    return `let mut ${name} = ${stmt}`;
  }

  visitExprStmt(node: ExprStmt): string {
    const expr = this.visit(node.expression);
    return `${expr};`;
  }

  visitArray(_: Array): string {
    std.unimplemented("Array code gen not unimplemented yet");
  }

  visitIfElse(node: IfElse): string {
    const condition = this.visit(node.condition);
    const thenBranch = this.visit(node.thenBranch);
    const blockOrIfElse = node?.elseBranch ? " else " : "";
    const elseBranch = node?.elseBranch ? this.visit(node.elseBranch) : "";
    return `if ${condition}.unwrap_boolean_or_default() ${thenBranch}${blockOrIfElse}${elseBranch}`;
  }

  visitBinary(node: Binary): string {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    const op = this.visit(node.op);
    return `${left} ${op} ${right}`;
  }

  visitUnary(node: Unary): string {
    const op = this.visit(node.op);
    const right = this.visit(node.right);
    return `${op}${right}`;
  }

  visitCall(node: Call): string {
    const name = this.visit(node.value);
    if (name === "print") {
      return `println!("{}", ${node.args
        .map((arg) => this.visit(arg))
        .join(", ")})`;
    }
    const args = node.args.map((arg) => this.visit(arg)).join(", ");
    return `${name}(${args})`;
  }

  visitStringLiteral(node: StringLiteral): string {
    return `Object::String(${node.value}.to_string())`;
  }

  visitNumber(node: Number): string {
    const value = node.value.includes(".") ? node.value : `${node.value}.0`;
    return `Object::Number(${value})`;
  }

  visitBoolean(node: Boolean): string {
    return `Object::Boolean(${node.boolean})`;
  }

  visitIdent(node: Ident): string {
    return `${node.ident}`;
  }

  visitOp(node: Op): string {
    return `${node.op}`;
  }

  visit(
    node: Function | FuncParam | Block | Statement | Expression | Op,
  ): string {
    if (node instanceof Function) {
      return this.visitFunction(node);
    } else if (node instanceof FuncParam) {
      return this.visitFuncParam(node);
    } else if (node instanceof Block) {
      return this.visitBlock(node);
    } else if (node instanceof Let) {
      return this.visitLet(node);
    } else if (node instanceof ExprStmt) {
      return this.visitExprStmt(node);
    } else if (node instanceof IfElse) {
      return this.visitIfElse(node);
    } else if (node instanceof Binary) {
      return this.visitBinary(node);
    } else if (node instanceof Unary) {
      return this.visitUnary(node);
    } else if (node instanceof Call) {
      return this.visitCall(node);
    } else if (node instanceof StringLiteral) {
      return this.visitStringLiteral(node);
    } else if (node instanceof Number) {
      return this.visitNumber(node);
    } else if (node instanceof Boolean) {
      return this.visitBoolean(node);
    } else if (node instanceof Ident) {
      return this.visitIdent(node);
    } else if (node instanceof Add) {
      return this.visitOp(node);
    } else if (node instanceof Sub) {
      return this.visitOp(node);
    } else if (node instanceof Mul) {
      return this.visitOp(node);
    } else if (node instanceof Div) {
      return this.visitOp(node);
    }
    const nodeName = ((node) => {
      return node.constructor.name;
    })(node as unknown as Function | Block | Statement | Expression | Op);
    std.unimplemented(`create a visit method for ${nodeName} visit`);
  }

  compile(node: Compile): string {
    return node.accept(this);
  }
}
