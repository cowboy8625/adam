import Result from "./../utils/result.ts";
import Option from "./../utils/option.ts";
import type { Parser, ParserResult } from "./mod.types.ts";

function isDigit(str: string): boolean {
  return /^\d+$/.test(str);
}

function number(src: string): ParserResult<number> {
  if (!src.length && !isDigit(src[0])) {
    return Result.err(src);
  }

  let index = 0;
  while (isDigit(src[index])) {
    index += 1;
  }

  return Result.ok({
    src: src.slice(index),
    value: parseInt(src.slice(0, index), 10),
  });
}

function string(src: string): ParserResult<string> {
  if (!src.length && src[0] !== '"') {
    return Result.err(src);
  }

  let index = 1;
  while (src[index] !== '"') {
    index += 1;
  }
  index += 1;

  return Result.ok({
    src: src.slice(index),
    value: src.slice(0, index),
  });
}

function identifier(src: string): ParserResult<string> {
  if (!src.length) {
    return Result.err(src);
  }
  if (!/^[a-zA-Z_]+$/.test(src[0])) {
    return Result.err(src);
  }

  let index = 1;

  while (/^[a-zA-Z0-9_]+$/.test(src[index])) {
    index += 1;
  }

  return Result.ok({
    src: src.slice(index),
    value: src.slice(0, index),
  });
}

function tag<T>(name: string): Parser<T> {
  return (src: string): ParserResult<T> => {
    if (src.startsWith(name)) {
      const result = {
        src: src.slice(name.length),
        value: name,
      };
      return Result.ok(result) as ParserResult<T>;
    }
    return Result.err(src);
  };
}

function many0<T>(parser: Parser<T>): Parser<T[]> {
  return (src: string): ParserResult<T[]> => {
    const items = [];
    while (true) {
      const result = parser(src);
      if (result.isErr()) {
        break;
      }
      const { src: newSrc, value } = result.unwrap();
      src = newSrc;
      items.push(value);
    }

    return Result.ok({
      src,
      value: items,
    });
  };
}

function whitespace(src: string): ParserResult<string> {
  if (!src.length && !/\s/.test(src[0])) {
    return Result.err(src);
  }

  let index = 0;
  while (/\s/.test(src[index])) {
    index += 1;
  }

  return Result.ok({
    src: src.slice(index),
    value: src.slice(0, index),
  });
}

function right<L, R>(parserLeft: Parser<L>, parserRight: Parser<R>): Parser<R> {
  return (src: string): ParserResult<R> => {
    const result = parserLeft(src);
    if (result.isErr()) {
      return Result.err(src);
    }
    const { src: newSrc } = result.unwrap();
    return parserRight(newSrc);
  };
}

function left<L, R>(parserLeft: Parser<L>, parserRight: Parser<R>): Parser<L> {
  return (src: string): ParserResult<L> => {
    const result0 = parserLeft(src);
    if (result0.isErr()) {
      return Result.err(src);
    }
    const { src: newSrc, value } = result0.unwrap();

    const result1 = parserRight(newSrc);
    if (result1.isErr()) {
      return Result.err(src);
    }
    const { src: src1 } = result1.unwrap();
    return Result.ok({
      src: src1,
      value,
    });
  };
}

function surround<L, M, R>(
  parserLeft: Parser<L>,
  parserMiddle: Parser<M>,
  parserRight: Parser<R>,
): Parser<M> {
  return right(parserLeft, left(parserMiddle, parserRight));
}

function optional<T>(parser: Parser<T>): Parser<Option<T>> {
  return (src: string): ParserResult<Option<T>> => {
    const result = parser(src);
    if (result.isErr()) {
      return Result.ok({
        src,
        value: Option.none(),
      });
    }
    const { src: newSrc, value } = result.unwrap();
    return Result.ok({
      src: newSrc,
      value: Option.some(value),
    });
  };
}

function pair<T>(...parsers: Parser<T>[]): Parser<T[]> {
  return (src: string): ParserResult<T[]> => {
    const results = [];
    for (const parser of parsers) {
      const result = parser(src);
      if (result.isErr()) {
        return Result.err(src);
      }
      const { src: newSrc, value } = result.unwrap();
      src = newSrc;
      results.push(value);
    }
    return Result.ok({
      src,
      value: results,
    });
  };
}

function oneOf<T>(...parsers: Parser<T>[]): Parser<T> {
  return (src: string): ParserResult<T> => {
    for (const parser of parsers) {
      const result = parser(src);
      if (result.isOk()) {
        return result;
      }
    }
    return Result.err(src);
  };
}

export default {
  left,
  right,
  surround,
  tag,
  string,
  number,
  many0,
  whitespace,
  identifier,
  optional,
  pair,
  oneOf,
};
