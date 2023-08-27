import { auto, isAlpha, isAlphaNum, isDigit, isWhitespace } from "./../util.ts";

export const literal = (expected) => {
  return (iterable) => {
    if (iterable.length == 0) {
      return [iterable, null];
    }

    if (expected != iterable.slice(0, expected.length)) {
      return [iterable, null];
    }
    return [
      iterable.slice(expected.length, iterable.length),
      expected,
    ];
  };
};

export const identifier = (iterable) => {
  if (iterable.length == 0) {
    return [iterable, null];
  }

  if (!isAlpha(iterable[0])) {
    return [iterable, null];
  }

  let num = iterable.slice(0, 1);

  const isValid = (idx, len, char) => {
    return idx < len && (isAlphaNum(char) || char == "_");
  };

  while (isValid(num.length, iterable.length, iterable[num.length])) {
    num += iterable[num.length];
  }

  if (num.length == 0) {
    return [iterable, null];
  }

  return [
    iterable.slice(num.length, iterable.length),
    num,
  ];
};

export const number = (iterable) => {
  if (iterable.length == 0) {
    return [iterable, null];
  }
  let num = "";
  while (isDigit(iterable[num.length])) {
    num += iterable[num.length];
  }
  if (num.length == 0) {
    return [iterable, null];
  }
  return [
    iterable.slice(num.length, iterable.length),
    num,
  ];
};

export const string = (iterable) => {
  if (iterable.length == 0) {
    return [iterable, null];
  }

  if (iterable[0] != '"') {
    return [iterable, null];
  }

  let str = "";
  while (iterable[str.length + 1] != '"') {
    str += iterable[str.length + 1];
  }

  if (str.length == 0) {
    return [iterable, null];
  }

  return [
    iterable.slice(str.length + 2, iterable.length),
    str,
  ];
};

export const comment = (iterable) => {
  if (iterable.length == 0) {
    return [iterable, null];
  }

  if (iterable.slice(0, 2) != "//") {
    return [iterable, null];
  }

  let idx = 2;
  while (idx < iterable.length && iterable[idx] != "\n") {
    idx += 1;
  }
  idx += 1;
  return [iterable.slice(idx, iterable.length), iterable.slice(0, idx)];
};

export const whitespace = (iterable) => {
  if (iterable.length == 0) {
    return [iterable, null];
  }

  let idx = 0;
  while (idx < iterable.length && isWhitespace(iterable[idx])) {
    idx += 1;
  }

  return [iterable.slice(idx, iterable.length), iterable.slice(0, idx)];
};
