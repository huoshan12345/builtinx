import { definePropertyIfAbsent } from '@/helpers/utils';
import { DebounceMutationCallbackOptions, MutationObserverOptions, type NodeMutationCallback } from '@/types/mutation-observer';

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

function observe(this: Node, callback: NodeMutationCallback, options?: Partial<MutationObserverOptions>) {
  const opts = new MutationObserverOptions(options);
  const node = this;

  const debounceOptions = {
    debounceMs: opts.debounceMs,
    leading: opts.leading,
    trailing: opts.trailing,
    exclusions: opts.resolvedExclusions,
    beforeCallback: (records, obs) => opts.beforeCallback?.(records, obs, node),
    afterCallback: (records, obs) => opts.afterCallback?.(records, obs, node),
    onSkipped: (records, obs) => opts.onSkipped?.(records, obs, node),
  } as Partial<DebounceMutationCallbackOptions>;

  const observer = new MutationObserver(BuiltinX.Node.debounceMutationCallback(
    (records, obs) => callback(records, obs, node),
    debounceOptions),
  );

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
