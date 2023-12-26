export const left = (l, r) => {
  return (src) => {
    let [src1, leftItem] = l(src);

    if (!leftItem) {
      return [src, null];
    }

    let [src2, rightItem] = r(src1);
    if (!rightItem) {
      return [src, null];
    }

    return [src2, leftItem];
  };
};

export const right = (l, r) => {
  return (src) => {
    let [src1, leftItem] = l(src);

    if (!leftItem) {
      return [src, null];
    }

    let [src2, rightItem] = r(src1);
    if (!rightItem) {
      return [src, null];
    }

    return [src2, rightItem];
  };
};

export const either = (...parsers) => {
  return (src) => {
    for (const parser of parsers) {
      let [src1, item] = parser(src);
      if (item) {
        return [src1, item];
      }
    }
    return [src, null];
  };
};

export const oneOrMore = (parser) => {
  let result = [];
  return (src) => {
    do {
      let [src1, item] = parser(src);
      if (!item) {
        return [src, result];
      }
      src = src1;
      result.push(item);
    } while (src.length > 0);
    return [src, result];
  };
};

export const zeroOrMore = (parser) => {
  let result = [];
  return (src) => {
    do {
      let [src1, item] = parser(src);
      if (!item) {
        return [src, result];
      }
      src = src1;
      result.push(item);
    } while (src.length > 0);
    return [src, result];
  };
};

export const surround = (leftParser, centerParser, rightParser) => (iterable) =>
  right(leftParser, left(centerParser, rightParser))(iterable);
