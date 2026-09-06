import { BuiltinX } from './index';
import * as extensions from './extensions/dom';
import type * as helpers from './helpers/all';

declare module './helpers' {
  interface BuiltinX {
    Element: typeof helpers.Element & typeof extensions.Element;
    Node: typeof helpers.Node & typeof extensions.Node;
    Storage: typeof extensions.Storage;
  }
}

Object.assign(BuiltinX.Element, extensions.Element);
Object.assign(BuiltinX.Node, extensions.Node);
BuiltinX.Storage = extensions.Storage;
