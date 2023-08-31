import {
  Compile,
  AstVisitor
} from "./../codegen/rust/mod.ts";

export type Statement = ExprStmt | LetBinding;
export type Expression = IfElse | Binary | Number | Boolean | Ident;
export type Op = Add;

// fn <name>(<params>) {
//  <Block>
// }
export class Function implements Compile {
  name: Ident;
  params: Array<Ident>;
  block: Block;
  constructor(name: Ident, params: Array<Ident>, block: Block) {
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
  block: Array<Statement | Expression>;
  constructor(block: Array<Statement | Expression>) {
    this.block = block;
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}

// let <name> = <Statement>
export class LetBinding implements Compile {
  name: Ident;
  statement: Statement;
  constructor(name: Ident, statement: Statement) {
    this.name = name;
    this.statement = statement;
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
export class IfElse implements Compile {
  condition: Expression;
  thenBranch: Block;
  elseBranch: Block | IfElse | undefined;
  constructor(condition: Expression, thenBranch: Block, elseBranch: Block | IfElse | undefined) {
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
  constructor(left: Expression, right: Expression, op: Op) {
    this.left = left;
    this.right = right;
    this.op = op;
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

export class Add implements Compile {
  op: string;
  constructor() {
    this.op = "+";
  }

  accept(visitor: AstVisitor): string {
    return visitor.visit(this);
  }
}
