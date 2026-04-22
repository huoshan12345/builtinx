const is = {
  str: (v: unknown): v is string => typeof v === 'string',
  num: (v: unknown): v is number => typeof v === 'number',
  arr: (v: unknown): v is any[] => Array.isArray(v),
  obj: (v: unknown): v is Record<PropertyKey, unknown> => Object.prototype.toString.call(v) === '[object Object]',
  fun: (v: unknown): v is Function => typeof v === 'function',
  nil: (v: unknown): v is null | undefined => v === null || v === undefined,
};

export const Type = {
  /**
   * Returns the precise type of a value with a hybrid casing strategy.
   * * - **Lowercase**: For standard `typeof` results (string, number, boolean, etc.) 
   * to maintain consistency with native JavaScript behavior.
   * - **PascalCase**: For specific object types (Array, Date, Map, etc.) or 
   * custom classes to preserve their identity.
   * * @example
   * Type.get("hi")       // "string"
   * Type.get([])         // "Array"
   * Type.get(new Date()) // "Date"
   * Type.get({})         // "object"
   * * @param val - The value to inspect.
   * @returns A string representing the precise type.
   */  
  get(val: unknown): string {
    // Special handling for null (since typeof null === 'object')
    if (val === null)
      return 'null';

    const t = typeof val;

    if (t !== 'object')
      return t;

    const rawTag = Object.prototype.toString.call(val).slice(8, -1);

    // if the raw tag is 'Object' then return 'object', 
    // otherwise return the raw tag (e.g., 'Array', 'Date', etc.)
    return rawTag === 'Object'
      ? 'object'
      : rawTag;
  },
  is,
};