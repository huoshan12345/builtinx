/**
 * A generic last-in, first-out (LIFO) stack implementation.
 */
export class Stack<T> implements Iterable<T> {
  private items: T[];

  /**
   * Creates a new stack and optionally initializes it with items.
   *
   * @param items Items to push in order.
   */
  constructor(...items: T[]) {
    this.items = [];
    for (const item of items) {
      this.push(item);
    }
  }

  /**
   * Returns an iterator for the stack items in insertion order.
   *
   * @returns An iterator over the stack elements.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  /**
   * Pushes an element onto the top of the stack.
   *
   * @param element The element to push.
   */
  push(element: T): void {
    this.items.push(element);
  }

  /**
   * Removes and returns the top element of the stack.
   *
   * @returns The popped element.
   * @throws Error if the stack is empty.
   */
  pop(): T {
    if (this.isEmpty()) {
      Error.throw('The Stack is empty.');
    }
    return this.items.pop()!;
  }

  /**
   * Returns the top element of the stack without removing it.
   *
   * @returns The top element of the stack.
   * @throws Error if the stack is empty.
   */
  peek(): T {
    if (this.isEmpty()) {
      Error.throw('The Stack is empty.');
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Determines whether the stack contains no elements.
   *
   * @returns True if the stack is empty; otherwise, false.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Determines whether the stack contains at least one element.
   *
   * @returns True if the stack is not empty; otherwise, false.
   */
  isNotEmpty(): boolean {
    return this.items.length > 0;
  }

  /**
   * Gets the number of elements in the stack.
   *
   * @returns The current stack size.
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Removes all elements from the stack.
   */
  clear(): void {
    this.items = [];
  }
}
