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
- `Element.trimBrs()` removes leading and trailing direct HTML `<br>` elements and whitespace Text nodes containing CR/LF. It skips and preserves comments; plain spaces, tabs, empty Text nodes, and other content stop trimming. Descendants are not trimmed. The static form is `BuiltinX.Element.trimBrs(element)`.
- `Element.getDocumentRect()`.

### HTMLImageElement

- `HTMLImageElement.whenLoaded()` returns a Promise resolving with the image on success and rejecting with an `Error` on failure, including an already-completed failure with a source. With no source it waits for a future event. While waiting, source changes follow the element's next `load`/`error` event; removing a source does not cancel the wait. Both listeners are removed on settlement. The static form `BuiltinX.HTMLImageElement.whenLoaded(image)` also supports iframe images.

```ts
const image = await img.whenLoaded();
await processImage(image);
```

### Window query parameters

`window.setParam(name, value, options?)` and `window.deleteParam(name)` change the
address bar using `history.replaceState`, preserving `history.state`. They do not
reload the page, add a history entry, dispatch `popstate`/`hashchange`, or notify
framework routers. Static forms `BuiltinX.Window.setParam(targetWindow, name,
value, options?)` and `BuiltinX.Window.deleteParam(targetWindow, name)` also work
with accessible iframe windows using that window's own location and history.

The value argument is required. Options accept `Partial<SetParamOptions>` (the
type is exported from `builtinx/dom`):

- `removeIfNull` defaults to `true`: null/undefined delete all entries for the key.
  When false, null/undefined become an empty string.
- `addIfEmpty` defaults to `false`: empty values update existing keys, but do not
  add missing keys unless this option is true. `removeIfNull` takes precedence.
- Setting a value uses native `URLSearchParams.set` semantics, collapsing duplicate
  entries for that key. Deleting removes every entry for the key. Query encoding
  may be normalized by `URLSearchParams`; unchanged URLs skip `replaceState`.

Unlike `URL.setParam`, an empty string does not delete an existing key here.

```ts
window.setParam('page', '2');
window.setParam('q', '', { addIfEmpty: true });
window.setParam('q', null, { removeIfNull: false, addIfEmpty: true });
window.deleteParam('page');
```

### Node and MutationObserver

- `Node.ownText()` returns direct child text only.
- `Node.isTextNode()` identifies Text nodes.
- `Node.isCommentNode()` identifies Comment nodes. The static form `BuiltinX.Node.isCommentNode(node)` also supports nodes from other windows.
- `Node.isLineBreakTextNode()` identifies Text nodes containing only whitespace and at least one CR or LF.
- `Node.isWhitespaceTextNode()` identifies Text nodes containing only JavaScript whitespace (`\s`), including empty Text nodes. Both whitespace predicates also have static forms on `BuiltinX.Node`.
- `Node.isBr()` and `Node.isFont()` identify HTML `<br>` and `<font>` elements, including in XHTML documents.
- `Node.isBlockTag()` checks a fixed HTML tag list: `div`, `blockquote`, `p`, `li`, `td`, `th`, `body`, `section`, `article`, `main`, `aside`, `header`, and `footer`. It ignores CSS and does not cover every element with a default block display. These three predicates also have static forms on `BuiltinX.Node` for nodes from other windows.
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
- `TimeSpan`: integer-millisecond duration factory and arithmetic helpers. Its public constructor rejects non-finite, fractional, and unsafe millisecond values; single-unit factories round fractional inputs. `parse(str, ...formats)` accepts `hours:minutes:seconds` and `days.hours:minutes:seconds` by default, or tries custom formats in order when supplied.
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

### TimeSpan parsing and formatting

```ts
TimeSpan.parse("1.2:3:4"); // default format
TimeSpan.parse("01:30", "HH:mm:ss", "HH:mm"); // first matching format
TimeSpan.parse("-2 01:30:00.125", "D HH:mm:ss.SSS");
TimeSpan.parse("1:30 pm", "h:mm a");
TimeSpan.parse("2 days 03h", "D[ days ]HH[h]");

const formats = ["HH:mm:ss.SSS", "HH:mm:ss.sss", "HH:mm:ss"];
TimeSpan.parse("01:30:00.125", ...formats);

const duration = TimeSpan.from(2, 13, 4, 5, 6);
duration.toString("D HH:mm:ss.SSS"); // "2 13:04:05.006"
duration.toString("dd h:mm:ss.sss a"); // "02 1:04:05.006 pm"
duration.toString(); // "2.13:4:5" (original default output)
duration.toString("h:mm:ss", { totalHighestUnit: true }); // "61:04:05"
duration.toString("mm:ss", { totalHighestUnit: true }); // "3664:05"
```

Custom formats use these Day.js-style tokens for duration components:

| Token | Component | Accepted values |
| --- | --- | --- |
| `D`, `d` | Days | One or more digits |
| `DD`, `dd` | Days | At least two digits, including values over 99 |
| `H`, `HH` | Hours | 0–23 |
| `h`, `hh` | Hours with `A` or `a` | 1–12 |
| `m`, `mm` | Minutes | 0–59 |
| `s`, `ss` | Seconds | 0–59 |
| `SSS`, `sss` | Milliseconds | Exactly three digits, 000–999 |
| `A` | Meridiem | `AM` or `PM` |
| `a` | Meridiem | `am` or `pm` |

Single hour, minute, and second tokens accept one or two digits; doubled tokens
require exactly two. `d`/`dd` are aliases for day counts, not weekdays.
`12 AM` means hour 0 and `12 PM` means hour 12. `h`/`hh` require `A`/`a`;
`H`/`HH` cannot be combined with them. Missing components default to zero.
A leading `-` negates the whole duration. Enclose literal text in `[brackets]`;
punctuation outside brackets is matched literally.

Every supplied format is validated before matching. Unsupported tokens, duplicate
components, and invalid meridiem combinations throw. Inputs must match a supplied
format completely, including case, spacing, digit widths, and component ranges;
out-of-range components allow the next format to be tried. If none matches, parsing
throws. Millisecond totals outside the safe integer range throw `RangeError`.
Omitting formats preserves the existing default parser's behavior.

`toString(format)` uses the same tokens and literal syntax. Single tokens produce
unpadded components; doubled tokens pad to at least two digits, and milliseconds
always use three digits. Components use absolute values, with one leading `-` for
negative durations. Hours, minutes, and seconds are component values rather than
totals; omitted components are not displayed or rounded. Formatting allows repeated
tokens and standalone `h`/`hh` or `A`/`a`. Empty formats produce an empty body, and
literal-only formats are supported. Unsupported tokens and malformed brackets throw.
Calling `toString()` without a format preserves its original output, including its
negative-component notation and omission of milliseconds.

`toString(format, { totalHighestUnit: true })` displays the largest numeric unit in
the format as a total, including all larger units. The largest unit is determined
by unit size, regardless of token order or bracket literals. Totals are truncated
to integers; smaller components retain their usual values. Padding is a minimum
width, so totals may exceed the token width. When hours are the largest unit,
`h`/`hh` also show total hours instead of using the 12-hour clock. Combining total
hours with `A`/`a` throws, regardless of the duration's value. Formats containing
days (such as `D h:mm A`) remain valid, as do escaped literals such as `[A]`.
Otherwise, `A`/`a` keep their existing component-hour meaning.
The option defaults to false and applies
only to explicit formats. Parsing keeps its existing component ranges, so total
output exceeding those ranges cannot be parsed using the same custom format.

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
