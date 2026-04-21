import { Extractor, Nullable, Nullishable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Array<T> {
    /**
     * Rewrites a string by repeatedly applying the first matching rule until no rule changes the input.
     *
     * When used on `RegExp[]`, every pattern replaces its first match with the same replacement text.
     * When used on `Extractor<string>[]`, each extractor computes its own replacement text from the match.
     *
     * Nullish input is treated as an empty string.
     * When the array is empty, the normalized input is returned unchanged.
     */
    rewrite(this: RegExp[], input: Nullishable<string>, replacement?: Nullishable<string>): string;
    rewrite(this: Extractor<string>[], input: Nullishable<string>): string;

    /**
     * Returns the extracted value from the first matching extractor.
     *
     * Returns null when the input is null, undefined, empty, or when no extractor matches.
     */
    extractFirst<T>(this: Extractor<T>[], input: Nullishable<string>): Nullable<T>;
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

function extractFirst<T>(this: Extractor<T>[], input: Nullishable<string>): Nullable<T> {
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

definePropertyIfAbsent(Array.prototype, 'rewrite', rewrite);
definePropertyIfAbsent(Array.prototype, 'replaceMatch', replaceMatch);
definePropertyIfAbsent(Array.prototype, 'extractFirst', extractFirst);
