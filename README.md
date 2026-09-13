# builtinx [![NPM Version](https://img.shields.io/npm/v/builtinx)](https://www.npmjs.com/package/builtinx) [![LICENSE](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE.TXT) [![Build](https://github.com/huoshan12345/builtinx/actions/workflows/build.yml/badge.svg)](https://github.com/huoshan12345/builtinx/actions/workflows/build.yml)


Extensions for JavaScript built-ins and web platform objects.

`builtinx` is a small TypeScript utility library that installs convenience methods on native prototypes and exposes a `BuiltinX` helper namespace on `globalThis`. It is designed for applications and scripts where concise, chainable operations are preferred over repeatedly writing the same small helpers.

## Installation

```sh
pnpm add builtinx
```

```sh
npm install builtinx
```

## Quick Start

Import the package once near your application entry point. The import has side effects: it augments native objects such as `Array`, `String`, `URL`, `Promise`, `Math`, `FormData`, `Blob`, `Response`, and `console`.

```ts
import "builtinx";

const names = ["Ada", "Grace", "Ada"];

names.distinct();              // ["Ada", "Grace"]
names.groupBy(x => x.length);  // Map<number, string[]>
"42px".parseInt();             // 42
Math.clamp(12, 0, 10);         // 10

const url = new URL("https://example.com/search");
url.setParam("q", "builtinx").setBool("debug", true);
```

DOM-specific extensions live in a separate entry so they can be loaded only in browser-like environments:

```ts
import "builtinx";
import "builtinx/dom";

document.body.setVisible(false);
document.body.setVisible(true);
document.body.observe((records, observer, node) => {
  console.log(records, node);
});
```

The DOM entry also adds static methods to the global `BuiltinX.Element`,
`BuiltinX.Node`, and `BuiltinX.Storage` groups. Pass the target object as the first
argument. This supports objects from accessible iframes whose prototypes have not
been extended by the parent window:

```ts
import "builtinx";
import "builtinx/dom";

const frame = document.querySelector<HTMLIFrameElement>("iframe")!;
const element = frame.contentDocument!.body;

BuiltinX.Element.trimLeadingBrs(element);
BuiltinX.Element.collapseBrs(element);
const text = BuiltinX.Node.ownText(element);
const value = BuiltinX.Storage.getCache<string>(frame.contentWindow!.localStorage, "key");
```

Existing helpers such as `BuiltinX.Element.tagNames` remain available.
`getDocumentRect` returns coordinates relative to the target element's own document.

The helper namespace is also installed globally:

```ts
import "builtinx";

const hex = BuiltinX.Color.rgbToHex(255, 128, 0); // "#ff8000"
const data = await BuiltinX.Http.request("/api/items");
```

## Entry Points

| Entry | Purpose |
| --- | --- |
| `builtinx` | Core extensions, helper namespace, utility classes, and shared types. |
| `builtinx/dom` | DOM prototype extensions, static `BuiltinX.Element`, `BuiltinX.Node`, and `BuiltinX.Storage` methods, and the `BuiltinX.isNode` / `BuiltinX.isElement` type guards. |

## Prototype Extensions

`builtinx` defines methods only when the property is absent, using non-enumerable properties by default. Existing own properties are left untouched.

### Array

Static helpers:

- `Array.cast(value)` returns the original array or converts an iterable/array-like value with `Array.from`.
- `Array.isArrayLike(value)` checks for string, typed-array, array, or object values with a safe non-negative integer `length`.
- `Array.isArrayOf(value, itemGuard?)` checks whether a value is an array. With a guard, it validates each iterated value and stops at the first rejection. Sparse slots are checked as `undefined`; empty arrays pass without calling the guard.

Without a guard, `Array.isArrayOf` behaves like `Array.isArray`. Supplying a generic
type argument alone does not validate element types at runtime.

```ts
const isNumber = (value: unknown): value is number => typeof value === "number";

Array.isArrayOf([1, 2], isNumber);       // true
Array.isArrayOf([1, "2"], isNumber);     // false
Array.isArrayOf(new Array(1), isNumber); // false: the guard receives undefined
Array.isArrayOf(new Array(1));           // true: only checks whether it is an array
```

Instance helpers:

- Indexing and mutation: `hasIndex`, `removeAt`, `remove`, `resize`, `replaceFrom`, `swap`, `append`, `insert`, `prepend`.
- Selection: `first(predicate?)`, `firstOrNull(predicate?)`, `last(predicate?)`, `lastOrNull(predicate?)`, `sample`, `throwIfEmpty`.
- Aggregation: `distinct`, `groupBy`, `countBy`, `count`.
- Pattern matching across selected strings: `anyContainsAny`, `anyContainsAll`, `allContainsAny`, `allContainsAll`.
- RegExp/extractor arrays: `rewrite`, `extract`, `matchesAny`, `containsAny`.

```ts
const items = [1, 2, 3, 4];

items.swap(0, -1);       // [4, 2, 3, 1]
items.count(x => x > 2); // 2

const byParity = items.groupBy(x => x % 2);
```

### String and RegExp

`String.from(value)` returns `""` for `null` or `undefined`, and otherwise uses
`String(value)`. It honors standard string conversion, including
`Symbol.toPrimitive`, and propagates conversion errors.

```ts
String.from(null);        // ""
String.from(undefined);   // ""
String.from(42);          // "42"
String.from(false);       // "false"
```

String helpers:

- Matching: `contains`, `matches`.
- Slicing: `skipUntil`, `takeUntil`.
- Parsing and conversion: `parseFloat`, `parseInt`, `toRegExp`, `unescapeHtml`.
- Formatting/comparison: `ifEmpty`, `parenthesize`, `equalsIgnoreAsciiCase`, `trimChars`.

RegExp helpers:

- `find(input)` returns the first match from the beginning of the input and restores `lastIndex` afterward. Sticky (`y`) patterns instead match at their current `lastIndex`.
- `findAll(input)` returns all matches from the beginning of the input, restores `lastIndex` afterward, and protects against zero-length-match loops. Sticky (`y`) patterns begin at their current `lastIndex` and retain sticky matching semantics.

```ts
"foo/bar/baz".skipUntil("/");       // "bar/baz"
"--hello--".trimChars("-");         // "hello"
/\d+/.find("id=42")?.[0];           // "42"
```

### Set Helpers

- `Set.some(predicate)` returns whether any value satisfies a predicate and stops after the first match.

### URL and URLSearchParams

URL helpers:

- Query management: `setParam`, `trySetParam`, `getParam`, `getNumberParam`, `hasParam`, `setParamsFrom`, `deleteParam`, `tryDeleteParam`, `getParams`, `setBool`.
- Navigation and mutation: `goto`, `setHost`, `setProtocol`, `resolve`.

`URLEx` helpers:

- `URLEx.create(url, base?)`
- `URLEx.goto(url, openInNewTab?, noReferrer?)`
- `URLEx.fromSegments(base, ...segments)`

URLSearchParams helpers:

- `getInt`, `getBool`, `setBool`, `any`, `distinct`, `setFrom`, `getEffectiveValue`, `hasEffectiveValue`, `trySet`, `tryDelete`, `add`.

```ts
const url = URLEx.fromSegments("https://example.com/app", "users", "42");

url
  .setParam("tab", "profile")
  .setBool("readonly", false); // removes the key by default
```

`URLSearchParams.trySet` and `URL.trySetParam` return a boolean: `true` when a value
is written, or `false` when the key already exists. Existing empty values and
duplicates are preserved. Values are converted with `String.from`, so nullish
inputs are stored as empty strings. If the key exists, the supplied value is not
converted. These methods do not return the receiver for chaining.

`URLSearchParams.add` expands ordinary arrays one level and appends each value
using `String.from`. Strings, typed arrays and other iterables are single values.
An empty array appends nothing; nullish values and sparse slots append empty
strings. Existing values are preserved, and `add` returns the same instance.

```ts
const params = new URLSearchParams();

params.trySet("page", 1);       // true
params.trySet("page", 2);       // false: page remains "1"
params.add("tag", ["ts", null]);
params.getAll("tag");           // ["ts", ""]
params.add("word", "hello");    // one value: "hello"
params.add("bytes", new Uint8Array([1, 2])); // one value: "1,2"
```

Query comparison and deletion use the following rules:

| Method | Omitted, `null` or `undefined` value | Other values | Return value |
| --- | --- | --- | --- |
| `URL.hasParam(key, value?)` | Checks key existence. | Compares `String(value)` with the last value for the key. | `boolean` |
| `URLSearchParams.hasEffectiveValue(key, value)` | Value is required; explicit nullish values compare with `""`. | Compares `String(value)` with the last value for the key. | `boolean`; false for a missing key. |
| `URL.deleteParam(key, value?)` | Deletes all entries for the key. | Deletes every entry matching `String(value)`. | The same URL. |
| `URL.tryDeleteParam(key, value?)` / `URLSearchParams.tryDelete(key, value?)` | Deletes all entries for the key. | Deletes every entry matching `String(value)`. | Whether any entries were deleted. |

Pass `""` explicitly when checking for or deleting empty values:

```ts
const filtered = new URL("https://example.com/?a=&a=1");

filtered.hasParam("a", null);      // true: the key exists
filtered.hasParam("a", "");        // false: the last value is "1"
filtered.tryDeleteParam("a", "");  // true: only a= is removed
filtered.search;                   // "?a=1"
filtered.tryDeleteParam("a", null); // true: removes the remaining entries for a
filtered.tryDeleteParam("a");      // false: the key no longer exists
```

### Promise, Math, Error, Console, Fetch Helpers

- `Promise.delay(ms)`, `promise.delay(ms)`, `promise.ignore(onError?)`, `Promise.retry(factory, times, delayMs?)`.
- `Math.randomInt(max)`, `Math.randomInt(min, max)`, `Math.clamp(value, min, max)`, `Math.lerp(start, end, t)`.
- `Error.throw(message)` for expression-friendly throwing.
- `console.styled(...)`, `console.color(text, color)`, `console.red(text)`.
- `Response.throwIfNotOk()` and `Response.download(filename)`.
- `Blob.toBase64()` and `Blob.download(filename, revokeDelay?)`.
- `FormData.add(key, value)` and `FormData.toParams()`.

```ts
const result = await Promise.retry(
  () => BuiltinX.Http.request("/api/data"),
  3,
  250
);

await Promise.resolve(result).delay(100);
```

## DOM Extensions

Load these with `import "builtinx/dom"` after the core entry.

### Element

- `Element.setVisible(value)` hides with `display: none` when false and restores the previous inline display when true. It supports HTML and SVG elements and returns the element for chaining. Restoring display does not guarantee visibility when other styles or ancestors hide the element.
- `Element.collapseBrs()`, `Element.trimLeadingBrs()`.
- `Element.getDocumentRect()`.

### Node and MutationObserver

- `Node.ownText()` returns direct child text only.
- `Node.isTextNode()` and `Node.isNewLineTextNode()`.
- `Node.observe(callback, options?)` wraps `MutationObserver` with optional debouncing, exclusion predicates, lifecycle callbacks, and the observed node as a callback argument. Set `debounce` to `false` to invoke each mutation callback directly.

```ts
const observer = document.body.observe(
  (records, observer, node) => {
    console.log(records.length, node.ownText());
  },
  {
    debounce: {
      debounceMs: 250,
      maxWaitMs: 1000,
    },
    callOnStart: false,
    exclusions: [record => record.type === "attributes"],
  }
);
```

### Storage Cache Helpers

- `Storage.setCache(key, value, expiration)`.
- `Storage.getCache(key)`.
- `Storage.takeCache(key)`.
- `Storage.getJsonValue(key)`.
- `Storage.getOrCreateCacheAsync(key, factory, expiration)`.
- `Storage.cleanupExpired()`.
- `Storage.keys()`.

```ts
import { TimeSpan } from "builtinx";

localStorage.setCache("profile", { name: "Ada" }, TimeSpan.fromMinutes(10));
const profile = localStorage.takeCache<{ name: string }>("profile");
const settings = localStorage.getJsonValue<{ theme: string }>("settings");
```

## Helper Namespace

Importing `builtinx` creates `globalThis.BuiltinX`.

Available helpers include:

- `BuiltinX.Color`: `rgbToHex`, `hexToRgb`.
- `BuiltinX.Clipboard`: `copy`.
- `BuiltinX.Element`: HTML tag name list.
- `BuiltinX.FileInfo`: filename splitting, extension handling, illegal-character replacement, compression-extension detection.
- `BuiltinX.Http`: `downloadText`, `download`, `request`. `downloadText` returns a promise and defaults to `text/plain`.
- `BuiltinX.Node`: debounced mutation callback helper.
- `BuiltinX.getType`: runtime type names.
- `BuiltinX.isString`, `isNumber`, `isArray`, `isObject`, `isFunction`, and `isNil`: common type guards.
- `BuiltinX.isNode` and `BuiltinX.isElement`: DOM type guards, including objects from accessible iframes; require importing `builtinx/dom`.
- `BuiltinX.debounce`: general debouncing utility.

```ts
BuiltinX.FileInfo.splitName("archive.tar"); // ["archive", ".tar"]
BuiltinX.getType(new Map());                // "Map"
BuiltinX.isString("hello");                 // true
```

### DOM Type Guards

`BuiltinX.isNode(value: unknown): value is Node` accepts DOM nodes, including
elements, text, comments, documents, document fragments (including shadow roots),
and attributes. `BuiltinX.isElement(value: unknown): value is Element` accepts
HTML, SVG, and XML elements; other node types return `false`.

Both functions validate the receiver through native DOM getters. They support
nodes from accessible iframes, detached nodes, documents without a window, and
nodes adopted into another document. Null, undefined, primitives, and objects
that merely imitate DOM properties or inherit from DOM prototypes return `false`.

```ts
import { BuiltinX } from "builtinx";
import "builtinx/dom";

BuiltinX.isNode(document.createTextNode("hello"));    // true
BuiltinX.isElement(document.createTextNode("hello")); // false
BuiltinX.isElement(document.createElement("div"));    // true
BuiltinX.isElement({ nodeType: 1, tagName: "DIV" });   // false

const value: unknown = document.querySelector("main");
if (BuiltinX.isElement(value)) {
  value.setAttribute("data-ready", "true"); // value is narrowed to Element
}
```

Importing `builtinx/dom` adds these guards to the existing `BuiltinX` namespace
and makes their TypeScript declarations available. The DOM entry requires
`Node` and `Element` globals. Importing only `builtinx` does not load the guards
and works in environments without those DOM globals.

## Utility Classes

The main entry exports these utility classes and types:

- `Queue<T>`: FIFO queue with `enqueue`, `dequeue`, `peek`, `clear`, `length`, and iteration.
- `Stack<T>`: LIFO stack with `push`, `pop`, `peek`, `clear`, `size`, and iteration.
- `Lazy<T>`: lazy value wrapper with `value`, `isValueCreated`, and `reset`. A `null` or `undefined` factory result still counts as created and remains cached until reset.
- `StringBuilder`: chainable string accumulation.
- `TimeSpan`: integer-millisecond duration factory and arithmetic helpers. Its public constructor rejects non-finite, fractional, and unsafe millisecond values; single-unit factories round fractional inputs. `parse` accepts `hours:minutes:seconds` and `days.hours:minutes:seconds`.
- `Timer.every(timeSpanOrMs, signal?)`: async generator that yields at an interval until it is closed or the optional `AbortSignal` aborts.
- `HttpError`: error type used by `BuiltinX.Http.request`.

```ts
import { Queue, TimeSpan, Timer } from "builtinx";

const queue = new Queue("first", "second");
queue.dequeue(); // "first"

for await (const _ of Timer.every(TimeSpan.fromSeconds(1))) {
  console.log("tick");
}
```

## TypeScript

The package ships TypeScript declarations through `dist/index.d.ts`. Because many features are global prototype augmentations, import the package in any application entry or test setup that relies on the augmented methods:

```ts
import "builtinx";
import "builtinx/dom"; // browser/jsdom only
```

## Development

This repository uses pnpm, Vite, TypeScript, and Vitest.

```sh
pnpm install
pnpm test
pnpm run type-check
pnpm build
```

Project scripts:

- `pnpm dev`: start Vite in development mode.
- `pnpm test`: run the Vitest suite.
- `pnpm test:watch`: run Vitest in watch mode.
- `pnpm run type-check`: run `tsc --noEmit`.
- `pnpm build`: clean `dist`, build JavaScript, and emit declarations.

## Notes

Prototype extension libraries are best imported intentionally and early. `builtinx` avoids overwriting existing own properties, but it still changes global objects for the current runtime. For libraries consumed by unknown hosts, consider documenting the side effects for your users and importing only in controlled application entry points.
