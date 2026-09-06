import { debounce, definePropertyIfAbsent } from '../helpers/utils.js';
import { MutationObserverOptions, type MutationObserverOptionsInit, type NodeMutationCallback } from '../types/mutation-observer-options.js';

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
    observe(callback: NodeMutationCallback, options?: MutationObserverOptionsInit): MutationObserver;
  }
}

/** Returns the combined text of direct child text nodes, or the text node's own content. */
export function ownText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  let text = '';
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent ?? '';
    }
  }
  return text;
};

const regNewLineText = /^\s*[\r\n]\s*$/;

/** Tests for a text node containing only whitespace and at least one newline. */
export function isNewLineTextNode(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE
    && regNewLineText.test(node.nodeValue ?? '');
};

/** Tests the node type without depending on its window's prototype chain. */
export function isTextNode(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE;
};

function createInitialMutationRecord(target: Node): MutationRecord {
  const document = target.ownerDocument ?? target as Document;
  const emptyNodes = document.createDocumentFragment().childNodes;

  return {
    type: 'childList',
    target,
    addedNodes: emptyNodes,
    removedNodes: emptyNodes,
    previousSibling: null,
    nextSibling: null,
    attributeName: null,
    attributeNamespace: null,
    oldValue: null,
  };
}

/** Observes a node using the same filtering, debounce, and startup options as Node.observe. */
export function observe(
  node: Node,
  callback: NodeMutationCallback,
  options?: MutationObserverOptionsInit,
): MutationObserver {
  const opts = new MutationObserverOptions(options);

  const invokeCallback: MutationCallback = (records, observer) => {
    opts.beforeCallback?.(records, observer, node);
    callback(records, observer, node);
    opts.afterCallback?.(records, observer, node);
  };

  const scheduleCallback = opts.debounce == null
    ? invokeCallback
    : debounce(invokeCallback, opts.debounce);

  const observer = new MutationObserver((records, obs) => {
    const filtered = records.filter(record =>
      !opts.exclusions.some(exclusion => exclusion(record))
    );
    records.length = 0;
    for (const record of filtered) {
      records.push(record);
    }

    if (filtered.length === 0) {
      opts.onSkipped?.(records, obs, node);
      return;
    }

    scheduleCallback(records, obs);
  });

  if (opts.callOnStart) {
    const records = [createInitialMutationRecord(node)];
    invokeCallback(records, observer);
  }

  observer.observe(node, opts.toNativeInit());
  return observer;
}

definePropertyIfAbsent(Node.prototype, "ownText", function (this: Node): string {
  return ownText(this);
});

definePropertyIfAbsent(Node.prototype, "isNewLineTextNode", function (this: Node): boolean {
  return isNewLineTextNode(this);
});

definePropertyIfAbsent(Node.prototype, "isTextNode", function (this: Node): boolean {
  return isTextNode(this);
});

definePropertyIfAbsent(Node.prototype, "observe", function (
  this: Node,
  callback: NodeMutationCallback,
  options?: MutationObserverOptionsInit,
): MutationObserver {
  return observe(this, callback, options);
});
