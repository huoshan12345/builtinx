import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface RegExp {
    find(input: string): RegExpExecArray | null;
    findAll(input: string): RegExpExecArray[];
  }
}

function find(this: RegExp, input: string): RegExpExecArray | null {
  try {
    this.lastIndex = 0;
    return this.exec(input);
  } finally {
    this.lastIndex = 0;
  }
};

function findAll(this: RegExp, input: string): RegExpExecArray[] {
  const regex = this.global
    ? this
    : new RegExp(this.source, this.flags + "g");

  const result: RegExpExecArray[] = [];

  try {
    regex.lastIndex = 0;

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
    regex.lastIndex = 0;
  }
}

definePropertyIfAbsent(RegExp.prototype, "find", find);
definePropertyIfAbsent(RegExp.prototype, "findAll", findAll);