import { Extractor, MatchPattern, Nullable, Nullishable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Array<T> {
    /**
     * Repeatedly applies rewrite rules to the input string until no further changes occur.
     *
     * If the current array contains `RegExp` items, each matched pattern is replaced
     * with the same `replacement` value.
     *
     * If the current array contains `Extractor<string>` items, each rule provides its
     * own replacement function based on the match result.
     *
     * After every successful replacement, rule evaluation restarts from the first rule.
     * This continues until the string becomes stable or the safety limit is reached.
     *
     * @param input The source string to rewrite. Null or undefined is treated as an empty string.
     * @param replacement The shared replacement value when using `RegExp[]`. Null or undefined is treated as an empty string.
     * @returns The rewritten string.
     */
    rewrite(this: RegExp[], input: Nullishable<string>, replacement?: Nullishable<string>): string;
    rewrite(this: Extractor<string>[], input: Nullishable<string>): string;

    /**
     * Applies extractor rules in order and returns the first successful result.
     *
     * Each extractor consists of a regular expression and a mapper function.
     * The first rule whose pattern matches the input is used, and its mapper
     * receives the match result to produce the return value.
     *
     * If no rule matches, or the input is null, undefined, or empty, null is returned.
     *
     * @param input The source string to evaluate.
     * @returns The first extracted value, or null if no match is found.
     */
    extract<T>(this: Extractor<T>[], input: Nullishable<string>): Nullable<T>;

    /**
     * Determines whether the input string matches any pattern in the current array.
     *
     * Each pattern may be a string or a regular expression.
     * Returns true as soon as the first matching pattern is found.
     *
     * @param input The source string to test.
     * @returns True if any pattern matches the input; otherwise false.
     */
    matchesAny(this: MatchPattern[], input: string): boolean;
  }

  interface RegExpExecArray {
    /**
     * Replaces this match inside its original input string.
     */
    replaceMatch(this: RegExpExecArray, replaceValue: string): string;
  }
}

function rewrite(this: RegExp[] | Extractor<string>[], input: Nullishable<string>, replacement: Nullishable<string>): string {
  input = input ?? '';
  replacement = replacement ?? '';

  if (this.length === 0)
    return input;

  const replacers = this[0] instanceof RegExp
    ? (this as RegExp[]).map(m => [m, x => replacement] as Extractor<string>)
    : (this as Extractor<string>[]);

  let count = 0;
  let last = input;
  for (let i = 0; i < replacers.length; i++) {
    const [reg, func] = replacers[i];
    const match = reg.find(last);

    if (!match)
      continue;

    const v = func(match);
    const temp = replaceMatch.call(match, v);
    if (temp !== last) {
      if (count++ > 65536) {
        console.error('infinite match detected: ' + temp);
        continue;
      }
      last = temp;
      i = -1;
      continue;
    } else {
      last = temp;
    }
  }
  return last;
}

function replaceMatch(this: RegExpExecArray, replaceValue: string): string {
  const input = this.input;
  return input.substring(0, this.index) + replaceValue + input.substring(this.index + this[0].length);
};

function extract<T>(this: Extractor<T>[], input: Nullishable<string>): Nullable<T> {
  if (!input)
    return null;

  for (let i = 0; i < this.length; i++) {
    const [reg, func] = this[i];
    const match = reg.find(input);
    if (match) {
      return func(match);
    }
  }
  return null;
};

function matchesAny(this: MatchPattern[], input: string) {
  return input.hasAny(this);
}

definePropertyIfAbsent(Array.prototype, 'rewrite', rewrite);
definePropertyIfAbsent(Array.prototype, 'replaceMatch', replaceMatch);
definePropertyIfAbsent(Array.prototype, 'extract', extract);
definePropertyIfAbsent(Array.prototype, 'matchesAny', matchesAny);
