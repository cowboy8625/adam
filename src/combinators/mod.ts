import Result from "./../utils/result.ts";
import Option from "./../utils/option.ts";
import type { BasicParser, ParserResult } from "./mod.types.ts";

function regexParser(regex: RegExp): BasicParser<string> {
  return (src: string): ParserResult<string> => {
    const match = src.match(regex);
    if (!match) return Result.err(src);

    const value = match[0];
    const index = match.index ?? 0;
    return Result.ok({ src: src.slice(index + value.length), value });
  };
}

export default class Parser<T> {
  private readonly parseFunction: BasicParser<T>;

  constructor(parseFunction: BasicParser<T>) {
    this.parseFunction = parseFunction;
  }

  public parse(src: string): ParserResult<T> {
    return this.parseFunction(src);
  }

  /** Static Parsers */
  public static identifier(): Parser<string> {
    return new Parser(regexParser(/^[a-zA-Z]+/));
  }

  public static number(): Parser<string> {
    return new Parser(regexParser(/^\d+/));
  }

  public static whitespace(): Parser<string> {
    return new Parser(regexParser(/^\s+/));
  }

  public static string(): Parser<string> {
    return new Parser(regexParser(/"([^"\\]*(\\.[^"\\]*)*)"/));
  }

  public static literal(name: string): Parser<string> {
    return new Parser<string>((src) =>
      src.startsWith(name)
        ? Result.ok({
            src: src.slice(name.length),
            value: name,
          })
        : Result.err(src),
    );
  }

  public static oneOf<T>(...parsers: Parser<T>[]): Parser<T> {
    return new Parser<T>((src) => {
      for (const parser of parsers) {
        const result = parser.parse(src);
        if (result.ok) return result;
      }
      return Result.err(src);
    });
  }

  public static right<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<R> {
    return new Parser<R>((src) =>
      leftParser.parse(src).andThen(({ src }) => rightParser.parse(src)),
    );
  }

  public static left<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<L> {
    return new Parser<L>((src) => {
      const leftResult = leftParser.parse(src);
      if (!leftResult.ok) return Result.err(src);

      const { src: newSrc, value } = leftResult.unwrap();
      return rightParser.parse(newSrc).map(({ src }) => ({ src, value }));
    });
  }

  public static surround<L, M, R>(
    leftParser: Parser<L>,
    middleParser: Parser<M>,
    rightParser: Parser<R>,
  ): Parser<M> {
    return Parser.right(leftParser, Parser.left(middleParser, rightParser));
  }

  public static pair<L, R>(
    leftParser: Parser<L>,
    rightParser: Parser<R>,
  ): Parser<[L, R]> {
    return leftParser.andThen(rightParser);
  }

  public then<U>(nextParser: Parser<U> | (() => Parser<U>)): Parser<U> {
    if (typeof nextParser === "function") {
      nextParser = nextParser();
    }
    return new Parser<U>((src) =>
      this.parse(src).andThen(({ src }) => nextParser.parse(src)),
    );
  }

  public map<U>(fn: (value: T) => U): Parser<U> {
    return new Parser<U>((src) =>
      this.parse(src).map(({ src, value }) => ({
        src,
        value: fn(value),
      })),
    );
  }

  public andThen<U>(
    nextParser: ((value: T) => Parser<U>) | Parser<U>,
  ): Parser<[T, U]> {
    return new Parser<[T, U]>((src) =>
      this.parse(src).andThen(({ src, value: val1 }) => {
        const parser =
          typeof nextParser === "function" ? nextParser(val1) : nextParser;
        return parser
          .parse(src)
          .map(({ src, value: val2 }) => ({ src, value: [val1, val2] }));
      }),
    );
  }

  public or(nextParser: Parser<T> | (() => Parser<T>)): Parser<T> {
    if (typeof nextParser === "function") {
      return new Parser<T>((src) =>
        this.parse(src).orElse(() => nextParser().parse(src)),
      );
    } else {
      return new Parser<T>((src) =>
        this.parse(src).orElse(() => nextParser.parse(src)),
      );
    }
  }

  public optional(): Parser<Option<T>> {
    return new Parser<Option<T>>((src) =>
      this.parse(src)
        .map(({ src, value }) => Result.ok({ src, value: Option.some(value) }))
        .unwrapOr(Result.ok({ src, value: Option.none() })),
    );
  }

  public removeLeadingWhitespace(): Parser<T> {
    return Parser.right(Parser.whitespace().optional(), this);
  }

  public many0(): Parser<T[]> {
    return new Parser<T[]>((src) => {
      const items: T[] = [];
      let currentSrc = src;

      while (true) {
        const result = this.parse(currentSrc);
        if (!result.ok) break;

        const { src: newSrc, value } = result.unwrap();
        currentSrc = newSrc;
        items.push(value);
      }

      return Result.ok({ src: currentSrc, value: items });
    });
  }

  public many1(): Parser<T[]> {
    return new Parser<T[]>((src) => {
      const firstResult = this.parse(src);
      if (!firstResult.ok) return Result.err(src);

      let { src: currentSrc, value } = firstResult.unwrap();
      const items: T[] = [value];

      while (true) {
        const result = this.parse(currentSrc);
        if (!result.ok) break;

        const { src: newSrc, value } = result.unwrap();
        currentSrc = newSrc;
        items.push(value);
      }

      return Result.ok({ src: currentSrc, value: items });
    });
  }

  public inspect(fn: (result: ParserResult<T>) => void): Parser<T> {
    return new Parser<T>((src) => {
      const result = this.parse(src);
      fn(result);
      return result;
    });
  }
}
