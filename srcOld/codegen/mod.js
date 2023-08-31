import { exprKind } from "./../parse/expr.js";

export const codeGen = async (filename, ast) => {
  filename = `${filename.split(".")[0]}.rs`;
  let code = codeGenFromAst(ast);

  code += `fn main() {
    adam_main();
}`;

  await Deno.writeTextFile(filename, code, {
    create: true,
  });
  return filename;
};

const codeGenFromAst = (ast) => {
  let code = "";
  for (const node of ast) {
    switch (node.kind) {
      case exprKind.Fn:
        let rust = codeGenFromExprFunc(node);
        code += rust;
        break;

      default:
        console.assert(false, `codeGenFromAst ${node}`);
        break;
    }
  }
  return code;
};

const codeGenFromExprFunc = (func) => {
  const body = codeGenFromBody(func.body);
  return `fn adam_${func.name}(${func.params}) {
${body}
}\n`;
};

const codeGenFromBody = (body) => {
  return body.map(codeGenFromStmt).join(";\n");
};

const codeGenFromStmt = (stmt) => {
  switch (stmt.kind) {
    case exprKind.Let:
      return codeGenFromExprLet(stmt);
    case exprKind.Call:
      return codeGenFromExprCall(stmt);
    case exprKind.IfElse:
      return codeGenFromExprIfElse(stmt);
    default:
      return console.assert(false, `codeGenFromStmt ${exprKind.from(stmt.kind)}`);
  }
};

const codeGenFromExprIfElse = (ifElseStmt) => {
  const condition = codeGenFromExpr(ifElseStmt.condition);
  const thenBranch = codeGenFromBody(ifElseStmt.thenBranch);
  let elseBranch = "";
  switch (ifElseStmt?.elseBranch?.kind) {
    case exprKind.IfElse:
      elseBranch = codeGenFromExprIfElse(ifElseStmt);
      break;
    case null:
      break;
    default:
      elseBranch = `else {${codeGenFromBody(ifElseStmt.elseBranch)}\n}`;
      break;

  }
  return `if ${condition} {
  ${thenBranch};
} ${elseBranch}`;
};

const codeGenFromExprLet = (letStmt) => {
  const expr = codeGenFromExpr(letStmt.expr);
  return `let mut ${letStmt.name} = ${expr}`;
};

const codeGenFromExprCall = (call) => {
  let args = call.args.map(codeGenFromExpr).join(", ");
  let formatArgCount = call.args.map((_) => "{}").join(" ");
  switch (call.name) {
    case "print":
      return `println!("${formatArgCount}", ${args})`;
    default:
      return `${call.name}(${call.args})`;
  }
};

const codeGenFromExpr = (expr) => {
  switch (expr.kind) {
    case exprKind.ValueIdent:
      return `${expr.item.lexme}`;
    case exprKind.ValueNumber:
      return expr.item.lexme;
    case exprKind.ValueString:
      return `"${expr.item.lexme}"`;
    case exprKind.ValueBoolean:
      return `${expr.item.lexme}`;
    case exprKind.Binary:
      return codeGenFromExprBinary(expr);
    case exprKind.Call:
      return codeGenFromExprCall(expr);
    default:
      return console.assert(false, `codeGenFromExpr ${expr}`);
  }
};

const codeGenFromExprBinary = (bin) => {
  return `${bin.left.item.lexme} ${bin.op.lexme} ${bin.right.item.lexme}`;
};
