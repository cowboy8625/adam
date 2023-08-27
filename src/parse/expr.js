import { auto, print } from "./../util.ts";

export const exprKind = Object.freeze({
  ValueNumber: auto(true),
  ValueString: auto(),
  ValueIdent: auto(),
  Binary: auto(),
  Let: auto(),
  Fn: auto(),
  Call: auto(),
  from: (num) => {
    switch (num) {
      case 0:
        return "ValueNumber";
      case 1:
        return "ValueString";
      case 2:
        return "ValueIdent";
      case 3:
        return "ExprBinary";
      case 4:
        return "ExprLet";
      case 5:
        return "ExprFn";
      case 6:
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

  toString() {
    return `${
      exprKind.from(this.kind)
    }(${this.name}, ${this.params}, ${this.body})`;
  }
}

export class ExprLet {
  constructor(name, expr) {
    this.kind = exprKind.Let;
    this.name = name;
    this.expr = expr;
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

  toString() {
    return `${
      exprKind.from(this.kind)
    }( ${this.op.lexme} ${this.left.item.lexme} ${this.right.item.lexme} )`;
  }
}

export class ValueNumber {
  constructor(item) {
    this.kind = exprKind.ValueNumber;
    this.item = item;
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

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}

export class ValueIdent {
  constructor(item) {
    this.kind = exprKind.ValueIdent;
    this.item = item;
  }

  toString() {
    return `${exprKind.from(this.kind)}( ${this.item.toString()} )`;
  }
}
