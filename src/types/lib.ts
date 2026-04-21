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

export type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];
export type OnlyBoolean<T> = { [k in BooleanKeys<T>]: boolean };
export type StringKeys<T> = { [k in keyof T]: T[k] extends string ? k : never }[keyof T];
export type OnlyString<T> = { [k in StringKeys<T>]: string };

export type QueryParam = [string, string];
export type QueryParams = QueryParam[];