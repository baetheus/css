import type { StyleInput } from "../combinators/types.ts";

// Theme contract types - maps object structure to var() references
export type ThemeVars<T> = T extends Record<string, infer V>
  ? V extends string | null ? Record<keyof T, string> // var() references at leaves
  : { [K in keyof T]: ThemeVars<T[K]> }
  : never;

// Theme values - actual CSS values matching contract structure
export type ThemeValues<T> = T extends Record<string, infer V>
  ? V extends string | null ? Record<keyof T, string> // actual values at leaves
  : { [K in keyof T]: ThemeValues<T[K]> }
  : never;

// Recipe variant types
export type VariantDefinitions = Record<string, Record<string, StyleInput>>;

export type VariantSelection<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

export type DefaultVariants<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

export interface CompoundVariant<V extends VariantDefinitions> {
  variants: Partial<VariantSelection<V>>;
  style: StyleInput;
}

export interface RecipeOptions<V extends VariantDefinitions> {
  base?: StyleInput;
  variants?: V;
  compoundVariants?: CompoundVariant<V>[];
  defaultVariants?: DefaultVariants<V>;
}

export interface RecipeFunction<V extends VariantDefinitions> {
  (options?: VariantSelection<V>): string;
  variants(): (keyof V)[];
  classNames: {
    base: string;
    variants: { [K in keyof V]: Record<keyof V[K], string> };
  };
}
