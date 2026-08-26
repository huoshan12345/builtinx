# Code Review — 2026-08-26

## Scope and validation

Reviewed every TypeScript file under `src/`, starting with package boundaries and public APIs, then examining each implementation. This report also records the verification of follow-up production changes requested by the owner.

Validation completed:

- `pnpm test -- --run` — 30 test files and 588 tests passed.
- `pnpm run type-check` — passed.

## Follow-up verification

- Finding 1's P0 quota-recovery data-loss path is **fixed**. Invalid non-cache values are preserved by `getCache` and `cleanupExpired`, arbitrary key eviction was removed, and regression coverage was added. A foreign JSON value with a numeric expired `expire` property is still treated as a cache entry.
- Finding 2 is **accepted by design**. The package intentionally owns the `BuiltinX` global after its entry point is imported.
- Finding 3 is **accepted by design**. `replaceMatch` intentionally remains inherited from `Array.prototype`.
- Finding 4 is **fixed and verified**. The typed query readers now use the effective last value, and `deleteParam` adopts the platform's optional-value deletion API. Regression coverage was added for both behaviors.
- Finding 5 is **fixed and verified**. `leading` and `trailing` are independent options, both defaulting to true, and regression coverage verifies their combined and disabled behavior.
- The mutation-observer startup option is **refined and verified**. `callAtOnce` was renamed to `callOnStart` to distinguish startup invocation from debounce-edge behavior. The default remains true and the runtime behavior is unchanged.
- Finding 6 is **fixed and verified**. `Lazy<T>` now caches nullish values as successful creation results and provides `reset()` to discard the cache without invoking the factory.
- Finding 7 is **fixed and verified**. Construction, factory input, and arithmetic results maintain the finite safe-integer-millisecond invariant, and `parse` supports the day-qualified string form produced by `toString`.
- Finding 8 is **fixed and verified**. `Timer.every` validates its interval and accepts an optional `AbortSignal` that completes the generator promptly during a pending wait.
- Finding 9 is **fixed and verified**. `Http.downloadText` now exposes its Promise return type and defaults to the standard `text/plain` MIME type.
- Finding 10 is **fixed and verified**. Non-sticky `find` and `findAll` retain their from-the-start search contract, while sticky (`y`) expressions begin at their current `lastIndex` and preserve sticky matching semantics. Both methods restore the caller's original `lastIndex` afterward.
- Finding 11 is **fixed and verified**. Storage API documentation now states that only expired cache entries are removed and unrecognized values are preserved.

## Design summary

The package has a coherent stated purpose: an intentional, side-effecting layer of built-in and web-platform conveniences, supplemented by exported utility types. That model is inherently collision-prone, but the README communicates the prototype-patching decision clearly enough to review the individual APIs.

The storage cache extension remains the main design concern because its cache format has no ownership marker. The destructive quota-recovery behavior has been removed; the remaining boundary limitation is documented in Finding 1.

## Findings

### 1. [P2] Storage cache entries still have no ownership marker

The follow-up change correctly stops `getCache` and `cleanupExpired` from deleting values that cannot be parsed as cache envelopes, and it removes arbitrary key eviction during quota recovery. However, a foreign JSON value that happens to contain an expired numeric `expire` property is still removed by `cleanupExpired` because the cache format has no namespace or ownership marker.

Evidence: `src/extensions/storage.ts:55`, `src/extensions/storage.ts:72`, `src/extensions/storage.ts:99`.

Give cache entries a reserved, documented key prefix and an explicit versioned envelope. Enumerate, validate, and remove only entries in that namespace. This is no longer a P0 issue because quota recovery no longer evicts arbitrary keys.

### 2. [Accepted by design] Importing the core entry point replaces the global `BuiltinX`

The helper namespace is installed by unconditional assignment. This is inconsistent with the prototype installation policy, which avoids replacing existing own properties. Any host that already uses `globalThis.BuiltinX` loses its value merely by importing this package, without a diagnostic or opt-in.

Evidence: `src/helpers/index.ts:7`; the core entry point imports this module at `src/index.ts:16`.

The owner has confirmed that the package intentionally owns this global after import. No implementation change is required; the collision policy should remain documented for consumers.

### 3. [Accepted by design] Match-specific `replaceMatch` is installed on every array

The ambient declaration promises `match.replaceMatch(replacement)`, yet the implementation adds `replaceMatch` to `Array.prototype`. A `RegExpExecArray` happens to inherit it because it is an array, but every ordinary array now also receives an undocumented, meaningless method. The type declaration and the mutated runtime surface therefore disagree, and a match operation leaks into the package's broadest patched prototype.

Evidence: declaration at `src/extensions/array.regexp.ts:62`; installation at `src/extensions/array.regexp.ts:159`.

The owner has confirmed that this prototype placement is intentional. No implementation change is required.

### 4. [Fixed] Query helpers now use consistent duplicate-key semantics

The follow-up change makes `getInt` and `getBool` use the effective last value, matching `getParam`. It also replaces `tryDeleteParam` with `deleteParam(key, value?)`, which maps directly to the platform API and deletes only matching values when one is supplied.

Evidence: `src/extensions/url-search-params.ts:72`, `src/extensions/url-search-params.ts:82`, `src/extensions/url.ts:47`, `src/extensions/url.ts:125`; regression tests in `test/extensions/url-search-params.test.ts` and `test/extensions/url.test.ts`.

Compatibility note: removing the public `tryDeleteParam` member is a breaking API change. Retain it as a deprecated wrapper for one release, or publish this change as a breaking release with a migration note.

### 5. [Fixed] Debounce now exposes explicit leading and trailing semantics

The ambiguous `immediate` option has been replaced with independent `leading` and `trailing` options. Both default to true. With both enabled, the first call runs immediately and a final trailing call occurs only when another call arrives during the debounce window; one isolated call therefore runs exactly once.

Evidence: `src/types/utils.ts:10`, `src/helpers/utils.ts:5`, `src/helpers/utils.ts:35`, `src/types/mutation-observer.ts:41`; regression tests in `test/helpers/utils.test.ts`.

No further action is required for this finding.

### 6. [Fixed] `Lazy<T>` caches nullish values and supports reset

`Lazy<T>` now tracks successful creation independently of the cached value. A factory result of `null` or `undefined` is cached and makes `isValueCreated` true. `reset()` clears that state without invoking the factory, so the next `value` access creates and caches a new result.

Evidence: `src/utils/lazy.ts:7`, `src/utils/lazy.ts:15`, `src/utils/lazy.ts:31`; regression tests in `test/utils/lazy.test.ts`.

No further action is required for this finding.

### 7. [Fixed] `TimeSpan.parse()` supports day-qualified string forms

`TimeSpan.parse()` now accepts both `hours:minutes:seconds` and `days.hours:minutes:seconds`, including the signed component format currently produced by `toString` for negative values.

Evidence: `src/utils/time-span.ts:140`, `src/utils/time-span.ts:150`; regression tests in `test/utils/time-span.test.ts`.

No further action is required for this finding.

### 8. [Fixed] `Timer.every` validates intervals and supports cancellation

`Timer.every` now rejects non-finite, negative, and platform-overflowing intervals before creating a timer. Its optional `AbortSignal` clears a pending timer and completes the async generator without yielding again.

Evidence: `src/utils/timer.ts:3`, `src/utils/timer.ts:34`; regression tests in `test/utils/timer.test.ts`.

No further action is required for this finding.

### 9. [Fixed] `Http.downloadText` exposes its Promise contract and standard media type

The public interface and implementation now both return `Promise<void>`, allowing consumers to await failures from blob download initiation. The default MIME type is now the standard `text/plain`.

Evidence: `src/helpers/http.ts:9`, `src/helpers/http.ts:12`, `src/helpers/http.ts:35`; regression tests in `test/helpers/http.test.ts`.

No further action is required for this finding.

### 10. [Fixed] `RegExp.find` and `findAll` support sticky regular expressions

For non-sticky expressions, the helpers are from-the-start search operations: they set the working expression's `lastIndex` to zero and restore its prior value afterward. Sticky (`y`) expressions instead begin at their current `lastIndex`; `findAll` adds `g` only when necessary and retains `y`. This preserves `/id/y` and `/id/gy` cursor semantics while still restoring the caller's expression state after the operation.

Evidence: `src/extensions/regexp.ts:10`, `src/extensions/regexp.ts:17`, `src/extensions/regexp.ts:31`; regression tests in `test/extensions/regexp.test.ts` and `test/extensions/string.test.ts`.

No further action is required for this finding.

### 11. [Fixed] Storage documentation reflects preservation of unrecognized values

The public comments now state that `getCache` and `cleanupExpired` preserve values that are not recognized as cache entries, while expired cache entries are removed. The cache-write documentation also accurately describes expiration cleanup as the quota-recovery step.

Evidence: `src/extensions/storage.ts:8`, `src/extensions/storage.ts:15`, `src/extensions/storage.ts:31`.

No further action is required for this finding.
