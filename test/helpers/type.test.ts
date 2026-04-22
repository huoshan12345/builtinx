describe('BuiltinX.Type.get', () => {
  
  // 1. Primitive Types
  describe('Primitives', () => {
    it('should identify strings', () => {
      expect(BuiltinX.Type.get('hello')).toBe('string');
      expect(BuiltinX.Type.get('')).toBe('string');
    });

    it('should identify numbers', () => {
      expect(BuiltinX.Type.get(123)).toBe('number');
      expect(BuiltinX.Type.get(0)).toBe('number');
      expect(BuiltinX.Type.get(NaN)).toBe('number'); // NaN is technically a number in JS
      expect(BuiltinX.Type.get(Infinity)).toBe('number');
    });

    it('should identify booleans', () => {
      expect(BuiltinX.Type.get(true)).toBe('boolean');
      expect(BuiltinX.Type.get(false)).toBe('boolean');
    });

    it('should identify symbols', () => {
      expect(BuiltinX.Type.get(Symbol('foo'))).toBe('symbol');
    });

    it('should identify BigInts', () => {
      expect(BuiltinX.Type.get(10n)).toBe('bigint');
    });
  });

  // 2. Structural Types & Built-ins
  describe('Structural Types', () => {
    it('should identify null and undefined', () => {
      expect(BuiltinX.Type.get(null)).toBe('null');
      expect(BuiltinX.Type.get(undefined)).toBe('undefined');
    });

    it('should identify arrays', () => {
      expect(BuiltinX.Type.get([])).toBe('Array');
      expect(BuiltinX.Type.get([1, 2, 3])).toBe('Array');
    });

    it('should identify plain objects', () => {
      expect(BuiltinX.Type.get({})).toBe('object');
      expect(BuiltinX.Type.get({ a: 1 })).toBe('object');
    });

    it('should identify functions', () => {
      expect(BuiltinX.Type.get(() => {})).toBe('function');
      expect(BuiltinX.Type.get(function() {})).toBe('function');
      expect(BuiltinX.Type.get(async () => {})).toBe('function'); // Note: toString behavior
    });
  });

  // 3. Built-in Objects
  describe('Built-in Objects', () => {
    it('should identify Dates', () => {
      expect(BuiltinX.Type.get(new Date())).toBe('Date');
    });

    it('should identify Regular Expressions', () => {
      expect(BuiltinX.Type.get(/abc/)).toBe('RegExp');
      expect(BuiltinX.Type.get(new RegExp('abc'))).toBe('RegExp');
    });

    it('should identify Map, Set, and Promise', () => {
      expect(BuiltinX.Type.get(new Map())).toBe('Map');
      expect(BuiltinX.Type.get(new Set())).toBe('Set');
      expect(BuiltinX.Type.get(Promise.resolve())).toBe('Promise');
    });

    it('should identify Errors', () => {
      expect(BuiltinX.Type.get(new Error())).toBe('Error');
    });
  });

  // 4. Custom Classes & Edge Cases
  describe('Custom Classes & Edge Cases', () => {
    it('should identify custom classes as object (default behavior)', () => {
      class MyClass {}
      expect(BuiltinX.Type.get(new MyClass())).toBe('object');
    });

    it('should respect Symbol.toStringTag if defined', () => {
      class CustomTag {
        get [Symbol.toStringTag]() {
          return 'MyCustomClass';
        }
      }
      expect(BuiltinX.Type.get(new CustomTag())).toBe('MyCustomClass');
    });

    it('should handle Object.create(null)', () => {
      const obj = Object.create(null);
      expect(BuiltinX.Type.get(obj)).toBe('object');
    });
  });
});