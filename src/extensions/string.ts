import { MatchPattern, Nullable } from "@/types/lib";
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface String {
    has(pattern: MatchPattern): boolean;
    hasAny(patterns: MatchPattern[]): boolean;
    is(pattern: MatchPattern): boolean;
    skipUntil(separator: string, skipSeparator?: boolean, untilLast?: boolean): string;
    takeUntil(separator: string, includeSeparator?: boolean, untilLast?: boolean): string;
    ifEmpty(value: string): string;
    toFloat(): number;
    toInt(radix?: number): number;
    toRegExp(flags?: string): RegExp;
    parenthesize(): string;
    unescapeHtml(): string;
    equalsIgnoreAsciiCase(value: Nullable<string>): boolean;
    /**
     * Trims the specified characters from both ends of the string.
     *
     * Characters are matched by Unicode code point, not grapheme cluster.
     */
    trimChars(chars: string): string;
  }
}

function has(this: string, pattern: MatchPattern) {
  if (typeof pattern === 'string') {
    return this.includes(pattern);
  } else {
    return !!pattern.find(this);
  }
};

function hasAny(this: string, patterns: MatchPattern[]) {
  return patterns.some(m => has.call(this, m));
};

function is(this: string, pattern: MatchPattern) {
  if (typeof pattern === 'string') {
    return this === pattern;
  } else {
    return !!pattern.find(this);
  }
};

function skipUntil(this: string, separator: string, skipSeparator: boolean = true, untilLast: boolean = false) {
  let location = untilLast
    ? this.lastIndexOf(separator)
    : this.indexOf(separator);

  if (location < 0)
    return this as string;

  if (skipSeparator)
    location += separator.length;

  return this.substring(location) as string;
};

function takeUntil(this: string, separator: string, includeSeparator: boolean = true, untilLast: boolean = false) {
  let location = untilLast
    ? this.lastIndexOf(separator)
    : this.indexOf(separator);

  if (location < 0)
    return this as string;

  if (includeSeparator)
    location += separator.length;

  return this.substring(0, location) as string;
};

function ifEmpty(this: string, value: string) {
  return this.length > 0
    ? this as string
    : value;
};

function toFloat(this: string): number {
  return Number.parseFloat(this as string);
};

function toInt(this: string, radix?: number): number {
  return Number.parseInt(this as string, radix);
};

function toRegExp(this: string, flags?: string): RegExp {
  return new RegExp(this as string, flags);
};

function parenthesize(this: string): string {
  return '(' + this as string + ')';
};

function unescapeHtml(this: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = this;
  return textarea.value;
}

function equalsIgnoreAsciiCase(this: string, value: Nullable<string>): boolean {
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

    // according to code point, decide whether to step 1 or 2 (to avoid splitting emoji)
    i += ca > 0xFFFF ? 2 : 1;
    j += cb > 0xFFFF ? 2 : 1;
  }

  return i === la && j === lb;
};

function trimChars(this: string, chars: string): string {
  const str = this as string;

  if (!str || !chars)
    return str;

  const table = new Set(Array.from(chars));
  const codePoints = Array.from(str);

  let start = 0;
  let end = codePoints.length - 1;

  while (start <= end && table.has(codePoints[start])) {
    start++;
  }

  while (end >= start && table.has(codePoints[end])) {
    end--;
  }

  if (start === 0 && end === codePoints.length - 1) {
    return str;
  }

  return start > end
    ? ""
    : codePoints.slice(start, end + 1).join("");
};

definePropertyIfAbsent(String.prototype, 'has', has);
definePropertyIfAbsent(String.prototype, 'hasAny', hasAny);
definePropertyIfAbsent(String.prototype, 'is', is);
definePropertyIfAbsent(String.prototype, 'skipUntil', skipUntil);
definePropertyIfAbsent(String.prototype, 'takeUntil', takeUntil);
definePropertyIfAbsent(String.prototype, 'ifEmpty', ifEmpty);
definePropertyIfAbsent(String.prototype, 'toFloat', toFloat);
definePropertyIfAbsent(String.prototype, 'toInt', toInt);
definePropertyIfAbsent(String.prototype, 'toRegExp', toRegExp);
definePropertyIfAbsent(String.prototype, 'parenthesize', parenthesize);
definePropertyIfAbsent(String.prototype, 'unescapeHtml', unescapeHtml);
definePropertyIfAbsent(String.prototype, 'equalsIgnoreAsciiCase', equalsIgnoreAsciiCase);
definePropertyIfAbsent(String.prototype, 'trimChars', trimChars);
