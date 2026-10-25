import { BuiltinX } from './index.js';
import * as extensions from './extensions/dom.js';
import type * as helpers from './helpers/all.js';
import * as typeGuards from './helpers/type.dom.js';

export type { SetParamOptions } from './types/set-param-options.js';
export type { StyledElement } from './types/dom.js';

declare module './helpers/index.js' {
  interface BuiltinX {
    Element: typeof helpers.Element & typeof extensions.Element;
    Node: typeof helpers.Node & typeof extensions.Node;
    Storage: typeof extensions.Storage;
    HTMLImageElement: typeof extensions.HTMLImageElement;
    Window: typeof extensions.Window;
    isNode: typeof typeGuards.isNode;
    isElement: typeof typeGuards.isElement;
  }
}

Object.assign(BuiltinX.Element, extensions.Element);
Object.assign(BuiltinX.Node, extensions.Node);
BuiltinX.Storage = extensions.Storage;
BuiltinX.HTMLImageElement = extensions.HTMLImageElement;
BuiltinX.Window = extensions.Window;
Object.assign(BuiltinX, typeGuards);
