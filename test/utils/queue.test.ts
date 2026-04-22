import { Queue } from '@/utils/queue';

describe('Queue', () => {
  describe('constructor', () => {
    it('should create an empty queue when no items are provided', () => {
      const queue = new Queue<number>();

      expect(queue.length).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.isNotEmpty()).toBe(false);
      expect([...queue]).toEqual([]);
    });

    it('should enqueue initial items in order', () => {
      const queue = new Queue(1, 2, 3);

      expect(queue.length).toBe(3);
      expect([...queue]).toEqual([1, 2, 3]);
    });

    it('should allow undefined and null values', () => {
      const queue = new Queue<null | undefined | number>(undefined, null, 1);

      expect(queue.length).toBe(3);
      expect([...queue]).toEqual([undefined, null, 1]);
    });
  });

  describe('enqueue', () => {
    it('should add items to the end of the queue', () => {
      const queue = new Queue<number>();

      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      expect(queue.length).toBe(3);
      expect([...queue]).toEqual([1, 2, 3]);
    });

    it('should preserve object references', () => {
      const item = { id: 1 };
      const queue = new Queue<typeof item>();

      queue.enqueue(item);

      expect(queue.peek()).toBe(item);
    });
  });

  describe('dequeue', () => {
    it('should remove and return items in FIFO order', () => {
      const queue = new Queue(1, 2, 3);

      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);

      expect(queue.length).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should work correctly after alternating enqueue and dequeue', () => {
      const queue = new Queue<number>();

      queue.enqueue(1);
      expect(queue.dequeue()).toBe(1);

      queue.enqueue(2);
      queue.enqueue(3);

      expect(queue.dequeue()).toBe(2);

      queue.enqueue(4);

      expect([...queue]).toEqual([3, 4]);
    });

    it('should throw when queue is empty', () => {
      const queue = new Queue<number>();

      expect(() => queue.dequeue()).toThrow();
    });
  });

  describe('peek', () => {
    it('should return the first item without removing it', () => {
      const queue = new Queue(1, 2, 3);

      expect(queue.peek()).toBe(1);
      expect(queue.length).toBe(3);
      expect([...queue]).toEqual([1, 2, 3]);
    });

    it('should return undefined as a valid stored value', () => {
      const queue = new Queue<undefined>(undefined);

      expect(queue.peek()).toBeUndefined();
      expect(queue.length).toBe(1);
    });

    it('should throw when queue is empty', () => {
      const queue = new Queue<number>();

      expect(() => queue.peek()).toThrow();
    });
  });

  describe('isEmpty / isNotEmpty', () => {
    it('should reflect queue state changes', () => {
      const queue = new Queue<number>();

      expect(queue.isEmpty()).toBe(true);
      expect(queue.isNotEmpty()).toBe(false);

      queue.enqueue(1);

      expect(queue.isEmpty()).toBe(false);
      expect(queue.isNotEmpty()).toBe(true);

      queue.dequeue();

      expect(queue.isEmpty()).toBe(true);
      expect(queue.isNotEmpty()).toBe(false);
    });
  });

  describe('length', () => {
    it('should track item count correctly', () => {
      const queue = new Queue<number>();

      expect(queue.length).toBe(0);

      queue.enqueue(1);
      expect(queue.length).toBe(1);

      queue.enqueue(2);
      expect(queue.length).toBe(2);

      queue.dequeue();
      expect(queue.length).toBe(1);

      queue.clear();
      expect(queue.length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const queue = new Queue(1, 2, 3);

      queue.clear();

      expect(queue.length).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect([...queue]).toEqual([]);
    });

    it('should allow reuse after clear', () => {
      const queue = new Queue(1, 2);

      queue.clear();
      queue.enqueue(3);

      expect(queue.length).toBe(1);
      expect(queue.peek()).toBe(3);
    });

    it('should be safe to call on an empty queue', () => {
      const queue = new Queue<number>();

      queue.clear();

      expect(queue.length).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const queue = new Queue(1, 2, 3);
      const result: number[] = [];

      for (const item of queue) {
        result.push(item);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    it('should reflect current queue contents', () => {
      const queue = new Queue(1, 2, 3);

      queue.dequeue();
      queue.enqueue(4);

      expect([...queue]).toEqual([2, 3, 4]);
    });

    it('should return a fresh iterator each time', () => {
      const queue = new Queue(1, 2);

      expect([...queue]).toEqual([1, 2]);
      expect([...queue]).toEqual([1, 2]);
    });
  });
});