import { auto } from "./../util.ts";

import {
  either,
  left,
  oneOrMore,
  right,
  surround,
  zeroOrMore,
} from "./../combine/combin.js";

import {
  comment,
  identifier,
  literal,
  number,
  string,
  whitespace,
} from "./../combine/prim.js";

export const tokenKind = Object.freeze({
  String: auto(true),
  Number: auto(),
  Ident: auto(),
  True: auto(),
  False: auto(),
  LeftParan: auto(),
  RightParan: auto(),
  LeftBrace: auto(),
  RightBrace: auto(),
  Plus: auto(),
  SimiColon: auto(),
  Comma: auto(),
  Eq: auto(),
  Dash: auto(),
  Let: auto(),
  Fn: auto(),
  If: auto(),
  Else: auto(),
  Return: auto(),
  Eof: auto(),
  from: (num) => {
    switch (num) {
      case 0:
        return "String";
      case 1:
        return "Number";
      case 2:
        return "Ident";
      case 3:
        return "True";
      case 4:
        return "False";
      case 5:
        return "LeftParan";
      case 6:
        return "RightParan";
      case 7:
        return "LeftBrace";
      case 8:
        return "RightBrace";
      case 9:
        return "Plus";
      case 10:
        return "SimiColon";
      case 11:
        return "Comma";
      case 12:
        return "Eq";
      case 13:
        return "Dash";
      case 14:
        return "Let";
      case 15:
        return "Fn";
      case 16:
        return "If";
      case 17:
        return "Else";
      case 18:
        return "Return";
      case 19:
        return "Eof";
      default:
        null;
    }
  },
});

export class Token {
  constructor(kind, lexme) {
    this.kind = kind;
    this.lexme = lexme;
  }
  [Symbol.for("Deno.customInspect")]() {
    return this.toString();
  }
  toString() {
    return `Token( ${tokenKind.from(this.kind)}, ${this.lexme} )`;
  }
}

export const parserBuilder = (parser, kind, iterable) => {
  const [iterable1, lexme] = either(left(parser, whitespace), parser)(iterable);
  if (lexme) {
    return [iterable1, new Token(kind, lexme)];
  }
  return [iterable, null];
};

const stringParser = (iterable) =>
  parserBuilder(string, tokenKind.String, iterable);
const numberParser = (iterable) =>
  parserBuilder(number, tokenKind.Number, iterable);
const identParser = (iterable) =>
  parserBuilder(identifier, tokenKind.Ident, iterable).reduce((iter, tok) => {
    switch (tok?.lexme) {
      case "true":
        return [iter, new Token(tokenKind.True, tok.lexme)];
      case "false":
        return [iter, new Token(tokenKind.False, tok.lexme)];
      case "let":
        return [iter, new Token(tokenKind.Let, tok.lexme)];
      case "if":
        return [iter, new Token(tokenKind.If, tok.lexme)];
      case "else":
        return [iter, new Token(tokenKind.Else, tok.lexme)];
      case "fn":
        return [iter, new Token(tokenKind.Fn, tok.lexme)];
      case "return":
        return [iter, new Token(tokenKind.Return, tok.lexme)];
      default:
        return [iter, tok];
    }
  });
const leftParanParser = (iterable) =>
  parserBuilder(literal("("), tokenKind.LeftParan, iterable);
const rightParanParser = (iterable) =>
  parserBuilder(literal(")"), tokenKind.RightParan, iterable);
const plusParser = (iterable) =>
  parserBuilder(literal("+"), tokenKind.Plus, iterable);
const dashParser = (iterable) =>
  parserBuilder(literal("-"), tokenKind.Dash, iterable);
const leftBraceParser = (iterable) =>
  parserBuilder(literal("{"), tokenKind.LeftBrace, iterable);
const rightBraceParser = (iterable) =>
  parserBuilder(literal("}"), tokenKind.RightBrace, iterable);
const simicolonParser = (iterable) =>
  parserBuilder(literal(";"), tokenKind.SimiColon, iterable);
const eqParser = (iterable) =>
  parserBuilder(literal("="), tokenKind.Eq, iterable);
const commaParser = (iterable) =>
  parserBuilder(literal(","), tokenKind.Comma, iterable);

export const lexer = (iterable) => {
  const parsers = (iter) =>
    either(
      stringParser,
      numberParser,
      identParser,
      plusParser,
      dashParser,
      leftParanParser,
      rightParanParser,
      leftBraceParser,
      rightBraceParser,
      simicolonParser,
      eqParser,
      commaParser,
    )(iter);

  const whitespaceRemover = (iter) =>
    zeroOrMore(either(comment, whitespace))(iter);

  return zeroOrMore(
    either(
      left(parsers, whitespaceRemover),
      right(whitespaceRemover, parsers),
      parsers,
    ),
  )(iterable);
};

export default lexer;
