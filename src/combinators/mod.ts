import Result from "./../utils/result.ts";
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

export default {
  tag,
  string,
  number,
  many0,
  whitespace,
};
