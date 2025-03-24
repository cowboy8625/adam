import { type Result as ResultType } from "../utils/result.ts";

export type Success<T> = {
  src: string;
  value: T;
};

export type Failure<E> = {
  src: string;
  value: E;
};

export type ParserResult<T> = ResultType<Success<T>, string>;

export type BasicParser<T> = (src: string) => ResultType<Success<T>, string>;
