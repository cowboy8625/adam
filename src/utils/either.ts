// class Either<L, R> {
//   private constructor(
//     private readonly kind: "Left" | "Right",
//     private readonly value: L | R,
//   ) {}
//
//   public static left<L, R>(left: L): Either<L, R> {
//     return new Either<L, R>("Left", left);
//   }
//
//   public static right<L, R>(right: E): Either<L, R> {
//     return new Either<L, R>("Right", right);
//   }
//
//   public map_left<U>(fn: (value: T) => U): Either<U, E> {
//     if (this.kind === "Left") {
//       return Either.left(fn(this.value as L));
//     }
//     return Either.right(this.value as R);
//   }
//
//   public andThen<U>(fn: (value: T) => Either<U, E>): Either<U, E> {
//     if (this.kind === "Left") {
//       return fn(this.value as T);
//     }
//     return Either.right(this.value as E);
//   }
//
//   public unwrap_left(): T {
//     if (this.kind === "Left") {
//       return this.value as T;
//     }
//     throw new Error("Either is Right and cannot be unwrapped");
//   }
//
//   public unwrap_right(): E {
//     if (this.kind === "Right") {
//       return this.value as T;
//     }
//     throw new Error("Either is Left and cannot be unwrapped");
//   }
// }
//
// import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
// Deno.test("result-test", () => {
//   const left: Either<number, string> = Either.ok(1);
//   const right: Either<number, string> = Either.ok(1);
//   assertEquals(right.unwrap(), left.unwrap());
// });
