import { BuiltinX } from '@/index.js';

describe('BuiltinX.getType', () => {
  
  // 1. Primitive Types
  describe('Primitives', () => {
    it('should identify strings', () => {
      expect(BuiltinX.getType('hello')).toBe('string');
      expect(BuiltinX.getType('')).toBe('string');
    });

    it('should identify numbers', () => {
      expect(BuiltinX.getType(123)).toBe('number');
      expect(BuiltinX.getType(0)).toBe('number');
      expect(BuiltinX.getType(NaN)).toBe('number'); // NaN is technically a number in JS
      expect(BuiltinX.getType(Infinity)).toBe('number');
    });

    it('should identify booleans', () => {
      expect(BuiltinX.getType(true)).toBe('boolean');
      expect(BuiltinX.getType(false)).toBe('boolean');
    });

    it('should identify symbols', () => {
      expect(BuiltinX.getType(Symbol('foo'))).toBe('symbol');
    });

    it('should identify BigInts', () => {
      expect(BuiltinX.getType(10n)).toBe('bigint');
    });
  });

  // 2. Structural Types & Built-ins
  describe('Structural Types', () => {
    it('should identify null and undefined', () => {
      expect(BuiltinX.getType(null)).toBe('null');
      expect(BuiltinX.getType(undefined)).toBe('undefined');
    });

    it('should identify arrays', () => {
      expect(BuiltinX.getType([])).toBe('Array');
      expect(BuiltinX.getType([1, 2, 3])).toBe('Array');
    });

    it('should identify plain objects', () => {
      expect(BuiltinX.getType({})).toBe('object');
      expect(BuiltinX.getType({ a: 1 })).toBe('object');
    });

    it('should identify functions', () => {
      expect(BuiltinX.getType(() => {})).toBe('function');
      expect(BuiltinX.getType(function() {})).toBe('function');
      expect(BuiltinX.getType(async () => {})).toBe('function'); // Note: toString behavior
    });
  });

  // 3. Built-in Objects
  describe('Built-in Objects', () => {
    it('should identify Dates', () => {
      expect(BuiltinX.getType(new Date())).toBe('Date');
    });

    it('should identify Regular Expressions', () => {
      expect(BuiltinX.getType(/abc/)).toBe('RegExp');
      expect(BuiltinX.getType(new RegExp('abc'))).toBe('RegExp');
    });

    it('should identify Map, Set, and Promise', () => {
      expect(BuiltinX.getType(new Map())).toBe('Map');
      expect(BuiltinX.getType(new Set())).toBe('Set');
      expect(BuiltinX.getType(Promise.resolve())).toBe('Promise');
    });

    it('should identify Errors', () => {
      expect(BuiltinX.getType(new Error())).toBe('Error');
    });
  });

  // 4. Custom Classes & Edge Cases
  describe('Custom Classes & Edge Cases', () => {
    it('should identify custom classes as object (default behavior)', () => {
      class MyClass {}
      expect(BuiltinX.getType(new MyClass())).toBe('object');
    });

    it('should respect Symbol.toStringTag if defined', () => {
      class CustomTag {
        get [Symbol.toStringTag]() {
          return 'MyCustomClass';
        }
      }
      expect(BuiltinX.getType(new CustomTag())).toBe('MyCustomClass');
    });

    it('should handle Object.create(null)', () => {
      const obj = Object.create(null);
      expect(BuiltinX.getType(obj)).toBe('object');
    });
  });
});
