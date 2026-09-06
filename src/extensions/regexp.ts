import { definePropertyIfAbsent } from '../helpers/utils.js';

declare global {
  interface RegExp {
    find(input: string): RegExpExecArray | null;
    findAll(input: string): RegExpExecArray[];
  }
}

function find(this: RegExp, input: string): RegExpExecArray | null {
  const lastIndex = this.lastIndex;

  try {
    if (!this.sticky) {
      this.lastIndex = 0;
    }

    return this.exec(input);
  } finally {
    this.lastIndex = lastIndex;
  }
};

function findAll(this: RegExp, input: string): RegExpExecArray[] {
  const regex = this.global
    ? this
    : new RegExp(this.source, this.flags + "g");

  const result: RegExpExecArray[] = [];
  const lastIndex = regex.lastIndex;

  try {
    regex.lastIndex = this.sticky ? this.lastIndex : 0;

    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      result.push(match);

      // Prevent infinite loop on zero-length matches
      if (match[0] === "") {
        regex.lastIndex++;
      }
    }

    return result;
  } finally {
    regex.lastIndex = lastIndex;
  }
}

definePropertyIfAbsent(RegExp.prototype, "find", find);
definePropertyIfAbsent(RegExp.prototype, "findAll", findAll);
