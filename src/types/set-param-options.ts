/** Controls nullish and empty values when changing a window's query parameters. */
export interface SetParamOptions {
  /** Delete the parameter for null/undefined. Defaults to true. */
  removeIfNull: boolean;
  /** Add a missing parameter when its normalized value is empty. Defaults to false. */
  addIfEmpty: boolean;
}
