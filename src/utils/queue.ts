/**
 * A generic first-in, first-out (FIFO) queue implementation.
 */
export class Queue<T> implements Iterable<T> {
  private items: T[];

  /**
   * Creates a new queue and optionally initializes it with items.
   *
   * @param items Items to enqueue in order.
   */
  constructor(...items: T[]) {
    this.items = [];
    for (const item of items) {
      this.enqueue(item);
    }
  }

  /**
   * Returns an iterator for the queue items in FIFO order.
   *
   * @returns An iterator over the queue elements.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  /**
   * Adds an element to the end of the queue.
   *
   * @param element The element to enqueue.
   */  
  enqueue(element: T): void {
    this.items.push(element);
  }

  /**
   * Removes and returns the element at the front of the queue.
   *
   * @returns The dequeued element.
   * @throws Error if the queue is empty.
   */
  dequeue(): T {
    if (this.isEmpty()) {
      Error.throw('The Queue is empty.');
    }
    return this.items.shift()!;
  }

  /**
   * Returns the element at the front of the queue without removing it.
   *
   * @returns The first element in the queue.
   * @throws Error if the queue is empty.
   */
  peek(): T {
    if (this.isEmpty()) {
      Error.throw('The Queue is empty.');
    }
    return this.items[0];
  }

  /**
   * Determines whether the queue contains no elements.
   *
   * @returns True if the queue is empty; otherwise, false.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Determines whether the queue contains at least one element.
   *
   * @returns True if the queue is not empty; otherwise, false.
   */
  isNotEmpty(): boolean {
    return this.items.length > 0;
  }

  /**
   * Gets the number of elements in the queue.
   */
  get length(): number {
    return this.items.length;
  }
  
  /**
   * Removes all elements from the queue.
   */
  clear(): void {
    this.items = [];
  }
}
