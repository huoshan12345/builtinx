import { definePropertyIfAbsent } from '@/utils/object';
import '@/extensions/node';

type StyledElement = Element & ElementCSSInlineStyle;

declare global {
  interface Element {
    /**
     * Hides the element using display: none.
     */
    hide<T extends StyledElement>(this: T): T;

    /**
     * Restores element display.
     */
    show<T extends StyledElement>(this: T): T;

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

function hide<T extends StyledElement>(this: T): T {
  if (this.style.display !== "none") {
    this.setAttribute(previousDisplayKey, this.style.display);
    this.style.display = "none";
  }

  return this;
}

function show<T extends StyledElement>(this: T): T {
  if (this.style.display === "none") {
    this.style.display = this.getAttribute(previousDisplayKey) ?? "";
    this.removeAttribute(previousDisplayKey);
  }

  return this;
}

function collapseBrs<T extends Element>(this: T): T {
  for (const item of this.querySelectorAll('br')) {
    while (true) {
      const next = item.nextSibling;
      // Sometimes there are many newline text nodes or consecutive <br> elements after a <br>, 
      // which are meaningless and can be removed directly.
      if (next && (next.nodeName === 'BR' || next.isNewLineTextNode())) {
        next.remove();
      } else {
        break;
      }
    }
  }

  return this;
};

function trimLeadingBrs<T extends Element>(this: T): T {
  while (this.childNodes.length > 0) {
    const first = this.childNodes[0];
    if (first.nodeName !== 'BR' && !first.isNewLineTextNode()) {
      console.log(first.nodeName);
      break;
    }
    first.remove();
  }
  return this;
}

function getDocumentRect(this: Element): DOMRectReadOnly {
  const rect = this.getBoundingClientRect();
  return new DOMRectReadOnly(
    rect.left + window.scrollX,
    rect.top + window.scrollY,
    rect.width,
    rect.height
  );
};


definePropertyIfAbsent(Element.prototype, "hide", hide);
definePropertyIfAbsent(Element.prototype, "show", show);
definePropertyIfAbsent(Element.prototype, "collapseBrs", collapseBrs);
definePropertyIfAbsent(Element.prototype, "trimLeadingBrs", trimLeadingBrs);
definePropertyIfAbsent(Element.prototype, "getDocumentRect", getDocumentRect);