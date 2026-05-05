/** 
 * A predicate function for MutationRecord.
 * @returns true if the mutation should be IGNORED (excluded).
 */
export type MutationExclude = (record: MutationRecord) => boolean;

/** 
 * A transformation function to modify the existing list of exclude rules.
 */
export type MutationExcludesTransformer = (prevExcludes: MutationExclude[]) => MutationExclude[];

/** 
 * Input type for the excludes property: a direct array or a transformer function.
 */
export type MutationExcludesInput = MutationExclude[] | MutationExcludesTransformer;

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

  /** 
   * Debounce interval in milliseconds. 
   */
  debounceMs: number = 1000;

  /**
   * If true, triggers the callback on the leading edge of the debounce.
   */
  immediate: boolean = true;

  /**
   * If true, executes the callback once immediately after observation starts.
   */
  callAtOnce: boolean = true;

  private _excludes: MutationExclude[] = [];

  /** 
   * A list of predicates. If ANY predicate returns TRUE, the MutationRecord is discarded.
   */
  public get excludes(): MutationExclude[] {
    return this._excludes;
  }

  public set excludes(value: MutationExcludesInput) {
    if (typeof value === 'function') {
      this._excludes = value(this._excludes);
    } else {
      this._excludes = value;
    }
  }

  // --- Static Default Management ---

  private static _globalDefaults: Partial<MutationObserverOptions> = {};

  public static get default(): Partial<MutationObserverOptions> {
    return MutationObserverOptions._globalDefaults;
  }

  public static set default(value: Partial<MutationObserverOptions>) {
    MutationObserverOptions._globalDefaults = {
      ...MutationObserverOptions._globalDefaults,
      ...value
    };
  }

  constructor(init?: Partial<MutationObserverOptions>) {
    // Priority: Instance defaults < Global defaults < Constructor arguments
    Object.assign(this, MutationObserverOptions._globalDefaults, init);
  }

  /**
   * Extracts standard MutationObserverInit properties only.
   */
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