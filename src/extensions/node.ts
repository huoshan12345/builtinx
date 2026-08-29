import { debounce, definePropertyIfAbsent } from '@/helpers/utils';
import { MutationObserverOptions, type MutationObserverOptionsInit, type NodeMutationCallback } from '@/types/mutation-observer';

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

function observe(this: Node, callback: NodeMutationCallback, options?: MutationObserverOptionsInit) {
  const opts = new MutationObserverOptions(options);
  const node = this;

  const invokeCallback: MutationCallback = (records, observer) => {
    opts.beforeCallback?.(records, observer, node);
    callback(records, observer, node);
    opts.afterCallback?.(records, observer, node);
  };

  const scheduleCallback = opts.debounce === null
    ? invokeCallback
    : debounce(invokeCallback, opts.debounce);

  const observer = new MutationObserver((records, obs) => {
    const filtered = records.filter(record =>
      !opts.resolvedExclusions.some(exclusion => exclusion(record))
    );
    records.replaceFrom(filtered);

    if (filtered.length === 0) {
      opts.onSkipped?.(records, obs, node);
      return;
    }

    scheduleCallback(records, obs);
  });

  if (opts.callOnStart) {
    const records = [createInitialMutationRecord(node)];
    opts.beforeCallback?.(records, observer, node);
    callback(records, observer, node);
    opts.afterCallback?.(records, observer, node);
  }

  observer.observe(node, opts.toNativeInit());
  return observer;
}

definePropertyIfAbsent(Node.prototype, "ownText", ownText);
definePropertyIfAbsent(Node.prototype, "isNewLineTextNode", isNewLineTextNode);
definePropertyIfAbsent(Node.prototype, "isTextNode", isTextNode);
definePropertyIfAbsent(Node.prototype, "observe", observe);
