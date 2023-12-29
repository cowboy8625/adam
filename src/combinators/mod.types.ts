import Result from "../utils/result.ts";

export type Success<T> = {
  src: string;
  value: T;
};

export type Failure<E> = {
  src: string;
  value: E;
};

export type ParserResult<T> = Result<Success<T>, string>;

export type BasicParser<T> = (src: string) => Result<Success<T>, string>;
