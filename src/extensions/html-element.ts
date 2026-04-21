import { definePropertyIfAbsent } from '@/utils/object';
import './element';

declare global {
  interface HTMLElement {
    /**
     * Checks if the element is visible in the DOM.  
     * An element is considered visible if it has a non-zero width and height or if it has client rects.
     * @returns {boolean} True if the element is visible, false otherwise.
     */
    isVisible(): boolean;

    /**
     * Sets the visibility of the element.  
     * If the value is true, the element will be shown; if false, it will be hidden.
     * @param {boolean} value - The desired visibility state of the element.
     * @returns {T} The element itself for chaining.
     */
    setVisible<T extends HTMLElement>(this: T, value: boolean): T;
  }
}

function isVisible(this: HTMLElement): boolean {
  return !!(
    this.offsetWidth ||
    this.offsetHeight ||
    this.getClientRects().length
  );
}

function setVisible<T extends HTMLElement>(this: T, value: boolean): T {
  return value
    ? this.show()
    : this.hide();
}

definePropertyIfAbsent(HTMLElement.prototype, 'isVisible', isVisible);
definePropertyIfAbsent(HTMLElement.prototype, 'setVisible', setVisible);