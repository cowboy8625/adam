import Result, { type Result as ResultType } from "./result.ts";

export class Left<L, R> {
  constructor(
    readonly kind: "Left",
    readonly value: L,
  ) {}

  public isLeft(): this is Left<L, R> {
    return true;
  }

  public isRight(): this is Right<L, R> {
    return false;
  }

  public unwrapLeft(): L {
    return this.value;
  }

  public unwrapRight(): R {
    throw new Error("Left");
  }
}

export class Right<L, R> {
  constructor(
    readonly kind: "Right",
    readonly value: R,
  ) {}

  public isLeft(): this is Left<L, R> {
    return false;
  }

  public isRight(): this is Right<L, R> {
    return true;
  }

  public unwrapLeft(): L {
    throw new Error("Right");
  }

  public unwrapRight(): R {
    return this.value;
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

// import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
// Deno.test("result-test", () => {
//   const left: Either<number, string> = Either.ok(1);
//   const right: Either<number, string> = Either.ok(1);
//   assertEquals(right.unwrap(), left.unwrap());
// });
