import * as helpers from './all';

type BuiltinXHelpers = typeof helpers;

/** The global helper namespace, extended by the DOM entry when it is imported. */
export interface BuiltinX extends BuiltinXHelpers { }

// The DOM entry adds its members to this same object after initialization.
const builtinX = { ...helpers } as BuiltinX;

declare global {
  const BuiltinX: typeof builtinX;
}

(globalThis as any).BuiltinX = builtinX;

export { builtinX as BuiltinX };
