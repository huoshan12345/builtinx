import { MatchPattern, Nullable } from "@/types/lib";
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface String {
    /**
     * Returns whether the string contains the specified text or matches the specified pattern.
     *
     * When `pattern` is a string, this method uses substring search semantics.
     * When `pattern` is a regular expression, this method returns true when any match exists.
     */
    contains(pattern: MatchPattern): boolean;

    /**
     * Returns whether the string matches the specified value or pattern.
     *
     * When `pattern` is a string, this method performs exact string equality.
     * When `pattern` is a regular expression, this method returns true when any match exists.
     */
    matches(pattern: MatchPattern): boolean;

    /**
     * Returns the substring after the specified separator.
     *
     * If `skipSeparator` is false, the returned substring starts at the separator.
     * If `untilLast` is true, the last occurrence of the separator is used.
     * Returns the original string when the separator is not found.
     */
    skipUntil(separator: string, skipSeparator?: boolean, untilLast?: boolean): string;

    /**
     * Returns the substring before the specified separator.
     *
     * If `includeSeparator` is true, the returned substring ends after the separator.
     * If `untilLast` is true, the last occurrence of the separator is used.
     * Returns the original string when the separator is not found.
     */
    takeUntil(separator: string, includeSeparator?: boolean, untilLast?: boolean): string;

    /**
     * Returns the specified fallback value when the string is empty.
     */
    ifEmpty(value: string): string;

    /**
     * Parses a floating-point number from the start of the string.
     *
     * Uses the same behavior as `Number.parseFloat`.
     */
    parseFloat(): number;

    /**
     * Parses an integer from the start of the string.
     *
     * Uses the same behavior as `Number.parseInt`.
     */
    parseInt(radix?: number): number;

    /**
     * Creates a regular expression from the string.
     */
    toRegExp(flags?: string): RegExp;

    /**
     * Wraps the string in parentheses.
     */
    parenthesize(): string;

    /**
     * Decodes HTML entities in the string.
     *
     * Literal markup is preserved and not stripped.
     */
    unescapeHtml(): string;

    /**
     * Compares two strings using ASCII-only case-insensitive matching.
     *
     * Non-ASCII characters are compared exactly.
     */
    equalsIgnoreAsciiCase(value: Nullable<string>): boolean;

    /**
     * Trims the specified characters from both ends of the string.
     *
     * Characters are matched by Unicode code point, not grapheme cluster.
     */
    trimChars(chars: string): string;
  }
}

function contains(this: string, pattern: MatchPattern) {
  if (typeof pattern === 'string') {
    return this.includes(pattern);
  } else {
    return !!pattern.find(this);
  }
};

function matches(this: string, pattern: MatchPattern) {
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
    return this;

  if (skipSeparator)
    location += separator.length;

  return this.substring(location);
};

function takeUntil(this: string, separator: string, includeSeparator: boolean = true, untilLast: boolean = false) {
  let location = untilLast
    ? this.lastIndexOf(separator)
    : this.indexOf(separator);

  if (location < 0)
    return this;

  if (includeSeparator)
    location += separator.length;

  return this.substring(0, location);
};

function ifEmpty(this: string, value: string) {
  return this.length > 0
    ? this
    : value;
};

function parseFloat(this: string): number {
  return Number.parseFloat(this);
};

function parseInt(this: string, radix?: number): number {
  return Number.parseInt(this, radix);
};

function toRegExp(this: string, flags?: string): RegExp {
  return new RegExp(this, flags);
};

function parenthesize(this: string): string {
  return '(' + this + ')';
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
  const str = this;

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

definePropertyIfAbsent(String.prototype, 'contains', contains);
definePropertyIfAbsent(String.prototype, 'matches', matches);
definePropertyIfAbsent(String.prototype, 'skipUntil', skipUntil);
definePropertyIfAbsent(String.prototype, 'takeUntil', takeUntil);
definePropertyIfAbsent(String.prototype, 'ifEmpty', ifEmpty);
definePropertyIfAbsent(String.prototype, 'parseFloat', parseFloat);
definePropertyIfAbsent(String.prototype, 'parseInt', parseInt);
definePropertyIfAbsent(String.prototype, 'toRegExp', toRegExp);
definePropertyIfAbsent(String.prototype, 'parenthesize', parenthesize);
definePropertyIfAbsent(String.prototype, 'unescapeHtml', unescapeHtml);
definePropertyIfAbsent(String.prototype, 'equalsIgnoreAsciiCase', equalsIgnoreAsciiCase);
definePropertyIfAbsent(String.prototype, 'trimChars', trimChars);
