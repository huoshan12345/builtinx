import { definePropertyIfAbsent } from '@/helpers/utils';
import { isNewLineTextNode } from './node';

type StyledElement = Element & ElementCSSInlineStyle;

declare global {
  interface Element {
    /**
     * Sets the element's visibility by changing its inline display style.
     * Hiding preserves the previous display value; showing restores it or clears
     * inline display if no value was saved. Repeated hiding preserves the saved value.
     * Showing does not guarantee visibility when other styles or ancestors hide the element.
     * @param value Whether to restore display (true) or set display to none (false).
     * @returns The element itself for chaining.
     */
    setVisible<T extends StyledElement>(this: T, value: boolean): T;

    /**
     * Collapses consecutive <br> elements and newline text nodes into a single <br>.
     */
    collapseBrs<T extends Element>(this: T): T;

    /**
     * Trims leading <br> elements and newline text nodes.
     */
    trimLeadingBrs<T extends Element>(this: T): T;

    /**
     * Gets the element's bounding rectangle relative to the document.
     */
    getDocumentRect(this: Element): DOMRectReadOnly;
  }
}

const previousDisplayKey = "data-builtinx-display";

/** Hides or restores an element's inline display, returning the same element. */
export function setVisible<T extends StyledElement>(element: T, value: boolean): T {
  if (value) {
    if (element.style.display === "none") {
      element.style.display = element.getAttribute(previousDisplayKey) ?? "";
      element.removeAttribute(previousDisplayKey);
    }
  } else if (element.style.display !== "none") {
    element.setAttribute(previousDisplayKey, element.style.display);
    element.style.display = "none";
  }

  return element;
}

/** Collapses consecutive breaks and newline text nodes, returning the same element. */
export function collapseBrs<T extends Element>(element: T): T {
  for (const item of element.querySelectorAll('br')) {
    while (true) {
      const next = item.nextSibling;
      // Sometimes there are many newline text nodes or consecutive <br> elements after a <br>, 
      // which are meaningless and can be removed directly.
      if (next && (next.nodeName === 'BR' || isNewLineTextNode(next))) {
        next.remove();
      } else {
        break;
      }
    }
  }

  return element;
};

/** Removes leading breaks and newline text nodes, returning the same element. */
export function trimLeadingBrs<T extends Element>(element: T): T {
  while (element.childNodes.length > 0) {
    const first = element.childNodes[0];
    if (first.nodeName !== 'BR' && !isNewLineTextNode(first)) {
      break;
    }
    first.remove();
  }
  return element;
}

/** Gets bounds relative to the element's own document, including its window's scroll offsets. */
export function getDocumentRect(element: Element): DOMRectReadOnly {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;
  return new DOMRectReadOnly(
    rect.left + (view?.scrollX ?? 0),
    rect.top + (view?.scrollY ?? 0),
    rect.width,
    rect.height
  );
};

definePropertyIfAbsent(Element.prototype, "setVisible", function <T extends StyledElement>(
  this: T,
  value: boolean,
): T {
  return setVisible(this, value);
});

definePropertyIfAbsent(Element.prototype, "collapseBrs", function <T extends Element>(this: T): T {
  return collapseBrs(this);
});

definePropertyIfAbsent(Element.prototype, "trimLeadingBrs", function <T extends Element>(this: T): T {
  return trimLeadingBrs(this);
});

definePropertyIfAbsent(Element.prototype, "getDocumentRect", function (this: Element): DOMRectReadOnly {
  return getDocumentRect(this);
});
