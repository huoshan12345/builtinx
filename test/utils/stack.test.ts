import { Stack } from '@/utils/stack';

describe('Stack', () => {
  describe('constructor', () => {
    it('should create an empty stack when no items are provided', () => {
      const stack = new Stack<number>();

      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.isNotEmpty()).toBe(false);
      expect([...stack]).toEqual([]);
    });

    it('should initialize items in push order', () => {
      const stack = new Stack(1, 2, 3);

      expect(stack.size()).toBe(3);
      expect([...stack]).toEqual([1, 2, 3]);
      expect(stack.peek()).toBe(3);
    });

    it('should allow null and undefined values', () => {
      const stack = new Stack<number | null | undefined>(undefined, null, 1);

      expect(stack.size()).toBe(3);
      expect([...stack]).toEqual([undefined, null, 1]);
      expect(stack.peek()).toBe(1);
    });
  });

  describe('push', () => {
    it('should add items to the top of the stack', () => {
      const stack = new Stack<number>();

      stack.push(1);
      stack.push(2);
      stack.push(3);

      expect(stack.size()).toBe(3);
      expect([...stack]).toEqual([1, 2, 3]);
      expect(stack.peek()).toBe(3);
    });

    it('should preserve object references', () => {
      const item = { id: 1 };
      const stack = new Stack<typeof item>();

      stack.push(item);

      expect(stack.peek()).toBe(item);
    });
  });

  describe('pop', () => {
    it('should remove and return items in LIFO order', () => {
      const stack = new Stack(1, 2, 3);

      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);

      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });

    it('should work correctly after alternating push and pop', () => {
      const stack = new Stack<number>();

      stack.push(1);
      expect(stack.pop()).toBe(1);

      stack.push(2);
      stack.push(3);

      expect(stack.pop()).toBe(3);

      stack.push(4);

      expect([...stack]).toEqual([2, 4]);
      expect(stack.peek()).toBe(4);
    });

    it('should throw when stack is empty', () => {
      const stack = new Stack<number>();

      expect(() => stack.pop()).toThrow();
    });
  });

  describe('peek', () => {
    it('should return the top item without removing it', () => {
      const stack = new Stack(1, 2, 3);

      expect(stack.peek()).toBe(3);
      expect(stack.size()).toBe(3);
      expect([...stack]).toEqual([1, 2, 3]);
    });

    it('should return undefined as a valid stored value', () => {
      const stack = new Stack<undefined>(undefined);

      expect(stack.peek()).toBeUndefined();
      expect(stack.size()).toBe(1);
    });

    it('should throw when stack is empty', () => {
      const stack = new Stack<number>();

      expect(() => stack.peek()).toThrow();
    });
  });

  describe('isEmpty / isNotEmpty', () => {
    it('should reflect stack state changes', () => {
      const stack = new Stack<number>();

      expect(stack.isEmpty()).toBe(true);
      expect(stack.isNotEmpty()).toBe(false);

      stack.push(1);

      expect(stack.isEmpty()).toBe(false);
      expect(stack.isNotEmpty()).toBe(true);

      stack.pop();

      expect(stack.isEmpty()).toBe(true);
      expect(stack.isNotEmpty()).toBe(false);
    });
  });

  describe('size', () => {
    it('should track item count correctly', () => {
      const stack = new Stack<number>();

      expect(stack.size()).toBe(0);

      stack.push(1);
      expect(stack.size()).toBe(1);

      stack.push(2);
      expect(stack.size()).toBe(2);

      stack.pop();
      expect(stack.size()).toBe(1);

      stack.clear();
      expect(stack.size()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const stack = new Stack(1, 2, 3);

      stack.clear();

      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.isNotEmpty()).toBe(false);
      expect([...stack]).toEqual([]);
    });

    it('should allow reuse after clear', () => {
      const stack = new Stack(1, 2);

      stack.clear();
      stack.push(3);

      expect(stack.size()).toBe(1);
      expect(stack.peek()).toBe(3);
    });

    it('should be safe to call on an empty stack', () => {
      const stack = new Stack<number>();

      stack.clear();

      expect(stack.size()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const stack = new Stack(1, 2, 3);
      const result: number[] = [];

      for (const item of stack) {
        result.push(item);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    it('should reflect current stack contents', () => {
      const stack = new Stack(1, 2, 3);

      stack.pop();
      stack.push(4);

      expect([...stack]).toEqual([1, 2, 4]);
    });

    it('should return a fresh iterator each time', () => {
      const stack = new Stack(1, 2);

      expect([...stack]).toEqual([1, 2]);
      expect([...stack]).toEqual([1, 2]);
    });
  });
});