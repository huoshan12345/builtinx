import { MatchPattern, Nullable } from "@/types/lib";

declare global {
  interface String {
    contains(pattern: MatchPattern): boolean;
    containsAny(patterns: MatchPattern[]): boolean;
    equals(pattern: MatchPattern): boolean;
    skipUntil(separator: string, skipSeparator?: boolean, untilLast?: boolean): string;
    takeUntil(separator: string, includeSeparator?: boolean, untilLast?: boolean): string;
    ifEmpty(value: string): string;
    toNumber(): number;
    toRegExp(flags?: string): RegExp;
    parenthesize(): string;
    htmlUnescape(): string;
    equalsIgnoreAsciiCase(value: Nullable<string>): boolean;
    trimChars(chars: string): string;
  }
}

String.prototype.contains = function (pattern: MatchPattern) {
  if (typeof pattern === 'string') {
    return this.includes(pattern);
  } else {
    return pattern.test(this as string);
  }
};

String.prototype.containsAny = function (patterns: MatchPattern[]) {
  return patterns.some(m => this.contains(m));
};

String.prototype.equals = function (pattern: MatchPattern) {
  if (typeof pattern === 'string') {
    return this === pattern;
  } else {
    return pattern.test(this as string);
  }
};

String.prototype.skipUntil = function (separator: string, skipSeparator: boolean = true, untilLast: boolean = false) {
  let location = untilLast
    ? this.lastIndexOf(separator)
    : this.indexOf(separator);

  if (location < 0)
    return this as string;

  if (skipSeparator)
    location += separator.length;

  return this.substring(location) as string;
};

String.prototype.takeUntil = function (separator: string, includeSeparator: boolean = true, untilLast: boolean = false) {
  let location = untilLast
    ? this.lastIndexOf(separator)
    : this.indexOf(separator);

  if (location < 0)
    return this as string;

  if (includeSeparator)
    location += separator.length;

  return this.substring(0, location) as string;
};

String.prototype.ifEmpty = function (value: string) {
  return this.length > 0
    ? this as string
    : value;
};

String.prototype.toNumber = function (): number {
  return parseFloat(this as string);
};

String.prototype.toRegExp = function (flags?: string): RegExp {
  return new RegExp(this as string, flags);
};

String.prototype.parenthesize = function (): string {
  return '(' + this as string + ')';
};

String.prototype.htmlUnescape = function (): string {
  const div = document.createElement("div");
  div.innerHTML = this as string;
  return div.textContent || div.innerText || "";
};

String.prototype.equalsIgnoreAsciiCase = function (value: Nullable<string>): boolean {
  if (value == null) {
    return false;
  }

  let i = 0, j = 0;
  const la = this.length, lb = value.length;

  while (i < la && j < lb) {
    let ca = this.codePointAt(i)!;
    let cb = value.codePointAt(j)!;

    // ASCII A-Z → a-z
    if (ca >= 0x41 && ca <= 0x5A)
      ca += 0x20;

    if (cb >= 0x41 && cb <= 0x5A)
      cb += 0x20;

    if (ca !== cb)
      return false;

    // 根据 code point 决定步进 1 还是 2（避免拆 emoji）
    i += ca > 0xFFFF ? 2 : 1;
    j += cb > 0xFFFF ? 2 : 1;
  }

  return i === la && j === lb;
};

String.prototype.trimChars = function (chars: string): string {
  const str = this as string;

  if (!str || !chars)
    return str;

  // 构建查表（只构建一次）
  const table = new Set<string>();
  for (let i = 0; i < chars.length; i++) {
    table.add(chars[i]);
  }

  let start = 0;
  let end = str.length - 1;

  // 从左边扫描
  while (start <= end && table.has(str[start])) {
    start++;
  }

  // 从右边扫描
  while (end >= start && table.has(str[end])) {
    end--;
  }

  // 全被 trim
  if (start === 0 && end === str.length - 1) {
    return str; // 没变化直接返回原字符串（避免分配）
  }

  return start > end
    ? ""
    : str.slice(start, end + 1);
};