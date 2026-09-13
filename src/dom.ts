import { BuiltinX } from './index.js';
import * as extensions from './extensions/dom.js';
import type * as helpers from './helpers/all.js';
import * as typeGuards from './helpers/type.dom.js';

declare module './helpers/index.js' {
  interface BuiltinX {
    Element: typeof helpers.Element & typeof extensions.Element;
    Node: typeof helpers.Node & typeof extensions.Node;
    Storage: typeof extensions.Storage;
    isNode: typeof typeGuards.isNode;
    isElement: typeof typeGuards.isElement;
  }
}

Object.assign(BuiltinX.Element, extensions.Element);
Object.assign(BuiltinX.Node, extensions.Node);
BuiltinX.Storage = extensions.Storage;
Object.assign(BuiltinX, typeGuards);
