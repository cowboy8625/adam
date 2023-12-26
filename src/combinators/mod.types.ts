import Result from "../utils/result.ts";

export type ParserResultSuccess<T> = {
  src: string;
  value: T;
};

export type ParserResult<T> = Result<ParserResultSuccess<T>, string>;
export type Parser<T> = (src: string) => ParserResult<T>;
