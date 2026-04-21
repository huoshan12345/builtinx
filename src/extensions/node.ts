import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Node {
    ownText(): string;
    isNewLineTextNode(): boolean;
    isTextNode(): boolean;
  }
}

function ownText(this: Node): string {
  if (this.nodeType === Node.TEXT_NODE) {
    return this.textContent || '';
  }

  let text = '';
  for (const child of this.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent;
    }
  }
  return text;
};

function isNewLineTextNode(this: Node): boolean {
  return this.nodeType === Node.TEXT_NODE && this.nodeValue === '\n';
};

function isTextNode(this: Node): boolean {
  return this.nodeType === Node.TEXT_NODE;
};

definePropertyIfAbsent(Node.prototype, "ownText", ownText);
definePropertyIfAbsent(Node.prototype, "isNewLineTextNode", isNewLineTextNode);
definePropertyIfAbsent(Node.prototype, "isTextNode", isTextNode);
