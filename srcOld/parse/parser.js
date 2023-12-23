import { print } from "./../util.ts";
import { either, left, oneOrMore, right } from "./../combine/combin.js";
import {
  ExprBinary,
  ExprCall,
  ExprFunc,
  ExprIfElse,
  exprKind,
  ExprLet,
  ValueBoolean,
  ValueIdent,
  ValueNumber,
  ValueString,
} from "./expr.js";
import { lexer, tokenKind } from "./../lexer/lexer.js";

export const parser = (tokens) => {
  return oneOrMore(
    func,
  )(tokens);
};

const tokenParser = (exprKind, ...tokenKinds) => (tokens) =>
  tokenKinds.includes(tokens[0].kind)
    ? [
      tokens.slice(1, tokens.length),
      exprKind !== null ? { kind: exprKind, item: tokens[0] } : tokens[0],
    ]
    : [tokens, null];

const isNextToken = (...kinds) => (token) => kinds.includes(token.kind);

const nextIf = (tokens, fn) => {
  if (fn(tokens[0])) {
    return [tokens.slice(1, tokens.length), tokens[0]];
  }
  return [tokens, null];
};

const identParser = (tokens) => {
  const [stream, ident] = nextIf(tokens, isNextToken(tokenKind.Ident));
  if (!ident) {
    return [tokens, null];
  }
  return [stream, ident.lexme];
};

const paramParser = (tokens) => {
  if (tokens[0].kind !== tokenKind.LeftParan) {
    return [tokens, null];
  }

  const [_, stream, params] = tokens
    .slice(1, tokens.length)
    .reduce(([takeWhile, stream, acc], cur) => {
      if (takeWhile) {
        stream.push(cur);
        return [takeWhile, stream, acc];
      }
      if (cur.kind === tokenKind.Comma) {
        return [takeWhile, stream, acc];
      }
      if (cur.kind === tokenKind.RightParan) {
        return [true, stream, acc];
      }
      if (curr !== tokenKind.Ident) {
        return [takeWhile, stream, acc];
      }
      acc.push(cur.lexme);
    }, [false, [], []]);
  return [stream, params];
};

const argsParser = (tokens) => {
  const [stream, leftParanToken] = nextIf(
    tokens,
    isNextToken(tokenKind.LeftParan),
  );
  if (!leftParanToken) {
    return [tokens, null];
  }
  tokens = stream;

  let args = [];
  while (tokens.length > 0) {
    let [stream1, rightParanToken] = nextIf(
      tokens,
      isNextToken(tokenKind.RightParan),
    );
    if (rightParanToken) {
      return [stream1, args];
    }

    let [stream2, expr] = expression(tokens);
    if (!expr) {
      return [tokens, null];
    }
    tokens = stream2;
    args.push(expr);
  }
  return [tokens, args];
};

const bodyParser = (tokens) => {
  const [stream, leftBrace] = nextIf(tokens, isNextToken(tokenKind.LeftBrace));
  if (!leftBrace) {
    return [tokens, null];
  }
  tokens = stream;

  let body = [];
  while (true) {
    let [stream1, rightBrace] = nextIf(
      tokens,
      isNextToken(tokenKind.RightBrace),
    );
    if (rightBrace) {
      return [stream1, body];
    }
    let [stream, stmt] = statement(tokens);
    if (!stmt) {
      return [tokens, body];
    }
    body.push(stmt);
    tokens = stream;
  }

  return [tokens, body];
};

const func = (tokens) => {
  if (tokens[0].kind !== tokenKind.Fn) {
    return [tokens, null];
  }
  tokens = tokens.slice(1, tokens.length);

  const [stream1, name] = identParser(tokens);
  if (!name) {
    return [tokens, null];
  }

  const [stream2, params] = paramParser(stream1);
  if (!params) {
    return [tokens, null];
  }

  const [stream3, body] = bodyParser(stream2);
  if (!body) {
    return [tokens, null];
  }

  return [stream3, new ExprFunc(name, params, body)];
};

const assignment = (tokens) => {
  const [stream1, keywordLet] = nextIf(tokens, isNextToken(tokenKind.Let));
  if (!keywordLet) {
    return [tokens, null];
  }

  const [stream2, name] = identParser(stream1);
  if (!name) {
    return [tokens, null];
  }

  const [stream3, equalToken] = nextIf(stream2, isNextToken(tokenKind.Eq));
  if (!equalToken) {
    return [tokens, null];
  }

  const [stream4, expr] = exprStmt(stream3);
  if (!equalToken) {
    return [tokens, null];
  }

  return [stream4, new ExprLet(name, expr)];
};

const statement = (tokens) => either(assignment, exprStmt)(tokens);
const exprStmt = (tokens) => left(expression, delimiter)(tokens);
const delimiter = (tokens) => nextIf(tokens, isNextToken(tokenKind.SimiColon));
const expression = (tokens) => either(func, ifElseExpr, term)(tokens);

const ifElseExpr = (tokens) => {
  const [stream1, ifToken] = nextIf(tokens, isNextToken(tokenKind.If));
  if (!ifToken) {
    return [tokens, null];
  }
  const [stream2, condition] = expression(stream1);
  console.assert(condition, "expected condition after 'if'");

  const [stream3, thenBranch] = bodyParser(stream2);
  console.assert(condition, "expected branch after 'if' condition");

  const [stream4, elseToken] = nextIf(stream3, isNextToken(tokenKind.Else));
  if (!elseToken) {
    return [stream3, new ExprIfElse(condition, thenBranch, null)];
  }
  if (isNextToken(tokenKind.If)(stream4[0])) {
    const [stream5, elseBranch] = ifElseExpr(stream4);
    return [stream5, new ExprIfElse(condition, thenBranch, elseBranch)];
  }
  const [stream5, elseBranch] = bodyParser(stream4);
  return [stream5, new ExprIfElse(condition, thenBranch, elseBranch)];
};

const term = (tokens) => {
  const [stream1, left] = call(tokens);
  if (!left) {
    return [tokens, null];
  }

  const [stream2, op] = operator(tokenKind.Plus, tokenKind.Dash)(stream1);
  if (!op) {
    return [stream1, left];
  }

  const [stream3, right] = primary(stream2);
  if (!right) {
    return [tokens, null];
  }

  return [stream3, new ExprBinary(left, right, op)];
};

const operator = (...kinds) => (tokens) =>
  tokenParser(
    null,
    ...kinds,
  )(tokens);

const call = (tokens) => {
  const [stream1, name] = identParser(tokens);
  if (!name) {
    return primary(tokens);
  }

  const [stream2, args] = argsParser(stream1);
  if (!args) {
    return primary(tokens);
  }

  return [stream2, new ExprCall(name, args)];
};

const primary = (tokens) => {
  switch (tokens[0].kind) {
    case tokenKind.Ident:
      return [tokens.slice(1, tokens.length), new ValueIdent(tokens[0])];
    case tokenKind.Number:
      return [tokens.slice(1, tokens.length), new ValueNumber(tokens[0])];
    case tokenKind.String:
      return [tokens.slice(1, tokens.length), new ValueString(tokens[0])];
    case tokenKind.True:
    case tokenKind.False:
      return [tokens.slice(1, tokens.length), new ValueBoolean(tokens[0])];
    default:
      console.assert(false, `primary failed on ${tokens[0].toString()}`);
  }
};
