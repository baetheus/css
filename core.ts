/**
 * CSS-in-JS core utilities for scoped styles, theming, and composition.
 *
 * This module provides a high-level API for creating scoped CSS styles,
 * CSS variables, keyframe animations, font faces, layers, and recipes
 * (variant-based component styles). All styles are compiled to CSS AST
 * rules that can be rendered to strings.
 *
 * @module
 * @since 0.1.0
 */

import type {
  CssProperty,
  CssRule,
  FontFaceRule,
  KeyframeFrame,
  KeyframesRule,
  LayerRule,
  LayerStatementRule,
  RenderOptions,
  StyleInput,
  StyleObject,
} from "./ast.ts";
import {
  cls,
  compileStyle,
  createVarAssignments,
  mediaRule,
  mergeStyles,
  prop,
  renderCss,
  resolveOptions,
  styleRule,
  transformProperties,
} from "./ast.ts";

// Unexported symbol for type branding
const CSS_REF_BRAND: unique symbol = Symbol("CSSRef");

/**
 * Base class for all CSS references.
 *
 * Provides a unified interface for DOM styling (via toString) and CSS
 * rendering (via getRules). All style-generating functions return a
 * subclass of CSSRef.
 *
 * @example
 * ```ts
 * import { style, render } from "./core.ts";
 *
 * const btn = style({ color: "blue" });
 *
 * // Use in DOM
 * element.className = btn.toString();
 *
 * // Render CSS
 * const css = render([btn]);
 * ```
 *
 * @since 0.1.0
 */
export abstract class CSSRef {
  readonly [CSS_REF_BRAND]: null = null;

  /** Returns the identifier (className, animationName, etc.) for use in DOM attributes */
  abstract toString(): string;

  /** Returns the identifier name */
  abstract getName(): string;

  /** Returns the CSS rules generated for this reference */
  abstract getRules(): readonly CssRule[];

  /** Render CSS for just this reference */
  render(options?: Partial<RenderOptions>): string {
    return renderCss({ rules: [...this.getRules()] }, options);
  }
}

/**
 * Type guard to check if a value is a CSSRef.
 *
 * @example
 * ```ts
 * import { isCSSRef, style } from "./core.ts";
 *
 * const btn = style({ color: "blue" });
 * isCSSRef(btn);        // true
 * isCSSRef("string");   // false
 * ```
 *
 * @since 0.1.0
 */
export function isCSSRef(value: unknown): value is CSSRef {
  return typeof value === "object" && value !== null && CSS_REF_BRAND in value;
}

/**
 * Reference to a scoped style (returns className).
 *
 * @example
 * ```ts
 * import { style } from "./core.ts";
 *
 * const btn = style({ backgroundColor: "blue", color: "white" });
 * element.className = btn.toString(); // e.g., "abc1234"
 * ```
 *
 * @since 0.1.0
 */
export class StyleRef extends CSSRef {
  constructor(
    private readonly className: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.className;
  }
  getName(): string {
    return this.className;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

/**
 * Reference to a global style (returns selector).
 *
 * @example
 * ```ts
 * import { globalStyle } from "./core.ts";
 *
 * const bodyStyle = globalStyle("body", { margin: 0, padding: 0 });
 * bodyStyle.toString(); // "body"
 * ```
 *
 * @since 0.1.0
 */
export class GlobalStyleRef extends CSSRef {
  constructor(
    private readonly selector: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.selector;
  }
  getName(): string {
    return this.selector;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

/**
 * Reference to a keyframes animation (returns animationName).
 *
 * @example
 * ```ts
 * import { keyframes, style } from "./core.ts";
 *
 * const fadeIn = keyframes({
 *   from: { opacity: 0 },
 *   to: { opacity: 1 },
 * });
 *
 * const animated = style({
 *   animation: `${fadeIn} 0.3s ease-in`,
 * });
 * ```
 *
 * @since 0.1.0
 */
export class KeyframesRef extends CSSRef {
  constructor(
    private readonly animationName: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.animationName;
  }
  getName(): string {
    return this.animationName;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

/**
 * Reference to a font face (returns fontFamily).
 *
 * @example
 * ```ts
 * import { fontFace, style } from "./core.ts";
 *
 * const customFont = fontFace({
 *   src: 'url("/fonts/custom.woff2") format("woff2")',
 *   fontFamily: "CustomFont",
 * });
 *
 * const text = style({
 *   fontFamily: customFont.toString(),
 * });
 * ```
 *
 * @since 0.1.0
 */
export class FontFaceRef extends CSSRef {
  constructor(
    private readonly fontFamily: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.fontFamily;
  }
  getName(): string {
    return this.fontFamily;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

/**
 * Reference to a CSS layer (returns layerName).
 *
 * @example
 * ```ts
 * import { layer, style } from "./core.ts";
 *
 * const btn = style({ color: "blue" });
 * const components = layer("components", [btn]);
 * components.toString(); // "components"
 * ```
 *
 * @since 0.1.0
 */
export class LayerRef extends CSSRef {
  constructor(
    private readonly layerName: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.layerName;
  }
  getName(): string {
    return this.layerName;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

/**
 * Reference to a single CSS variable (returns var() reference).
 *
 * @example
 * ```ts
 * import { createVar, style } from "./core.ts";
 *
 * const primaryColor = createVar("primary");
 *
 * const btn = style({
 *   backgroundColor: primaryColor.toString(),
 * });
 * ```
 *
 * @since 0.1.0
 */
export class VarRef extends CSSRef {
  constructor(
    private readonly varName: string, // e.g., "--color-primary"
    private readonly varRef: string, // e.g., "var(--color-primary)"
  ) {
    super();
  }

  toString(): string {
    return this.varRef;
  }
  getName(): string {
    return this.varName;
  }
  getRules(): readonly CssRule[] {
    return []; // Single vars don't have rules
  }
}

/**
 * Reference to a themed set of variables applied to a class (returns className).
 *
 * @example
 * ```ts
 * import { createVars, vars } from "./core.ts";
 *
 * const theme = createVars({ colors: { primary: null, secondary: null } });
 * const lightTheme = vars(theme, {
 *   colors: { primary: "blue", secondary: "gray" },
 * });
 *
 * element.className = lightTheme.toString();
 * ```
 *
 * @since 0.1.0
 */
export class VarsRef extends CSSRef {
  constructor(
    private readonly className: string,
    private readonly rules: readonly CssRule[],
  ) {
    super();
  }

  toString(): string {
    return this.className;
  }
  getName(): string {
    return this.className;
  }
  getRules(): readonly CssRule[] {
    return this.rules;
  }
}

// Recipe variant types

/**
 * Definition of variant options for a recipe.
 *
 * @since 0.1.0
 */
export type VariantDefinitions = Record<string, Record<string, StyleInput>>;

/**
 * Selection of variant options.
 *
 * @since 0.1.0
 */
export type VariantSelection<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

/**
 * Default variant selections for a recipe.
 *
 * @since 0.1.0
 */
export type DefaultVariants<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

/**
 * A compound variant that applies styles when multiple variants match.
 *
 * @since 0.1.0
 */
export interface CompoundVariant<V extends VariantDefinitions> {
  variants: Partial<VariantSelection<V>>;
  style: StyleInput;
}

/**
 * Options for creating a recipe.
 *
 * @since 0.1.0
 */
export interface RecipeOptions<V extends VariantDefinitions> {
  /** Base styles applied to all variants */
  base?: StyleInput;
  /** Variant definitions */
  variants?: V;
  /** Compound variants for multi-variant matching */
  compoundVariants?: CompoundVariant<V>[];
  /** Default variant selections */
  defaultVariants?: DefaultVariants<V>;
}

// Internal types for RecipeRef
type TransformedVariants<V extends VariantDefinitions> = {
  [K in keyof V]: Record<keyof V[K], StyleRef>;
};

interface CompoundVariantMatch<V extends VariantDefinitions> {
  condition: Partial<VariantSelection<V>>;
  style: StyleRef;
}

/**
 * Reference to a recipe with base + variants + compounds.
 *
 * @example
 * ```ts
 * import { recipe } from "./core.ts";
 *
 * const button = recipe({
 *   base: { padding: "8px 16px", borderRadius: 4 },
 *   variants: {
 *     size: {
 *       small: { fontSize: 12 },
 *       large: { fontSize: 18 },
 *     },
 *     variant: {
 *       primary: { backgroundColor: "blue", color: "white" },
 *       secondary: { backgroundColor: "gray", color: "black" },
 *     },
 *   },
 *   defaultVariants: { size: "small", variant: "primary" },
 * });
 *
 * // Use with defaults
 * element.className = button.toString();
 *
 * // Use with specific variants
 * element.className = button.with({ size: "large", variant: "secondary" });
 * ```
 *
 * @since 0.1.0
 */
export class RecipeRef<V extends VariantDefinitions> extends CSSRef {
  private readonly allRules: readonly CssRule[];

  constructor(
    private readonly base: StyleRef | null,
    private readonly variants: TransformedVariants<V>,
    private readonly compounds: CompoundVariantMatch<V>[],
    private readonly defaults: VariantSelection<V>,
  ) {
    super();

    // Compute allRules once
    const rules: CssRule[] = [];
    if (this.base) rules.push(...this.base.getRules());
    for (const variantMap of Object.values(this.variants)) {
      for (
        const styleRef of Object.values(variantMap as Record<string, StyleRef>)
      ) {
        rules.push(...styleRef.getRules());
      }
    }
    for (const { style } of this.compounds) {
      rules.push(...style.getRules());
    }
    this.allRules = rules;
  }

  /** Direct use returns base + defaults */
  toString(): string {
    return this.with();
  }

  getName(): string {
    return this.base?.getName() ?? "";
  }

  getRules(): readonly CssRule[] {
    return this.allRules;
  }

  /**
   * Select variants, returns combined className string.
   *
   * @example
   * ```ts
   * button.with({ size: "large" }); // "base_abc large_def"
   * ```
   */
  with(selection?: VariantSelection<V>): string {
    const classes: string[] = [];
    if (this.base) classes.push(this.base.toString());

    const resolved = { ...this.defaults, ...selection };

    // Add variant classes
    for (const [variantName, optionName] of Object.entries(resolved)) {
      const variantMap = this.variants[variantName as keyof V];
      if (optionName !== undefined && variantMap) {
        const styleRef = variantMap[optionName as keyof V[keyof V]];
        if (styleRef) classes.push(styleRef.toString());
      }
    }

    // Check compound variants
    for (const { condition, style } of this.compounds) {
      const matches = Object.entries(condition).every(
        ([k, v]) => resolved[k as keyof V] === v,
      );
      if (matches) classes.push(style.toString());
    }

    return classes.join(" ");
  }
}

// Hash utilities

/**
 * DJB2 hash - fast, simple, good distribution.
 */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Hash a style object to a stable string.
 *
 * @example
 * ```ts
 * import { hashStyle } from "./core.ts";
 *
 * hashStyle({ color: "red" }); // e.g., "1abc2de"
 * ```
 *
 * @since 0.1.0
 */
export function hashStyle(style: unknown): string {
  const content = JSON.stringify(style);
  const hash = djb2(content);
  return hash.toString(36).padStart(7, "0"); // 7 chars, zero-padded
}

// Configuration

/**
 * Configuration options for class name generation.
 *
 * @since 0.1.0
 */
export interface ClassNameConfig {
  /** Prefix for all generated class names */
  prefix?: string;
  /** Include readable debug name in class names */
  debug?: boolean;
  /** Custom hash function */
  hashFn?: (content: unknown) => string;
}

let config: ClassNameConfig = {};

/**
 * Set the global class name configuration.
 *
 * @example
 * ```ts
 * import { setClassNameConfig, style } from "./core.ts";
 *
 * setClassNameConfig({ prefix: "app_", debug: true });
 *
 * const btn = style({ color: "blue" }, "button");
 * btn.toString(); // "app_button_abc1234"
 * ```
 *
 * @since 0.1.0
 */
export function setClassNameConfig(c: ClassNameConfig): void {
  config = c;
}

/**
 * Get the current class name configuration.
 *
 * @example
 * ```ts
 * import { getClassNameConfig } from "./core.ts";
 *
 * const config = getClassNameConfig();
 * console.log(config.prefix);
 * ```
 *
 * @since 0.1.0
 */
export function getClassNameConfig(): ClassNameConfig {
  return config;
}

/**
 * Generate a class name for a style.
 *
 * @example
 * ```ts
 * import { generateClassName } from "./core.ts";
 *
 * generateClassName({ color: "red" });           // "abc1234"
 * generateClassName({ color: "red" }, "button"); // "button_abc1234" (if debug enabled)
 * ```
 *
 * @since 0.1.0
 */
export function generateClassName(
  style: StyleInput,
  debugName?: string,
): string {
  const hash = (config.hashFn ?? hashStyle)(style);
  const prefix = config.prefix ?? "";

  if (config.debug && debugName) {
    return `${prefix}${debugName}_${hash}`;
  }
  return `${prefix}${hash}`;
}

// Style functions

/**
 * Create a scoped style, returns StyleRef.
 *
 * @example
 * ```ts
 * import { style } from "./core.ts";
 *
 * const button = style({
 *   backgroundColor: "blue",
 *   color: "white",
 *   padding: "8px 16px",
 *   selectors: {
 *     "&:hover": { backgroundColor: "darkblue" },
 *   },
 * });
 *
 * element.className = button.toString();
 * ```
 *
 * @since 0.1.0
 */
export function style(input: StyleInput, debugName?: string): StyleRef {
  const className = generateClassName(input, debugName);
  const rules = compileStyle(className, input);
  return new StyleRef(className, rules);
}

/**
 * Create variants from a record of styles.
 *
 * @example
 * ```ts
 * import { styleVariants } from "./core.ts";
 *
 * const sizes = styleVariants({
 *   small: { fontSize: 12 },
 *   medium: { fontSize: 14 },
 *   large: { fontSize: 18 },
 * });
 *
 * element.className = sizes.medium.toString();
 * ```
 *
 * @since 0.1.0
 */
export function styleVariants<T extends string | number | symbol>(
  variants: Record<T, StyleInput>,
  debugName?: string,
): Record<T, StyleRef> {
  const result = {} as Record<T, StyleRef>;
  for (const [key, input] of Object.entries(variants) as [T, StyleInput][]) {
    result[key] = style(
      input,
      debugName ? `${debugName}_${String(key)}` : undefined,
    );
  }
  return result;
}

// Global style

/**
 * Create a global style targeting a selector, returns GlobalStyleRef.
 *
 * @example
 * ```ts
 * import { globalStyle } from "./core.ts";
 *
 * const reset = globalStyle("*", {
 *   margin: 0,
 *   padding: 0,
 *   boxSizing: "border-box",
 * });
 *
 * const body = globalStyle("body", {
 *   fontFamily: "system-ui, sans-serif",
 *   lineHeight: 1.5,
 * });
 * ```
 *
 * @since 0.1.0
 */
export function globalStyle(
  selector: string,
  input: StyleInput,
): GlobalStyleRef {
  const styleObj: StyleObject = Array.isArray(input)
    ? mergeStyles(...input)
    : (input as StyleObject);

  const rules: CssRule[] = [];

  const properties = [
    ...createVarAssignments(styleObj.vars ?? {}),
    ...transformProperties(styleObj),
  ];

  if (properties.length > 0) {
    const rule = styleRule({ type: "simple", value: selector }, properties);
    rules.push(rule);
  }

  // Handle nested at-rules for global styles
  if (styleObj["@media"]) {
    for (const [query, nested] of Object.entries(styleObj["@media"])) {
      const nestedStyle: StyleObject = Array.isArray(nested)
        ? mergeStyles(...nested)
        : nested;
      const nestedProps = [
        ...createVarAssignments(nestedStyle.vars ?? {}),
        ...transformProperties(nestedStyle),
      ];
      if (nestedProps.length > 0) {
        const nestedRule = styleRule(
          { type: "simple", value: selector },
          nestedProps,
        );
        rules.push(mediaRule(query, [nestedRule]));
      }
    }
  }

  return new GlobalStyleRef(selector, rules);
}

// Variables

/**
 * Create a single CSS variable reference.
 *
 * @example
 * ```ts
 * import { createVar, style, globalStyle } from "./core.ts";
 *
 * const primaryColor = createVar("primary");
 *
 * // Define the variable on :root
 * globalStyle(":root", {
 *   vars: { [primaryColor.getName()]: "blue" },
 * });
 *
 * // Use the variable
 * const btn = style({
 *   backgroundColor: primaryColor.toString(),
 * });
 * ```
 *
 * @since 0.1.0
 */
export function createVar(debugName?: string): VarRef {
  const name = debugName
    ? `--${debugName}-${hashStyle(debugName)}`
    : `--${hashStyle(Math.random().toString())}`;
  return new VarRef(name, `var(${name})`);
}

// Walk an object tree, replacing values with var() references
function walkContract<T extends VarTokens>(
  obj: T,
  path: string[] = [],
): VarsContract<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = [...path, key];
    if (value === null || typeof value === "string") {
      // Leaf node - create var reference
      const varName = `--${currentPath.join("-")}`;
      result[key] = `var(${varName})`;
    } else if (typeof value === "object") {
      // Recurse into nested object
      result[key] = walkContract(value as VarTokens, currentPath);
    }
  }

  return result as VarsContract<T>;
}

type CSSVarFunction = `var(--${string})`;

type Primitive = string | boolean | number | null | undefined;

type MapLeafNodes<Obj, LeafType> = {
  [Prop in keyof Obj]: Obj[Prop] extends Primitive ? LeafType
    // deno-lint-ignore no-explicit-any
    : Obj[Prop] extends Record<string | number, any>
      ? MapLeafNodes<Obj[Prop], LeafType>
    : never;
};

/**
 * Token structure for CSS variables (use null for placeholders).
 *
 * @since 0.1.0
 */
export type VarTokens = {
  [key: string]: string | VarTokens | null;
};

/**
 * A contract mapping token structure to var() references.
 *
 * @since 0.1.0
 */
export type VarsContract<T extends VarTokens> = MapLeafNodes<T, CSSVarFunction>;

/**
 * Values matching a contract structure.
 *
 * @since 0.1.0
 */
export type VarsValues<T extends VarTokens> = MapLeafNodes<T, string>;

/**
 * Create a vars contract (shape with var references, no CSS output).
 *
 * @example
 * ```ts
 * import { createVars } from "./core.ts";
 *
 * const theme = createVars({
 *   colors: {
 *     primary: null,
 *     secondary: null,
 *   },
 *   spacing: {
 *     small: null,
 *     medium: null,
 *   },
 * });
 *
 * theme.colors.primary;  // "var(--colors-primary)"
 * theme.spacing.medium;  // "var(--spacing-medium)"
 * ```
 *
 * @since 0.1.0
 */
export function createVars<T extends VarTokens>(
  contract: T,
): VarsContract<T> {
  return walkContract(contract);
}

// Walk and extract var assignments
function walkValues<T extends VarTokens>(
  contract: VarsContract<T>,
  values: VarsValues<T>,
  path: string[] = [],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (
    const [key, varRef] of Object.entries(
      contract as Record<string, unknown>,
    )
  ) {
    const value = (values as Record<string, unknown>)[key];
    const currentPath = [...path, key];

    if (typeof varRef === "string" && varRef.startsWith("var(")) {
      // Leaf - extract var name and map to value
      const varName = varRef.slice(4, -1); // Remove var( and )
      result[varName] = String(value);
    } else if (typeof varRef === "object" && typeof value === "object") {
      Object.assign(
        result,
        walkValues(
          varRef as VarsContract<T>,
          value as VarsValues<T>,
          currentPath,
        ),
      );
    }
  }

  return result;
}

/**
 * Apply values to a contract, returns VarsRef with className.
 *
 * @example
 * ```ts
 * import { createVars, vars } from "./core.ts";
 *
 * const theme = createVars({
 *   colors: { primary: null, secondary: null },
 * });
 *
 * const lightTheme = vars(theme, {
 *   colors: { primary: "#0066cc", secondary: "#666666" },
 * });
 *
 * const darkTheme = vars(theme, {
 *   colors: { primary: "#66b3ff", secondary: "#cccccc" },
 * });
 *
 * // Apply theme to element
 * document.body.className = lightTheme.toString();
 * ```
 *
 * @since 0.1.0
 */
export function vars<T extends VarTokens>(
  contract: VarsContract<T>,
  values: VarsValues<T>,
  debugName?: string,
): VarsRef {
  const varAssignments = walkValues(contract, values);
  const className = generateClassName(varAssignments, debugName);
  const properties = createVarAssignments(varAssignments);
  const rule = styleRule(cls(className), properties);
  return new VarsRef(className, [rule]);
}

/**
 * For inline runtime theming (returns plain object for style attribute).
 *
 * @example
 * ```ts
 * import { createVars, assignInlineVars } from "./core.ts";
 *
 * const theme = createVars({ colors: { primary: null } });
 *
 * const inlineStyles = assignInlineVars(theme, {
 *   colors: { primary: "purple" },
 * });
 * // { "--colors-primary": "purple" }
 *
 * // Use with React or similar
 * // <div style={inlineStyles}>
 * ```
 *
 * @since 0.1.0
 */
export function assignInlineVars<T extends VarTokens>(
  contract: VarsContract<T>,
  values: VarsValues<T>,
): Record<string, string> {
  return walkValues(contract, values);
}

// Keyframes

/**
 * Create a keyframes animation, returns KeyframesRef.
 *
 * @example
 * ```ts
 * import { keyframes, style } from "./core.ts";
 *
 * const fadeIn = keyframes({
 *   from: { opacity: 0, transform: "translateY(-10px)" },
 *   to: { opacity: 1, transform: "translateY(0)" },
 * });
 *
 * const animated = style({
 *   animation: `${fadeIn} 0.3s ease-out`,
 * });
 * ```
 *
 * @since 0.1.0
 */
export function keyframes(
  frames: Record<string, StyleInput>,
  debugName?: string,
): KeyframesRef {
  const name = debugName
    ? `${debugName}_${hashStyle(frames)}`
    : hashStyle(frames);

  const keyframeFrames: KeyframeFrame[] = Object.entries(frames).map(
    ([offset, input]) => {
      const styleObj: StyleObject = Array.isArray(input)
        ? mergeStyles(...input)
        : (input as StyleObject);
      return {
        offset,
        properties: transformProperties(styleObj),
      };
    },
  );

  const rule: KeyframesRule = {
    type: "keyframes",
    name,
    frames: keyframeFrames,
  };

  return new KeyframesRef(name, [rule]);
}

// Font face

/**
 * Options for creating a font face.
 *
 * @since 0.1.0
 */
export interface FontFaceOptions {
  /** Font source URL(s) */
  src: string | string[];
  /** Font family name */
  fontFamily?: string;
  /** Font weight or weight range */
  fontWeight?: string | number | [number, number];
  /** Font style */
  fontStyle?: string;
  /** Font display strategy */
  fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  /** Font stretch */
  fontStretch?: string;
  /** Unicode range */
  unicodeRange?: string;
}

/**
 * Create a font face declaration, returns FontFaceRef.
 *
 * @example
 * ```ts
 * import { fontFace, style } from "./core.ts";
 *
 * const inter = fontFace({
 *   src: 'url("/fonts/Inter.woff2") format("woff2")',
 *   fontFamily: "Inter",
 *   fontWeight: [400, 700],
 *   fontDisplay: "swap",
 * });
 *
 * const text = style({
 *   fontFamily: `${inter}, system-ui, sans-serif`,
 * });
 * ```
 *
 * @since 0.1.0
 */
export function fontFace(
  options: FontFaceOptions,
  debugName?: string,
): FontFaceRef {
  const family = options.fontFamily ?? debugName ?? hashStyle(options);

  const properties: CssProperty[] = [
    prop("font-family", `"${family}"`),
    prop(
      "src",
      Array.isArray(options.src) ? options.src.join(", ") : options.src,
    ),
  ];

  if (options.fontWeight !== undefined) {
    const weight = Array.isArray(options.fontWeight)
      ? options.fontWeight.join(" ")
      : String(options.fontWeight);
    properties.push(prop("font-weight", weight));
  }
  if (options.fontStyle) {
    properties.push(prop("font-style", options.fontStyle));
  }
  if (options.fontDisplay) {
    properties.push(prop("font-display", options.fontDisplay));
  }
  if (options.fontStretch) {
    properties.push(prop("font-stretch", options.fontStretch));
  }
  if (options.unicodeRange) {
    properties.push(prop("unicode-range", options.unicodeRange));
  }

  const rule: FontFaceRule = {
    type: "font-face",
    properties,
  };

  return new FontFaceRef(family, [rule]);
}

// Layer

/**
 * Create a layer containing the given styles.
 *
 * @example
 * ```ts
 * import { layer, style, layerOrder, render } from "./core.ts";
 *
 * const reset = layer("reset", [
 *   globalStyle("*", { margin: 0, padding: 0 }),
 * ]);
 *
 * const components = layer("components", [
 *   style({ color: "blue" }),
 * ]);
 *
 * // Declare layer order
 * const order = layerOrder([reset, components]);
 * ```
 *
 * @since 0.1.0
 */
export function layer(name: string, refs: CSSRef[]): LayerRef {
  const nestedRules = refs.flatMap((ref) => [...ref.getRules()]);
  const layerRuleObj: LayerRule = {
    type: "layer",
    name,
    rules: nestedRules,
  };
  return new LayerRef(name, [layerRuleObj]);
}

/**
 * Create @layer ordering statement.
 *
 * @example
 * ```ts
 * import { layer, layerOrder, render } from "./core.ts";
 *
 * const reset = layer("reset", []);
 * const base = layer("base", []);
 * const components = layer("components", []);
 *
 * const order = layerOrder([reset, base, components]);
 * // Renders: @layer reset, base, components;
 * ```
 *
 * @since 0.1.0
 */
export function layerOrder(layers: LayerRef[]): LayerStatementRule {
  return {
    type: "layer-statement",
    names: layers.map((l) => l.getName()),
  };
}

// Recipe

/**
 * Create a recipe with base + variants + compounds, returns RecipeRef.
 *
 * Recipes provide a powerful pattern for creating component styles with
 * multiple variants that can be combined.
 *
 * @example
 * ```ts
 * import { recipe } from "./core.ts";
 *
 * const button = recipe({
 *   base: {
 *     display: "inline-flex",
 *     alignItems: "center",
 *     justifyContent: "center",
 *     borderRadius: 4,
 *   },
 *   variants: {
 *     size: {
 *       small: { padding: "4px 8px", fontSize: 12 },
 *       medium: { padding: "8px 16px", fontSize: 14 },
 *       large: { padding: "12px 24px", fontSize: 16 },
 *     },
 *     variant: {
 *       primary: { backgroundColor: "blue", color: "white" },
 *       secondary: { backgroundColor: "gray", color: "black" },
 *       ghost: { backgroundColor: "transparent", color: "blue" },
 *     },
 *   },
 *   compoundVariants: [
 *     {
 *       variants: { size: "large", variant: "primary" },
 *       style: { fontWeight: "bold" },
 *     },
 *   ],
 *   defaultVariants: {
 *     size: "medium",
 *     variant: "primary",
 *   },
 * });
 *
 * // Use with defaults
 * element.className = button.toString();
 *
 * // Use with specific variants
 * element.className = button.with({ size: "large", variant: "ghost" });
 * ```
 *
 * @since 0.1.0
 */
export function recipe<V extends VariantDefinitions>(
  options: RecipeOptions<V>,
  debugName?: string,
): RecipeRef<V> {
  // Base style
  const base = options.base
    ? style(options.base, debugName ? `${debugName}_base` : undefined)
    : null;

  // Transform variants using styleVariants
  const variants = {} as TransformedVariants<V>;
  if (options.variants) {
    for (
      const [variantName, variantOptions] of Object.entries(options.variants)
    ) {
      variants[variantName as keyof V] = styleVariants(
        variantOptions as Record<string, StyleInput>,
        debugName ? `${debugName}_${variantName}` : undefined,
      ) as Record<keyof V[keyof V], StyleRef>;
    }
  }

  // Transform compound variants
  const compounds: CompoundVariantMatch<V>[] = (options.compoundVariants ?? [])
    .map(
      (compound) => ({
        condition: compound.variants,
        style: style(
          compound.style,
          debugName ? `${debugName}_compound` : undefined,
        ),
      }),
    );

  return new RecipeRef(
    base,
    variants,
    compounds,
    (options.defaultVariants ?? {}) as VariantSelection<V>,
  );
}

// Render

/**
 * Render CSS from an array of CSSRefs, deduplicating by object identity.
 *
 * @example
 * ```ts
 * import { style, globalStyle, keyframes, render } from "./core.ts";
 *
 * const fadeIn = keyframes({
 *   from: { opacity: 0 },
 *   to: { opacity: 1 },
 * });
 *
 * const reset = globalStyle("*", { margin: 0 });
 * const btn = style({ color: "blue", animation: `${fadeIn} 0.3s` });
 *
 * const css = render([reset, fadeIn, btn]);
 * console.log(css);
 * ```
 *
 * @since 0.1.0
 */
export function render(
  refs: CSSRef[],
  options?: Partial<RenderOptions>,
): string {
  const _options = resolveOptions(options);

  // Collect rules, deduplicating by object identity
  const rules = new Set<CssRule>();

  for (const ref of refs) {
    for (const rule of ref.getRules()) {
      rules.add(rule);
    }
  }

  return renderCss({ rules: Array.from(rules) }, _options);
}
