export default class Result<T, E> {
  private constructor(
    private readonly kind: "Ok" | "Err",
    private readonly value: T | E,
  ) {}

  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>("Ok", value);
  }

  public static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>("Err", error);
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.kind === "Ok") {
      return Result.ok(fn(this.value as T));
    }
    return Result.err(this.value as E);
  }

  public mapErr<U>(fn: (error: E) => U): Result<T, U> {
    if (this.kind === "Err") {
      return Result.err(fn(this.value as E));
    }
    return Result.ok(this.value as T);
  }

  public andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.kind === "Ok") {
      return fn(this.value as T);
    }
    return Result.err(this.value as E);
  }

  public isOk(): boolean {
    return this.kind === "Ok";
  }

  public isErr(): boolean {
    return this.kind === "Err";
  }

  public unwrap(): T {
    if (this.kind === "Ok") {
      return this.value as T;
    }
    throw new Error(
      `Result is Err and cannot be unwrapped as an '${this.value}'`,
    );
  }

  public unwrapErr(): E {
    if (this.kind === "Err") {
      return this.value as E;
    }
    throw new Error(
      `Result is Ok and cannot be unwrapped as an '${this.value}'`,
    );
  }

  public orElse<U>(fn: (error: E) => Result<T, U>): Result<T, U> {
    if (this.kind === "Ok") {
      return Result.ok(this.value as T);
    }
    return fn(this.value as E);
  }

  public or(other: Result<T, E>): Result<T, E> {
    if (this.kind === "Ok") {
      return Result.ok(this.value as T);
    }
    return other;
  }

  public inspect(fn: (value: T) => void): Result<T, E> {
    if (this.kind === "Ok") {
      fn(this.value as T);
    }

    return this;
  }

  public expect(message: string): T {
    if (this.kind === "Ok") {
      return this.value as T;
    }
    throw new Error(message);
  }
}

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("result-test", () => {
  const left: Result<number, string> = Result.ok(1);
  const right: Result<number, string> = Result.ok(1);
  assertEquals(right.unwrap(), left.unwrap());
});
