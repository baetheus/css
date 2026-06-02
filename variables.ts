/**
 * CSS variable contracts and utilities.
 *
 * This module provides a type-safe system for defining and using CSS custom
 * properties (variables). The contract system allows you to define the shape
 * of your CSS variables once and get type-checked references throughout your
 * codebase.
 *
 * @module
 * @since 0.0.4
 */

import { type CssValue, hashObject } from "./_internal.ts";
import { type Style, style } from "./style.ts";

// =============================================================================
// Properties and Variables
// =============================================================================

/**
 * A CSS custom property key (must start with `--`).
 *
 * @example
 * ```ts
 * import type { VariableKey } from "./variables.ts";
 *
 * const primary: VariableKey = "--primary-color";
 * const spacing: VariableKey = "--spacing-unit";
 * ```
 *
 * @since 0.0.4
 */
export type VariableKey = `--${string}`;

/**
 * A CSS var() function reference to a custom property.
 *
 * @example
 * ```ts
 * import type { VariableValue } from "./variables.ts";
 *
 * const ref: VariableValue = "var(--primary-color)";
 * const withFallback: VariableValue = "var(--primary-color, blue)";
 * ```
 *
 * @since 0.0.4
 */
export type VariableValue = `var(${VariableKey}${string})`;

/**
 * A partial record of CSS custom properties and their values.
 *
 * Used to define CSS variable declarations in style objects.
 *
 * @example
 * ```ts
 * import type { Variables } from "./variables.ts";
 *
 * const vars: Variables = {
 *   "--primary-color": "blue",
 *   "--spacing": "8px",
 *   "--font-size": 16,
 * };
 * ```
 *
 * @since 0.0.4
 */
export type Variables = Partial<Readonly<Record<VariableKey, CssValue>>>;

// =============================================================================
// CSS Variable Contracts
// =============================================================================

/**
 * Recursive shape type for defining CSS variable structure.
 *
 * `null` marks a CSS variable leaf, nested objects mark groups.
 * Used as input to `contract()` to define the variable structure.
 *
 * @example
 * ```ts
 * import type { Shape } from "./variables.ts";
 *
 * const shape = {
 *   colors: {
 *     primary: null,        // variable
 *     brand: {
 *       light: null,        // nested variable
 *       dark: null,
 *     },
 *   },
 *   spacing: null,          // top-level variable
 * } satisfies Shape;
 * ```
 *
 * @since 0.0.4
 */
export type Shape<T = null> = {
  readonly [key: string]: T | Shape<T>;
};

/**
 * Recursively transform a Shape to have a different value type at each leaf.
 *
 * Maps over the shape structure, replacing leaf values with type `I`.
 *
 * @example
 * ```ts
 * import type { Shape, MapShape, VariableValue } from "./variables.ts";
 *
 * type MyShape = { colors: { primary: null; secondary: null } };
 * type Mapped = MapShape<MyShape, VariableValue>;
 * // { colors: { primary: VariableValue; secondary: VariableValue } }
 * ```
 *
 * @since 0.0.4
 */
export type MapShape<T, I> = T extends Shape<infer A> ? {
    readonly [K in keyof T]: T[K] extends A ? I
      : T[K] extends Shape<A> ? MapShape<T[K], I>
      : never;
  }
  : never;

/**
 * Internal symbol for branding Contract objects.
 *
 * @internal
 * @since 0.0.4
 */
const ContractHash: unique symbol = Symbol("@baetheus/css/core/contract");

/**
 * Contract type - the result of the contract function.
 *
 * Contains `var()` references for each variable and a non-enumerable hash.
 * Use the contract properties in your styles to reference CSS variables.
 *
 * @example
 * ```ts
 * import { contract, type Contract, type Shape } from "./variables.ts";
 *
 * const theme = contract({ colors: { primary: null } });
 * // theme.colors.primary === "var(--abc1234-colors-primary)"
 * ```
 *
 * @since 0.0.4
 */
export type Contract<T extends Shape> = MapShape<T, VariableValue> & {
  readonly [ContractHash]: string;
};

/**
 * Extracts the original Shape type from a Contract.
 *
 * Use this to recover the shape definition from an existing contract,
 * which is useful when creating utility functions that work with contracts.
 *
 * @example
 * ```ts
 * import { contract, type ShapeOf } from "./variables.ts";
 *
 * const theme = contract({
 *   colors: { primary: null, secondary: null },
 *   spacing: null,
 * });
 *
 * type ThemeShape = ShapeOf<typeof theme>;
 * // { colors: { primary: null; secondary: null }; spacing: null }
 * ```
 *
 * @since 0.0.4
 */
export type ShapeOf<T> = T extends Contract<infer S> ? S : never;

/**
 * Extracts the values type needed for the `vars()` function from a Contract.
 *
 * Use this to get the expected values structure when creating variable
 * definitions for a contract. This is the type of the second argument to `vars()`.
 *
 * @example
 * ```ts
 * import { contract, vars, type VarsOf } from "./variables.ts";
 *
 * const theme = contract({
 *   colors: { primary: null, secondary: null },
 *   spacing: null,
 * });
 *
 * type ThemeValues = VarsOf<typeof theme>;
 * // { colors: { primary: CssValue; secondary: CssValue }; spacing: CssValue }
 *
 * // Useful for creating theme functions
 * function createTheme(values: VarsOf<typeof theme>) {
 *   return vars(theme, values);
 * }
 * ```
 *
 * @since 0.0.4
 */
export type VarsOf<T> = VarsValues<ShapeOf<T>>;

/**
 * Recursively walks a shape, calling onLeaf for each leaf value.
 *
 * A utility function for transforming shape structures. Traverses the shape
 * tree and applies the `onLeaf` callback to each leaf node.
 *
 * @param shape - The shape structure to walk
 * @param isLeaf - Predicate to identify leaf values
 * @param onLeaf - Callback invoked for each leaf with value and path
 * @param path - Current path in the shape (used internally)
 * @returns A new shape with transformed leaf values
 *
 * @example
 * ```ts
 * import { walkShape, type Shape } from "./variables.ts";
 *
 * const shape = { a: { b: null, c: null } };
 * const result = walkShape(
 *   shape,
 *   (v): v is null => v === null,
 *   (_, path) => path.join("-"),
 * );
 * // { a: { b: "a-b", c: "a-c" } }
 * ```
 *
 * @since 0.0.4
 */
export function walkShape<A, T extends Shape<A>, I>(
  shape: T,
  isLeaf: (value: A | Shape<A>) => value is A,
  onLeaf: (value: A, path: string[]) => I,
  path: string[] = [],
): MapShape<T, I> {
  const out: Record<string, unknown> = {};
  for (const key in shape) {
    const value = shape[key];
    const _path = [...path, key];
    if (isLeaf(value)) {
      const _value = onLeaf(value, _path);
      out[key] = _value;
    } else {
      out[key] = walkShape(value as Shape<A>, isLeaf, onLeaf, _path);
    }
  }
  return out as MapShape<T, I>;
}

/**
 * Recursively builds var() references for a shape.
 *
 * Transforms a shape structure into one where each leaf is replaced with
 * a `var()` reference using the hash and path.
 *
 * @param shape - The shape structure to transform
 * @param hash - The unique hash to use in variable names
 * @returns A shape with var() references at each leaf
 *
 * @example
 * ```ts
 * import { buildVarShape, type Shape } from "./variables.ts";
 *
 * const shape = { colors: { primary: null } };
 * const result = buildVarShape(shape, "abc1234");
 * // { colors: { primary: "var(--abc1234-colors-primary)" } }
 * ```
 *
 * @since 0.0.4
 */
export function buildVarShape<T extends Shape>(
  shape: T,
  hash: string,
): MapShape<T, VariableValue> {
  return walkShape(
    shape,
    (v) => v === null,
    (_, path) => `var(--${hash}-${path.join("-")})` as VariableValue,
  );
}

/**
 * Creates a CSS variable contract from a shape definition.
 *
 * The contract defines the structure of CSS variables and provides
 * `var()` references that can be used in styles. The actual values
 * are set separately using the `vars()` function.
 *
 * @param shape - An object defining the variable structure (null marks variables)
 * @returns A Contract with var() references and a non-enumerable hash
 *
 * @example
 * ```ts
 * import { contract, vars, style, join, render } from "./mod.ts";
 *
 * // Define the contract with arbitrary nesting
 * const theme = contract({
 *   colors: {
 *     primary: null,
 *     secondary: null,
 *     brand: {
 *       light: null,
 *       dark: null,
 *     },
 *   },
 *   spacing: null,  // top-level variable
 * });
 *
 * // Use var references in styles
 * const button = style({
 *   color: theme.colors.primary,
 *   backgroundColor: theme.colors.brand.light,
 *   padding: theme.spacing,
 * });
 *
 * // Create actual values
 * const lightTheme = vars(theme, {
 *   colors: {
 *     primary: "blue",
 *     secondary: "green",
 *     brand: { light: "#eef", dark: "#335" },
 *   },
 *   spacing: "8px",
 * });
 *
 * console.log(render(join(lightTheme, button)));
 * ```
 *
 * @since 0.0.4
 */
export function contract<T extends Shape>(shape: T): Contract<T> {
  const hash = hashObject(shape);
  const result = buildVarShape(shape, hash);

  Object.defineProperty(result, ContractHash, {
    value: hash,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return result as Contract<T>;
}

/**
 * Type guard to check if a value is a Contract object.
 *
 * @param value - The value to check
 * @returns `true` if the value is a Contract, `false` otherwise
 *
 * @example
 * ```ts
 * import { contract, isContract } from "./variables.ts";
 *
 * const theme = contract({ colors: { primary: null } });
 * isContract(theme);                    // true
 * isContract({ colors: { primary: null } }); // false
 * ```
 *
 * @since 0.0.4
 */
export function isContract(value: unknown): value is Contract<Shape> {
  return typeof value === "object" && value !== null && ContractHash in value;
}

/**
 * Recursively builds CSS custom properties from values.
 *
 * Transforms a shape with CSS values into a flat object of CSS custom
 * property declarations.
 *
 * @param shape - The shape with CSS values at each leaf
 * @param hash - The unique hash to use in variable names
 * @returns A Variables object with CSS custom property declarations
 *
 * @example
 * ```ts
 * import { buildProperties } from "./variables.ts";
 *
 * const values = { colors: { primary: "blue" } };
 * const props = buildProperties(values, "abc1234");
 * // { "--abc1234-colors-primary": "blue" }
 * ```
 *
 * @internal
 * @since 0.0.4
 */
export function buildProperties<T extends Shape<CssValue>>(
  shape: T,
  hash: string,
): Variables {
  const result: Record<string, CssValue> = {};
  walkShape(
    shape,
    (v: CssValue | Shape<CssValue>): v is CssValue =>
      typeof v === "string" || typeof v === "number",
    (value, path) => result[`--${hash}-${path.join("-")}`] = value,
  );
  return result;
}

/**
 * Recursively transform a Shape to have CssValue at each null leaf.
 *
 * Used as the input type for the `vars()` function to ensure values
 * match the contract's shape structure.
 *
 * @example
 * ```ts
 * import type { Shape, VarsValues } from "./variables.ts";
 *
 * type MyShape = { colors: { primary: null } };
 * type Values = VarsValues<MyShape>;
 * // { colors: { primary: string | number } }
 * ```
 *
 * @since 0.0.4
 */
export type VarsValues<T extends Shape> = MapShape<T, CssValue>;

/**
 * Creates a Style with CSS custom properties from a contract and values.
 *
 * This function generates the actual CSS custom property definitions
 * that match the contract's structure.
 *
 * @param contract - The contract defining the variable structure
 * @param values - The actual values for each variable
 * @returns A Style containing the CSS custom properties
 *
 * @example
 * ```ts
 * import { contract, vars, render } from "./mod.ts";
 *
 * const theme = contract({
 *   colors: {
 *     primary: null,
 *     brand: { light: null, dark: null },
 *   },
 *   spacing: null,
 * });
 *
 * const light = vars(theme, {
 *   colors: {
 *     primary: "blue",
 *     brand: { light: "#eef", dark: "#335" },
 *   },
 *   spacing: "8px",
 * });
 *
 * const dark = vars(theme, {
 *   colors: {
 *     primary: "white",
 *     brand: { light: "#335", dark: "#eef" },
 *   },
 *   spacing: "8px",
 * });
 *
 * console.log(render(light));
 * // .abc1234 {
 * //   --abc1234-colors-primary: blue;
 * //   --abc1234-colors-brand-light: #eef;
 * //   --abc1234-colors-brand-dark: #335;
 * //   --abc1234-spacing: 8px;
 * // }
 * ```
 *
 * @since 0.0.4
 */
export function vars<T extends Shape>(
  contract: Contract<T>,
  values: VarsValues<T>,
): Style {
  const hash = contract[ContractHash];
  const properties = buildProperties(values, hash);
  return style(`.${hash}`, properties);
}
