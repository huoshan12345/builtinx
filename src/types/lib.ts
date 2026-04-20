export type MatchPattern = string | RegExp;
export type Predicate<T> = (arg: T) => boolean;
export type URLLike = string | URL;
export type Nullish = null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullishable<T> = T | null | undefined;
export type TProperty = string | number | symbol;
export type OneOrMany<T> = T | ArrayLike<T>;
export type HTMLNode = HTMLElement | Document | Text | Comment;
export type Awaitable<T> = T | Promise<T>;
export type Extractor<T = string> = [RegExp, (match: RegExpExecArray) => T];
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;