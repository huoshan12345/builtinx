import { shallowMerge } from '@/helpers/utils';

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
 * Scheduling options for debouncing mutation observer callbacks.
 */
export class MutationObserverDebounceOptions {
  /** Debounce interval in milliseconds. */
  debounceMs: number = 1000;
  /** An optional number specifying the maximum time a pending call may be delayed. */
  maxWaitMs?: number = 1000;
  /** If true, triggers the callback on the leading edge of the debounce. */
  leading: boolean = true;
  /** If true, triggers the callback on the trailing edge of the debounce. */
  trailing: boolean = true;

  constructor(init?: Partial<MutationObserverDebounceOptions>) {
    Object.assign(this, init);
  }
}

export type MutationObserverDebounceOptionsInput = Partial<MutationObserverDebounceOptions> | false;


export interface MutationObserverOptionsOverrides {
  exclusions: MutationExclusionsInput;
  debounce: MutationObserverDebounceOptionsInput;
}

export type MutationObserverOptionsInit = Partial<Omit<MutationObserverOptions, keyof MutationObserverOptionsOverrides> & Partial<MutationObserverOptionsOverrides>>;

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

  /** If true, invokes the callback once with a synthetic mutation record targeting the observed node. */
  callOnStart: boolean = true;
  /** Optional callback to be executed before the main callback. */
  beforeCallback?: NodeMutationCallback;
  /** Optional callback to be executed after the main callback. */
  afterCallback?: NodeMutationCallback;
  /** Optional function that will be called when the callback is skipped. */
  onSkipped?: NodeMutationCallback;

  private _exclusions: MutationExclusion[] = [];
  /** Get the current list of mutation exclusion predicates. */
  public get exclusions(): MutationExclusion[] {
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

  private _debounce?: MutationObserverDebounceOptions;
  public set debounce(value: MutationObserverDebounceOptionsInput) {
    if (value) {
      this._debounce = new MutationObserverDebounceOptions(value);
    } else {
      this._debounce = undefined;
    }
  }
  public get debounce(): MutationObserverDebounceOptions | undefined {
    return this._debounce ?? undefined;
  }

  private static _default: MutationObserverOptionsInit;
  public static get default(): MutationObserverOptionsInit {
    return MutationObserverOptions._default;
  }
  public static set default(value: MutationObserverOptionsInit) {
    const debounce = shallowMergeDebounceOptions(MutationObserverOptions._default?.debounce, value.debounce);
    MutationObserverOptions._default = {
      ...MutationObserverOptions._default,
      ...value,
      debounce,
    };
  }

  constructor(init?: MutationObserverOptionsInit) {
    this.apply(MutationObserverOptions._default);
    this.apply(init);

    const debounce = shallowMergeDebounceOptions(MutationObserverOptions._default?.debounce, init?.debounce);
    this.debounce = debounce == null
      ? false
      : debounce;
  }

  private apply(init?: MutationObserverOptionsInit): void {
    if (!init)
      return;

    const { debounce: _, exclusions, ...options } = init;
    Object.assign(this, options);

    if (exclusions !== undefined) {
      this.exclusions = exclusions;
    }
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

function shallowMergeDebounceOptions(
  current?: MutationObserverDebounceOptionsInput | undefined,
  next?: MutationObserverDebounceOptionsInput) {
  // If the next value is explicitly false, we disable debounce.
  if (next === false) {
    return false;
  }
  // converts false to undefined for proper merging
  return shallowMerge(current || undefined, next || undefined);
}
