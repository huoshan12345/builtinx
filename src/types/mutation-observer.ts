import type { Predicate } from './lib';

/** 
 * A predicate function for MutationRecord.
 * @returns true if the mutation should be IGNORED (excluded).
 */
export type MutationExclusion = (record: MutationRecord) => boolean;

/** 
 * A transformation function to modify the existing list of exclude rules.
 */
export type MutationExclusionTransformer = (prevExcludes: MutationExclusion[]) => MutationExclusion[];

/** 
 * Input type for the excludes property: a direct array or a transformer function.
 */
export type MutationExclusionsInput = MutationExclusion[] | MutationExclusionTransformer;

/** 
 * Enhanced callback including the target node being observed.
 */
export type NodeMutationCallback = (
  mutations: MutationRecord[],
  observer: MutationObserver,
  node: Node
) => void;

/** Parameters received by a standard MutationCallback */
export type MutationCallbackParams = Parameters<MutationCallback>;

/** Parameters received by a NodeMutationCallback */
export type NodeMutationCallbackParams = Parameters<NodeMutationCallback>;

/**
 * Options for the enhanced MutationObserver, extending the standard MutationObserverInit.
 * Includes additional properties for debouncing and mutation exclusion logic.
 */
export class DebounceMutationCallbackOptions {
  /** Debounce interval in milliseconds. */
  debounceMs: number = 1000;
  /** If true, triggers the callback on the leading edge of the debounce. */
  immediate: boolean = false;
  /** List of predicates to determine which mutations should be excluded (ignored). */
  exclusions: Predicate<MutationRecord>[] = [];

  /** Optional callback to be executed before the main callback. */
  beforeCallback?: MutationCallback;
  /** Optional callback to be executed after the main callback. */
  afterCallback?: MutationCallback;
  /** Optional function that will be called when the callback is skipped. */
  onSkipped?: MutationCallback;

  constructor(options: Partial<DebounceMutationCallbackOptions>) {
    Object.assign(this, options);
  }
}

/**
 * Configuration for an enhanced MutationObserver.
 * Custom properties handle debouncing and mutation filtering (exclusion logic).
 */
export class MutationObserverOptions implements MutationObserverInit {
  // --- Standard MutationObserverInit Properties ---
  attributeFilter?: string[] = undefined;
  attributeOldValue?: boolean = false;
  attributes?: boolean = false;
  characterData?: boolean = false;
  characterDataOldValue?: boolean = false;
  childList: boolean = true;
  subtree: boolean = true;

  // --- Extended Properties ---

  /** Debounce interval in milliseconds. */
  debounceMs: number = 1000;
  /** If true, triggers the callback on the leading edge of the debounce. */
  immediate: boolean = true;
  /** If true, executes the callback once immediately after observation starts. */
  callAtOnce: boolean = true;
  /** Optional callback to be executed before the main callback. */
  beforeCallback?: NodeMutationCallback;
  /** Optional callback to be executed after the main callback. */
  afterCallback?: NodeMutationCallback;
  /** Optional function that will be called when the callback is skipped. */
  onSkipped?: NodeMutationCallback;

  private _exclusions: MutationExclusion[] = [];

  /** Get the current list of mutation exclusion predicates. */
  public get exclusions(): MutationExclusionsInput {
    return this._exclusions;
  }

  /** 
   * Set the exclusions either by providing a new array or by passing a transformer function.
   * The transformer receives the current list of exclusions and should return a new list.
   */
  public set exclusions(value: MutationExclusionsInput) {
    if (typeof value === 'function') {
      this._exclusions = value(this._exclusions);
    } else {
      this._exclusions = value;
    }
  }

  /** Returns the resolved list of exclusion predicates. */
  public get resolvedExclusions(): MutationExclusion[] {
    return this._exclusions;
  }

  private static _default: Partial<MutationObserverOptions> = {};

  public static get default(): Partial<MutationObserverOptions> {
    return MutationObserverOptions._default;
  }

  public static set default(value: Partial<MutationObserverOptions>) {
    MutationObserverOptions._default = {
      ...MutationObserverOptions._default,
      ...value
    };
  }

  constructor(init?: Partial<MutationObserverOptions>) {
    // Priority: Instance defaults < Global defaults < Constructor arguments
    Object.assign(this, MutationObserverOptions._default, init);
  }

  /** Extracts standard MutationObserverInit properties only. */
  public toNativeInit(): MutationObserverInit {
    return {
      attributeFilter: this.attributeFilter,
      attributeOldValue: this.attributeOldValue,
      attributes: this.attributes,
      characterData: this.characterData,
      characterDataOldValue: this.characterDataOldValue,
      childList: this.childList,
      subtree: this.subtree,
    };
  }
}