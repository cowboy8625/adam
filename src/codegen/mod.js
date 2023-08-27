import { exprKind } from "./../parse/expr.js";

export const codeGen = async (filename, ast) => {
  filename = `${filename.split(".")[0]}.rs`;
  console.log("filename: ", filename);
  const code = codeGenFromAst(ast);
  await Deno.writeTextFile(filename, code, {
    create: true,
  });
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
        console.assert(false, `unknown ${node}`);
        break;
    }
  }
  return code;
};

const codeGenFromExprFunc = (func) => {
  const body = codeGenFromBody(func.body);
  return `fn adam_${func.name}(${func.params}) {
${body}
}`;
};

const codeGenFromBody = (body) => {
  return body.map(codeGenFromStmt).join("\n");
};

const codeGenFromStmt = (stmt) => {
  switch (stmt.kind) {
    case exprKind.Let:
      return codeGenFromExprLet(stmt);
    case exprKind.Call:
      return codeGenFromExprCall(stmt);
    default:
      return console.assert(false, `unknown ${stmt}`);
  }
};

const codeGenFromExprLet = (letStmt) => {
  const expr = codeGenFromExpr(letStmt.expr);
  return `let mut ${letStmt.name} = ${expr};`;
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
  console.log(exprKind.from(expr.kind), expr.item);
  switch (expr.kind) {
    case exprKind.ValueIdent:
      return `${expr.item.lexme}`;
    case exprKind.ValueNumber:
      return expr.item.lexme;
    case exprKind.ValueString:
      return `"${expr.item.lexme}"`;
  }
};
