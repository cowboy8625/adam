import * as std from "https://deno.land/std@0.200.0/assert/mod.ts";

import {
  Function,
  Block,
  Statement,
  LetBinding,
  Expression,
  ExprStmt,
  IfElse,
  Binary,
  Number,
  Boolean,
  Ident,
  Op,
  Add,
} from "./../../ast/mod.ts";

export interface Compile {
  accept(visitor: AstVisitor): string
}

export interface AstVisitor {
  visitFunction(node: Function): string
  visitBlock(node: Block): string
  visitLetBinding(node: LetBinding): string
  visitExprStmt(node: ExprStmt): string
  visitIfElse(node: IfElse): string
  visitBinary(node: Binary): string
  visitNumber(node: Number): string
  visitIdent(node: Ident): string
  visitOp(node: Op): string
  visit(node: Function | Block | Statement | Expression | Op): string
}

export class Compiler implements AstVisitor {
  visitFunction(node: Function): string {
    const name = this.visit(node.name);
    const params = node.params.map((p) => this.visit(p)).join(", ");
    const block = this.visit(node.block);
    return `fn ${name}(${params}) -> Object ${block}`
  }

  visitBlock(node: Block): string {
    const stmts = node.block.map((stmt: Statement | Expression) => this.visit(stmt)).join("\n");
    return `{
${stmts}
}`;
  }

  visitLetBinding(node: LetBinding): string {
    const name = this.visit(node.name);
    const stmt = this.visit(node.statement);
    return `let mut ${name} = ${stmt}`;
  }

  visitExprStmt(node: ExprStmt): string {
    const stmt = this.visit(node.expression);
    return `${stmt};`;
  }

  visitIfElse(node: IfElse): string {
    const condition = this.visit(node.condition)
    const thenBranch = this.visit(node.thenBranch)
    const blockOrIfElse = node?.elseBranch ? " else " : "";
    const elseBranch = node?.elseBranch ? this.visit(node.elseBranch) : "";
    return `if ${condition}.unwrap_boolean_or_default() ${thenBranch}${blockOrIfElse}${elseBranch}`
  }

  visitBinary(node: Binary): string {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    const op = this.visit(node.op);
    return `${left} ${op} ${right}`;
  }

  visitNumber(node: Number): string {
    return `Object::Number(${node.value})`;
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

  visit(node: Function | Block | Statement | Expression | Op): string {
    if (node instanceof Function) {
      return this.visitFunction(node);
    } else if (node instanceof Block) {
      return this.visitBlock(node);
    } else if (node instanceof LetBinding) {
      return this.visitLetBinding(node);
    } else if (node instanceof ExprStmt) {
      return this.visitExprStmt(node);
    } else if (node instanceof IfElse) {
      return this.visitIfElse(node);
    } else if (node instanceof Binary) {
      return this.visitBinary(node);
    } else if (node instanceof Number) {
      return this.visitNumber(node);
    } else if (node instanceof Boolean) {
      return this.visitBoolean(node);
    } else if (node instanceof Ident) {
      return this.visitIdent(node);
    } else if (node instanceof Add) {
      return this.visitOp(node);
    }
    std.unreachable();
  }


  compile(node: Compile): string {
    return node.accept(this);
  }
}
