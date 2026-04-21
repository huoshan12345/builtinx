import * as builtinX from './all';

declare global {
  const BuiltinX: typeof builtinX;
}

(globalThis as any).BuiltinX = builtinX;

export { builtinX as BuiltinX };