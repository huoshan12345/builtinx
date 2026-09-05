import { definePropertyIfAbsent } from '@/helpers/utils';

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

function setVisible<T extends StyledElement>(this: T, value: boolean): T {
  if (value) {
    if (this.style.display === "none") {
      this.style.display = this.getAttribute(previousDisplayKey) ?? "";
      this.removeAttribute(previousDisplayKey);
    }
  } else if (this.style.display !== "none") {
    this.setAttribute(previousDisplayKey, this.style.display);
    this.style.display = "none";
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

definePropertyIfAbsent(Element.prototype, "setVisible", setVisible);
definePropertyIfAbsent(Element.prototype, "collapseBrs", collapseBrs);
definePropertyIfAbsent(Element.prototype, "trimLeadingBrs", trimLeadingBrs);
definePropertyIfAbsent(Element.prototype, "getDocumentRect", getDocumentRect);
