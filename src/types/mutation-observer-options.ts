import { shallowMerge } from '@/helpers/utils';

/**
 * A predicate function for MutationRecord.
 * @param record The mutation record to inspect.
 * @returns true if the mutation should be IGNORED (excluded).
 */
export type MutationExclusion = (record: MutationRecord) => boolean;

/**
 * A transformation function to modify the existing list of exclude rules.
 * @param prevExcludes The current exclusion list.
 * @returns The exclusion list that should replace the current list.
 */
export type MutationExclusionTransformer = (prevExcludes: MutationExclusion[]) => MutationExclusion[];

/**
 * Input accepted by the `exclusions` setter: a replacement array or a transformer function.
 */
export type MutationExclusionsInput = MutationExclusion[] | MutationExclusionTransformer;

/**
 * Enhanced callback including the target node being observed.
 * @param mutations The mutation records delivered for this invocation.
 * @param observer The observer that delivered the records.
 * @param node The node passed to `Node.observe`.
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
  /** Debounce interval in milliseconds; default is 1000ms. */
  debounceMs: number = 1000;
  /**
   * Maximum time a pending callback may be delayed during continuous mutations;
   * default is 1000ms. Set it to undefined to disable the maximum wait.
   *
   * This limit applies independently of `trailing`.
   */
  maxWaitMs?: number = 1000;
  /** If true, invokes the first callback in a debounce window immediately; default is true. */
  leading: boolean = true;
  /**
   * If true, invokes the final pending callback after mutations stop; default is true.
   * Setting this to false does not disable invocations caused by `maxWaitMs`.
   */
  trailing: boolean = true;

  /** Creates resolved debounce options from optional overrides. */
  constructor(init?: Partial<MutationObserverDebounceOptions>) {
    Object.assign(this, init);
  }
}

/** Input for the `debounce` option. False disables debounce scheduling. */
export type MutationObserverDebounceOptionsInput = Partial<MutationObserverDebounceOptions> | false;

/** Members whose input types differ from their resolved `MutationObserverOptions` types. */
export interface MutationObserverOptionsOverrides {
  /** A replacement exclusion list or a transformer applied to the current list. */
  exclusions: MutationExclusionsInput;
  /** Partial debounce settings, or false to disable debounce scheduling. */
  debounce: MutationObserverDebounceOptionsInput;
}

/** Optional initialization values accepted by `MutationObserverOptions` and `Node.observe`. */
export type MutationObserverOptionsInit =
  Partial<Omit<MutationObserverOptions, keyof MutationObserverOptionsOverrides>
    & Partial<MutationObserverOptionsOverrides>>;

/**
 * Resolved configuration for `Node.observe`.
 *
 * Native mutation observer settings are combined with optional startup invocation,
 * exclusion filtering, lifecycle callbacks, and debounce scheduling.
 */
export class MutationObserverOptions implements MutationObserverInit {
  /** Attribute names to observe when attribute observation is enabled. */
  attributeFilter?: string[] = undefined;
  /** Whether attribute mutation records include the previous value; default is false. */
  attributeOldValue?: boolean = false;
  /** Whether attribute mutations are observed; default is false. */
  attributes?: boolean = false;
  /** Whether character data mutations are observed; default is false. */
  characterData?: boolean = false;
  /** Whether character data mutation records include the previous value; default is false. */
  characterDataOldValue?: boolean = false;
  /** Whether additions and removals of child nodes are observed; default is true. */
  childList: boolean = true;
  /** Whether descendants of the observed node are also observed; default is true. */
  subtree: boolean = true;

  /**
   * Whether to invoke the callback once with a synthetic mutation record targeting the
   * observed node before native observation starts; default is true.
   */
  callOnStart: boolean = true;
  /** Callback invoked immediately before each main callback invocation. */
  beforeCallback?: NodeMutationCallback;
  /** Callback invoked immediately after each successful main callback invocation. */
  afterCallback?: NodeMutationCallback;
  /** Callback invoked when every delivered mutation record is excluded. */
  onSkipped?: NodeMutationCallback;

  private _exclusions: MutationExclusion[] = [];
  /** Gets the current list of mutation exclusion predicates. */
  public get exclusions(): MutationExclusion[] {
    return this._exclusions;
  }

  /**
   * Replaces the current exclusions with an array, or replaces them with the result of a
   * transformer that receives the current list.
   */
  public set exclusions(value: MutationExclusionsInput) {
    if (typeof value === 'function') {
      this._exclusions = value(this._exclusions);
    } else {
      this._exclusions = value;
    }
  }

  private _debounce?: MutationObserverDebounceOptions;

  /**
   * Enables debounce with resolved options, or disables it when set to false.
   */
  public set debounce(value: MutationObserverDebounceOptionsInput) {
    if (value) {
      this._debounce = new MutationObserverDebounceOptions(value);
    } else {
      this._debounce = undefined;
    }
  }

  /** Gets the resolved debounce options, or undefined when debounce is disabled. */
  public get debounce(): MutationObserverDebounceOptions | undefined {
    return this._debounce;
  }

  private static _default: MutationObserverOptionsInit = { debounce: {} };

  /**
   * Gets the accumulated global defaults applied to subsequently created instances.
   */
  public static get default(): MutationObserverOptionsInit {
    return MutationObserverOptions._default;
  }

  /**
   * Merges additional global defaults into the existing defaults.
   * Debounce objects are shallow-merged; false disables debounce globally.
   */
  public static set default(value: MutationObserverOptionsInit) {
    const debounce = shallowMergeDebounceOptions(MutationObserverOptions._default.debounce, value.debounce);
    MutationObserverOptions._default = {
      ...MutationObserverOptions._default,
      ...value,
      debounce,
    };
  }

  /**
   * Creates resolved options by applying class defaults, accumulated global defaults,
   * and instance overrides in that order.
   */
  constructor(init?: MutationObserverOptionsInit) {
    this.apply(MutationObserverOptions._default);
    this.apply(init);

    const debounce = shallowMergeDebounceOptions(MutationObserverOptions._default.debounce, init?.debounce);
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

  /** Returns only options understood by the native `MutationObserver.observe` method. */
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
  current?: MutationObserverDebounceOptionsInput,
  next?: MutationObserverDebounceOptionsInput) {
  // An explicit false always disables debounce.
  if (next === false) {
    return false;
  }

  // Omitting the next value preserves the current enabled/disabled state.
  if (next === undefined) {
    return current;
  }

  // An options object explicitly re-enables a previously disabled debounce.
  return shallowMerge(current === false ? undefined : current, next);
}
