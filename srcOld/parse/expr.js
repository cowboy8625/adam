import { auto, print } from "./../util.ts";

export const exprKind = Object.freeze({
  ValueBoolean: auto(true),
  ValueNumber: auto(),
  ValueString: auto(),
  ValueIdent: auto(),
  Binary: auto(),
  IfElse: auto(),
  Let: auto(),
  Fn: auto(),
  Call: auto(),
  from: (num) => {
    switch (num) {
      case 0:
        return "ValueBoolean";
      case 1:
        return "ValueNumber";
      case 2:
        return "ValueString";
      case 3:
        return "ValueIdent";
      case 4:
        return "ExprBinary";
      case 5:
        return "ExprIfElse";
      case 6:
        return "ExprLet";
      case 7:
        return "ExprFn";
      case 8:
        return "ExprCall";
      default:
        return null;
    }
  },
});

export class ExprCall {
  constructor(name, args) {
    this.kind = exprKind.Call;
    this.name = name;
    this.args = args;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}(${this.name}, ${this.args})`;
  }
}

export class ExprFunc {
  constructor(name, params, body) {
    this.kind = exprKind.Fn;
    this.name = name;
    this.params = params;
    this.body = body;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}(
      name: ${this.name},
      params: ${this.params.join(",\n\t")},
      body: ${this.body.join(",\n\t")}\n
)\n`;
  }
}

export class ExprLet {
  constructor(name, expr) {
    this.kind = exprKind.Let;
    this.name = name;
    this.expr = expr;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}(${this.name}, ${this.expr})`;
  }
}

export class ExprBinary {
  constructor(left, right, op) {
    this.kind = exprKind.Binary;
    this.left = left;
    this.right = right;
    this.op = op;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${
      exprKind.from(this.kind)
    }( ${this.op.lexme} ${this.left.item.lexme} ${this.right.item.lexme} )`;
  }
}

export class ExprIfElse {
  constructor(condition, thenBranch, elseBranch) {
    this.kind = exprKind.IfElse;
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}(${this.condition.item.lexme}
      ${this.thenBranch}
      ${this.elseBranch}
    )`;
  }
}

export class ValueBoolean {
  constructor(item) {
    this.kind = exprKind.ValueBoolean;
    this.item = item;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}

export class ValueNumber {
  constructor(item) {
    this.kind = exprKind.ValueNumber;
    this.item = item;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}

export class ValueString {
  constructor(item) {
    this.kind = exprKind.ValueString;
    this.item = item;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}

export class ValueIdent {
  constructor(item) {
    this.kind = exprKind.ValueIdent;
    this.item = item;
  }

  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}
