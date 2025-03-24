export class Ok<T, E> {
  public readonly ok = true;
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public map<U>(fn: (val: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  public mapErr<F>(_: (err: E) => F): Result<T, F> {
    return new Ok(this.value);
  }

  public andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  public unwrap(): T {
    return this.value;
  }

  public unwrapOr(_: T): T {
    return this.value;
  }

  public unwrapOrElse(_: () => T): T {
    return this.value;
  }

  public or<U>(_: Result<U, E>): Result<T, E> {
    return this;
  }

  public orElse<U>(_: (err: E) => Result<U, E>): Result<T, E> {
    return this;
  }

  public expect(_: string): T {
    return this.value;
  }

  public inspect(fn: (val: T) => void): Result<T, E> {
    fn(this.value);
    return this;
  }
}

export class Err<T, E> {
  public readonly ok = false;
  public readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  public map<U>(_: (val: T) => U): Result<U, E> {
    return new Err(this.error);
  }

  public mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new Err(fn(this.error));
  }

  public andThen<U>(_: (val: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error);
  }

  public unwrap(): never {
    throw new Error(`Tried to unwrap an Err: ${this.error}`);
  }

  public unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  public unwrapOrElse(fn: () => T): T {
    return fn();
  }

  public or<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  public orElse<U>(fn: (err: E) => Result<U, E>): Result<U, E> {
    return fn(this.error);
  }

  public expect(message: string): never {
    throw new Error(`${message}: ${this.error}`);
  }

  public inspect(_: (val: T) => void): Result<T, E> {
    return this;
  }
}

export type Result<T, E> = Ok<T, E> | Err<T, E>;

export function ok<T, E = never>(value: T): Result<T, E> {
  return new Ok(value);
}

export function err<E, T = never>(error: E): Result<T, E> {
  return new Err(error);
}

import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

Deno.test("result-test", () => {
  const left: Result<number, string> = ok(1);
  const right: Result<number, string> = ok(1);
  assertEquals(right.unwrap(), left.unwrap());
});

export default {
  Ok,
  Err,
  ok,
  err,
};
