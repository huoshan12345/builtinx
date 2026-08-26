# Code Review — 2026-08-26

## Scope and validation

Reviewed every TypeScript file under `src/`, starting with package boundaries and public APIs, then examining each implementation. No production code was changed.

Validation completed:

- `pnpm test -- --run` — 28 test files and 564 tests passed.
- `pnpm run type-check` — passed.

## Follow-up verification

- Finding 1's P0 quota-recovery data-loss path is **fixed**. Invalid non-cache values are preserved by `getCache` and `cleanupExpired`, arbitrary key eviction was removed, and regression coverage was added. A foreign JSON value with a numeric expired `expire` property is still treated as a cache entry.
- Finding 2 is **accepted by design**. The package intentionally owns the `BuiltinX` global after its entry point is imported.
- Finding 3 is **accepted by design**. `replaceMatch` intentionally remains inherited from `Array.prototype`.
- Finding 4 is **fixed and verified**. The typed query readers now use the effective last value, and `deleteParam` adopts the platform's optional-value deletion API. Regression coverage was added for both behaviors.
- Finding 5 is **fixed and verified**. `leading` and `trailing` are independent options, both defaulting to true, and regression coverage verifies their combined and disabled behavior.
- The mutation-observer startup option is **refined and verified**. `callAtOnce` was renamed to `callOnStart` to distinguish startup invocation from debounce-edge behavior. The default remains true and the runtime behavior is unchanged.
- Finding 6 is **fixed and verified**. `Lazy<T>` now caches nullish values as successful creation results and provides `reset()` to discard the cache without invoking the factory.
- Finding 7 is **partially fixed and verified**. Construction, factory input, and arithmetic results now maintain the finite safe-integer-millisecond invariant; the string round-trip limitation remains.

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

### 7. [P1] `TimeSpan.toString()` is not parseable for values with days

The constructor now requires finite safe-integer milliseconds, and all factory and arithmetic paths flow through that validation. However, the string form for a value with days, such as `1.0:0:0`, still cannot be read by `TimeSpan.parse`, whose grammar has no day component.

Evidence: `src/utils/time-span.ts:74`, `src/utils/time-span.ts:137`, `src/utils/time-span.ts:150`; validation regression tests in `test/utils/time-span.test.ts`.

Make `parse` accept exactly the format produced by `toString` (including signed values if they are supported), and add round-trip tests.

### 8. [P1] `Timer.every` has no interval validation or prompt cancellation path

`Timer.every` accepts any `number` or `TimeSpan` and passes it directly to `setTimeout`. Negative, `NaN`, and invalid `TimeSpan` values become effectively zero-delay loops in common runtimes, allowing a consumer to create an unbounded hot loop. The infinite generator also has no `AbortSignal` or cancellation-aware delay, so an externally requested stop cannot interrupt a pending long interval.

Evidence: `src/utils/timer.ts:4`.

Reject non-finite or negative intervals before starting the generator. Add an optional `AbortSignal` and use a delay that reacts to abort so the timer's lifecycle is explicit and independently cancellable.

### 9. [P2] `Http.downloadText` exposes the wrong TypeScript contract and default media type

The public interface says `downloadText` returns `void`, while the implementation returns a `Promise<void>`. Consumers therefore cannot await the declared API even though the operation may reject while creating or downloading the blob. Its documented and implemented default MIME type is `plain/text`; the standard type for plain text is `text/plain`.

Evidence: `src/helpers/http.ts:9`, `src/helpers/http.ts:11`, `src/helpers/http.ts:34`.

Declare `downloadText` as `Promise<void>` and use `text/plain` (optionally with a charset) as the default. Add a declaration-level usage test that awaits the public method.

### 10. [P2] `RegExp.find` and `findAll` do not honor sticky regular expressions

Both methods promise to find matches in the input, but reset `lastIndex` to zero. A sticky regex such as `/id/y` therefore fails to find `"xxid"`, and `findAll` clones a non-global sticky expression as `/id/gy`, which still only matches at the current index. This silently produces no matches instead of either searching the input or preserving sticky semantics.

Evidence: `src/extensions/regexp.ts:10`, `src/extensions/regexp.ts:20`, `src/extensions/regexp.ts:27`.

Decide whether these helpers are searches or cursor-based operations. For search semantics, reject or normalize away `y` when cloning and avoid relying on a sticky original. For cursor semantics, preserve and document `lastIndex` instead of resetting it. Add sticky-regex tests for both methods.

### 11. [P2] Storage documentation still says invalid entries are removed

The follow-up implementation intentionally preserves values that cannot be parsed as cache entries, but the public comments for `getCache` and `cleanupExpired` still say that invalid entries are removed. Callers can therefore make an incorrect retention and cleanup decision from the declared API.

Evidence: `src/extensions/storage.ts:18`, `src/extensions/storage.ts:32`, `src/extensions/storage.ts:122`.

Update the comments to say that expired cache entries are removed, while unrecognized values are preserved.
