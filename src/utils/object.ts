export function definePropertyIfAbsent<
  T extends object,
  K extends PropertyKey
>(
  target: T,
  key: K,
  value: unknown,
  writable = true,
  configurable = true,
  enumerable = false
): boolean {
  if (Object.prototype.hasOwnProperty.call(target, key)) {
    return false;
  }

  Object.defineProperty(target, key, {
    value,
    writable,
    configurable,
    enumerable
  });

  return true;
}