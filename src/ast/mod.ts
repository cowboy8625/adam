import { AstVisitor, Compile, FuncParam } from "./../codegen/rust/mod.ts";

"Hello world \0";

export type Declaration = Function;
export type Statement = ExprStmt;
export type Expression =
  | Let
  | Array
  | IfElse
  | Binary
  | Unary
  | Call
  | Number
  | Boolean
  | Ident;
export type Op = Not | Add | Sub | Mul | Div;

// fn <name>(<params>) {
//  <Block>
// }
export class Function implements Compile {
  name: Ident;
  params: Ident[];
  block: Block;
  constructor(name: Ident, params: Ident[], block: Block) {
    this.name = name;
    this.params = params;
    this.block = block;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// Array of Statements
// {
//  <Statement>...
// }
export class Block implements Compile {
  block: Statement[];
  constructor(block: Statement[]) {
    this.block = block;
  }

  pushToStart(stmt: Statement) {
    this.block.unshift(stmt);
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// let <name> = <Statement>
export class Let implements Compile {
  name: Ident;
  expression: Expression;
  constructor(name: Ident, expression: Expression) {
    this.name = name;
    this.expression = expression;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// DELIMINATOR = ';'
// exprssion ending with a DELIMINATOR
// <Exprssion> ;
export class ExprStmt implements Compile {
  expression: Expression;
  constructor(expression: Expression) {
    this.expression = expression;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// <Expression> <Op> <Expression>
export class Array implements Compile {
  expressions: Expression[];
  constructor(expressions: Expression[]) {
    this.expressions = expressions;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// <Expression> <Op> <Expression>
export class IfElse implements Compile {
  condition: Expression;
  thenBranch: Block;
  elseBranch: Block | IfElse | undefined;
  constructor(
    condition: Expression,
    thenBranch: Block,
    elseBranch: Block | IfElse | undefined,
  ) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// <Expression> <Op> <Expression>
export class Binary implements Compile {
  left: Expression;
  right: Expression;
  op: Op;
  constructor(op: Op, left: Expression, right: Expression) {
    this.op = op;
    this.left = left;
    this.right = right;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// <Op> <Expression>
export class Unary implements Compile {
  op: Op;
  right: Expression;
  constructor(op: Op, right: Expression) {
    this.op = op;
    this.right = right;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// <Ident> ( <Expression> ) +
export class Call implements Compile {
  value: Ident;
  args: Expression[];
  constructor(value: Ident, args: Expression[]) {
    this.value = value;
    this.args = args;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// String "..."
export class StringLiteral implements Compile {
  value: string;
  constructor(value: string) {
    this.value = value;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// Number [1-9]
export class Number implements Compile {
  value: string;
  constructor(value: string) {
    this.value = value;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Boolean implements Compile {
  boolean: string;
  constructor(boolean: string) {
    this.boolean = boolean;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// Ident names start with a [a-zA-Z] or a '_'
export class Ident implements Compile {
  ident: string;
  constructor(ident: string) {
    this.ident = ident;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Not implements Compile {
  op: string;
  constructor() {
    this.op = "!";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Add implements Compile {
  op: string;
  constructor() {
    this.op = "+";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Sub implements Compile {
  op: string;
  constructor() {
    this.op = "-";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Mul implements Compile {
  op: string;
  constructor() {
    this.op = "-";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

export class Div implements Compile {
  op: string;
  constructor() {
    this.op = "/";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}
