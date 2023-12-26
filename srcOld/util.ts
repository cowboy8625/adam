export const auto = (() => {
  let idx = 0;
  return (reset: boolean = false): number => {
    if (reset) {
      idx = 0;
      return idx++;
    }
    return idx++;
  };
})();

export const isWhitespace = (s: string) => {
  if (s == " ") {
    return true;
  } else if (s == "\t") {
    return true;
  } else if (s == "\n") {
    return true;
  }
  return false;
};

export const isDigit = (src: string) => {
  return /^\d+$/.test(src);
};

export const isAlpha = (str: string) => /^[a-zA-Z]*$/.test(str);
export const isAlphaNum = (str: string) => /^[a-zA-Z0-9]+$/i.test(str);

export const print = (...args: Array<any>) => {
  console.log(...args.map((i) => i.toString() ?? i));
};
