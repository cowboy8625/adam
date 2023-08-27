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
        return "LeftParan";
      case 4:
        return "RightParan";
      case 5:
        return "LeftBrace";
      case 6:
        return "RightBrace";
      case 7:
        return "Plus";
      case 8:
        return "SimiColon";
      case 9:
        return "Comma";
      case 10:
        return "Eq";
      case 11:
        return "Dash";
      case 12:
        return "Let";
      case 13:
        return "Fn";
      case 14:
        return "Return";
      case 15:
        return "Eof";
      default:
        null;
    }
  },
});

export const tokenBuilder = (kind, lexme) => {
  return {
    kind,
    lexme,
    toString() {
      return `Token( ${tokenKind.from(this.kind)}, ${this.lexme} )`;
    },
  };
};

export const parserBuilder = (parser, kind, iterable) => {
  const [iterable1, lexme] = either(left(parser, whitespace), parser)(iterable);
  if (lexme) {
    return [iterable1, tokenBuilder(kind, lexme)];
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
      case "let":
        return [iter, tokenBuilder(tokenKind.Let, tok.lexme)];
      case "fn":
        return [iter, tokenBuilder(tokenKind.Fn, tok.lexme)];
      case "return":
        return [iter, tokenBuilder(tokenKind.Return, tok.lexme)];
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
