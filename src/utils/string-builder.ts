import type { Nullishable } from '@/types/lib';

export class StringBuilder {
  private strings: string[] = [];

  append(value: Nullishable<string>): StringBuilder {
    if (value) {
      this.strings.push(value);
    }
    return this;
  }

  appendLine(value: Nullishable<string> = null): StringBuilder {
    this.append(value);
    this.append("\n");
    return this;
  }

  clear(): StringBuilder {
    this.strings.length = 0;
    return this;
  }

  toString(): string {
    return this.strings.join("");
  }
}
