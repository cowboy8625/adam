import Result from "./../utils/result.ts";
import Option from "./../utils/option.ts";
import type { BasicParser, ParserResult, Success } from "./mod.types.ts";

function regexParser(regex: RegExp): BasicParser<string> {
  return (src: string): ParserResult<string> => {
    const match = src.match(regex);
    if (!match) {
      return Result.err(src);
    }
    const value = match[0];
    const index = match.index ?? 0;
    return Result.ok({ src: src.slice(index + value.length), value });
  };
}

export default class Parser<T> {
  private readonly parseFunction: BasicParser<T>;

  public static identifier(): Parser<string> {
    return new Parser<string>(regexParser(/^[a-zA-Z]+/));
  }

  public static number(): Parser<string> {
    return new Parser<string>(regexParser(/^\d+/));
  }

  public static whitespace(): Parser<string> {
    return new Parser<string>(regexParser(/^\s+/));
  }

  public static string(): Parser<string> {
    return new Parser<string>(regexParser(/"([^"]*)"/));
  }

  public static tag<T>(name: string): Parser<T> {
    return new Parser<T>((src: string): ParserResult<T> => {
      if (src.startsWith(name)) {
        const result = {
          src: src.slice(name.length),
          value: name,
        };
        return Result.ok(result) as ParserResult<T>;
      }
      return Result.err(src);
    });
  }

  public static oneOf<T>(...parsers: Parser<T>[]): Parser<T> {
    return new Parser<T>((src: string): ParserResult<T> => {
      for (const parser of parsers) {
        const result = parser.parse(src);
        if (result.isOk()) {
          return result;
        }
      }
      return Result.err(src);
    });
  }

  public static right<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<R> {
    return new Parser<R>((src: string): ParserResult<R> => {
      const result = leftParser.parse(src);
      if (result.isErr()) {
        return Result.err(src);
      }
      const { src: newSrc } = result.unwrap();
      return rightParser.parse(newSrc);
    });
  }

  public static left<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<L> {
    return new Parser<L>((src: string): ParserResult<L> => {
      const result0 = leftParser.parse(src);
      if (result0.isErr()) {
        return Result.err(src);
      }
      const { src: newSrc, value } = result0.unwrap();

      const result1 = rightParser.parse(newSrc);
      if (result1.isErr()) {
        return Result.err(src);
      }
      const { src: src1 } = result1.unwrap();
      return Result.ok({
        src: src1,
        value,
      });
    });
  }
  public static surround<L, M, R>(
    parserLeft: Parser<L>,
    parserMiddle: Parser<M>,
    parserRight: Parser<R>,
  ): Parser<M> {
    return Parser.right(parserLeft, Parser.left(parserMiddle, parserRight));
  }

  public static pair<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<readonly [L, R]> {
    return leftParser.andThen(rightParser);
  }

  public constructor(parseFunction: BasicParser<T>) {
    this.parseFunction = parseFunction;
  }

  public parse(src: string): ParserResult<T> {
    return this.parseFunction(src);
  }

  public then<U>(nextParser: Parser<U>): Parser<U> {
    return new Parser<U>((src: string) =>
      this.parse(src).andThen(({ src }: Success<T>) => nextParser.parse(src))
    );
  }

  public map<U>(fn: (value: T) => U): Parser<U> {
    return new Parser<U>((src: string): ParserResult<U> => {
      const result = this.parse(src);
      if (result.isErr()) {
        return Result.err(src);
      }
      const { src: newSrc, value } = result.unwrap();
      return Result.ok({
        src: newSrc,
        value: fn(value),
      });
    });
  }

  public andThen<U>(nextParser: Parser<U>): Parser<readonly [T, U]> {
    return new Parser<readonly [T, U]>(
      (src: string): ParserResult<readonly [T, U]> => {
        return this.parse(src).andThen(
          ({ src, value: value1 }: Success<T>): ParserResult<readonly [T, U]> =>
            nextParser.parse(src).map(
              ({
                src,
                value: value2,
              }: Success<U>): Success<readonly [T, U]> => ({
                src,
                value: [value1, value2],
              }),
            ),
        );
      },
    );
  }

  public or(nextParser: Parser<T>): Parser<T> {
    return new Parser<T>((src: string): ParserResult<T> => {
      const result = this.parse(src);
      if (result.isOk()) {
        return result;
      }
      return nextParser.parse(src);
    });
  }

  public optional(): Parser<Option<T>> {
    return new Parser<Option<T>>((src: string): ParserResult<Option<T>> => {
      const result = this.parseFunction(src);
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
    });
  }

  public removeLeadingWhitespace(): Parser<T> {
    return Parser.right(Parser.whitespace().optional(), this);
  }

  public many0(): Parser<T[]> {
    return new Parser<T[]>((src: string): ParserResult<T[]> => {
      const items = [];
      while (true) {
        const result = this.parse(src);
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
    });
  }

  public many1(): Parser<T[]> {
    return new Parser<T[]>((src: string): ParserResult<T[]> => {
      const originalSrc = src;
      const items = [];
      while (true) {
        const result = this.parse(src);
        if (result.isErr()) {
          break;
        }
        const { src: newSrc, value } = result.unwrap();
        src = newSrc;
        items.push(value);
      }

      if (items.length === 0) {
        return Result.err(originalSrc);
      }

      return Result.ok({
        src,
        value: items,
      });
    });
  }

  public inspect(fn: (result: ParserResult<T>) => void): Parser<T> {
    return new Parser<T>((src: string): ParserResult<T> => {
      const result = this.parse(src);
      fn(result);
      return result;
    });
  }
}
