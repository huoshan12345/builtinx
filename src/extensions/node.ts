import { definePropertyIfAbsent } from '@/helpers/utils';
import { MutationObserverOptions, type NodeMutationCallback, type NodeMutationCallbackParams } from '..';

declare global {
  interface Node {
    /**
     * Returns concatenated text of direct child text nodes only.
     * Descendant element text is excluded.
     */
    ownText(): string;

    /**
     * Returns true if this node is a Text node.
     */
    isTextNode(): boolean;

    /**
     * Returns true if this node is a Text node that contains only whitespace and new line characters.
     */
    isNewLineTextNode(): boolean;

    /**
     * Observe mutations on this node and its subtree.     
     */
    observe(callback: NodeMutationCallback, options?: Partial<MutationObserverOptions>): MutationObserver;
  }
}

function ownText(this: Node): string {
  if (this.nodeType === Node.TEXT_NODE) {
    return this.textContent ?? '';
  }

  let text = '';
  for (const child of this.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent ?? '';
    }
  }
  return text;
};

const regNewLineText = /^\s*[\r\n]\s*$/;

function isNewLineTextNode(this: Node): boolean {
  return this.nodeType === Node.TEXT_NODE
    && regNewLineText.test(this.nodeValue ?? '');
};

function isTextNode(this: Node): boolean {
  return this.nodeType === Node.TEXT_NODE;
};

function observe(this: Node, callback: NodeMutationCallback, options?: Partial<MutationObserverOptions>) {
  const opts = new MutationObserverOptions(options);
  const node = this;
  let observer = new MutationObserver(BuiltinX.Node.debounceMutationCallback((records, observer) => callback(records, observer, node), {
    debug: opts.debug,
    debounceMs: opts.debounceMs,
    immediate: opts.immediate,
    exclusions: opts.resolvedExclusions,
  }));

  if (opts.callAtOnce) {
    callback([], observer, node);
  }

  observer.observe(node, opts.toNativeInit());
  return observer;
}

definePropertyIfAbsent(Node.prototype, "ownText", ownText);
definePropertyIfAbsent(Node.prototype, "isNewLineTextNode", isNewLineTextNode);
definePropertyIfAbsent(Node.prototype, "isTextNode", isTextNode);
definePropertyIfAbsent(Node.prototype, "observe", observe);
