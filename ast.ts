/**
 * CSS Abstract Syntax Tree types and utilities.
 *
 * This module provides a complete AST representation for CSS, including
 * selectors, properties, values, and all major at-rules. It also includes
 * utilities for building, transforming, and rendering CSS from the AST.
 *
 * @module
 * @since 0.1.0
 */

import type * as CSS from "npm:csstype";

// CSS Values

/**
 * A CSS value that can be a string, number, variable reference, or fallback.
 *
 * @example
 * ```ts
 * import { type CssValue, cssVar } from "./ast.ts";
 *
 * const value1: CssValue = "red";
 * const value2: CssValue = 16;
 * const value3: CssValue = cssVar("--primary");
 * ```
 *
 * @since 0.1.0
 */
export type CssValue = string | number | CssVariable | CssFallback;

/**
 * A CSS variable reference with optional fallback value.
 *
 * @example
 * ```ts
 * import { type CssVariable } from "./ast.ts";
 *
 * const variable: CssVariable = {
 *   type: "var",
 *   name: "--primary-color",
 *   fallback: "blue",
 * };
 * ```
 *
 * @since 0.1.0
 */
export interface CssVariable {
  type: "var";
  name: string;
  fallback?: CssValue;
}

/**
 * A fallback chain of CSS values.
 *
 * @example
 * ```ts
 * import { fallback, cssVar } from "./ast.ts";
 *
 * const fb = fallback(cssVar("--custom-font"), "sans-serif");
 * ```
 *
 * @since 0.1.0
 */
export interface CssFallback {
  type: "fallback";
  values: readonly CssValue[];
}

/**
 * A CSS property with name, value, and optional !important flag.
 *
 * @example
 * ```ts
 * import { type CssProperty } from "./ast.ts";
 *
 * const property: CssProperty = {
 *   name: "color",
 *   value: "red",
 *   important: true,
 * };
 * ```
 *
 * @since 0.1.0
 */
export interface CssProperty {
  name: string;
  value: CssValue;
  important?: boolean;
}

// Selectors

/**
 * Union type for all selector variants.
 *
 * @since 0.1.0
 */
export type Selector =
  | SimpleSelector
  | CompoundSelector
  | ComplexSelector
  | PseudoSelector;

/**
 * A simple selector (class, id, tag, attribute, or universal).
 *
 * @example
 * ```ts
 * import { cls, id, tag } from "./ast.ts";
 *
 * const classSelector = cls("button");     // .button
 * const idSelector = id("main");           // #main
 * const tagSelector = tag("div");          // div
 * ```
 *
 * @since 0.1.0
 */
export interface SimpleSelector {
  type: "simple";
  value: string;
}

/**
 * A compound selector combining multiple simple selectors without combinators.
 *
 * @example
 * ```ts
 * import { compound, tag, cls } from "./ast.ts";
 *
 * const selector = compound(tag("div"), cls("active"));
 * // Renders as: div.active
 * ```
 *
 * @since 0.1.0
 */
export interface CompoundSelector {
  type: "compound";
  selectors: readonly SimpleSelector[];
}

/**
 * A complex selector with a combinator (descendant, child, adjacent, sibling).
 *
 * @example
 * ```ts
 * import { descendant, child, cls, tag } from "./ast.ts";
 *
 * const desc = descendant(cls("container"), tag("p"));  // .container p
 * const ch = child(cls("nav"), tag("li"));              // .nav > li
 * ```
 *
 * @since 0.1.0
 */
export interface ComplexSelector {
  type: "complex";
  left: Selector;
  combinator: " " | ">" | "+" | "~";
  right: Selector;
}

/**
 * A pseudo-class or pseudo-element selector.
 *
 * @example
 * ```ts
 * import { pseudo, pseudoElement, cls } from "./ast.ts";
 *
 * const hover = pseudo(cls("btn"), "hover");        // .btn:hover
 * const before = pseudoElement(cls("icon"), "before"); // .icon::before
 * ```
 *
 * @since 0.1.0
 */
export interface PseudoSelector {
  type: "pseudo";
  base: Selector;
  pseudo: string;
  isElement: boolean;
}

// Rules (discriminated union)

/**
 * A style rule with selectors and properties.
 *
 * @example
 * ```ts
 * import { styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = styleRule(cls("button"), [
 *   prop("background", "blue"),
 *   prop("color", "white"),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export interface StyleRule {
  type: "style";
  selectors: readonly Selector[];
  properties: readonly CssProperty[];
}

/**
 * A @font-face rule.
 *
 * @example
 * ```ts
 * import { fontFaceRule, prop } from "./ast.ts";
 *
 * const rule = fontFaceRule([
 *   prop("font-family", '"CustomFont"'),
 *   prop("src", 'url("/fonts/custom.woff2")'),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export interface FontFaceRule {
  type: "font-face";
  properties: readonly CssProperty[];
}

/**
 * A single keyframe within a @keyframes rule.
 *
 * @since 0.1.0
 */
export interface KeyframeFrame {
  offset: string;
  properties: readonly CssProperty[];
}

/**
 * A @keyframes animation rule.
 *
 * @example
 * ```ts
 * import { keyframesRule, prop } from "./ast.ts";
 *
 * const rule = keyframesRule("fadeIn", {
 *   "from": [prop("opacity", "0")],
 *   "to": [prop("opacity", "1")],
 * });
 * ```
 *
 * @since 0.1.0
 */
export interface KeyframesRule {
  type: "keyframes";
  name: string;
  frames: readonly KeyframeFrame[];
}

/**
 * A @layer rule containing nested rules.
 *
 * @example
 * ```ts
 * import { layerRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = layerRule("utilities", [
 *   styleRule(cls("hidden"), [prop("display", "none")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export interface LayerRule {
  type: "layer";
  name: string;
  rules: readonly CssRule[];
}

/**
 * A @layer statement declaring layer order.
 *
 * @example
 * ```ts
 * import { layerStatement } from "./ast.ts";
 *
 * const rule = layerStatement("reset", "base", "utilities");
 * // Renders as: @layer reset, base, utilities;
 * ```
 *
 * @since 0.1.0
 */
export interface LayerStatementRule {
  type: "layer-statement";
  names: readonly string[];
}

/**
 * A @media rule with a query and nested rules.
 *
 * @example
 * ```ts
 * import { mediaRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = mediaRule("(min-width: 768px)", [
 *   styleRule(cls("container"), [prop("width", "750px")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export interface MediaRule {
  type: "media";
  query: string;
  rules: readonly CssRule[];
}

/**
 * A @supports rule with a feature query and nested rules.
 *
 * @example
 * ```ts
 * import { supportsRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = supportsRule("(display: grid)", [
 *   styleRule(cls("grid"), [prop("display", "grid")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export interface SupportsRule {
  type: "supports";
  query: string;
  rules: readonly CssRule[];
}

/**
 * A @container rule for container queries.
 *
 * @example
 * ```ts
 * import { containerRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = containerRule("(min-width: 400px)", [
 *   styleRule(cls("card"), [prop("flex-direction", "row")]),
 * ], "sidebar");
 * ```
 *
 * @since 0.1.0
 */
export interface ContainerRule {
  type: "container";
  name: string | undefined;
  query: string;
  rules: readonly CssRule[];
}

/**
 * A @property rule for CSS custom property definitions.
 *
 * @example
 * ```ts
 * import { propertyRule } from "./ast.ts";
 *
 * const rule = propertyRule("--theme-color", "<color>", true, "black");
 * ```
 *
 * @since 0.1.0
 */
export interface PropertyRule {
  type: "property";
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue?: string;
}

/**
 * A complete CSS document containing rules.
 *
 * @since 0.1.0
 */
export interface CssDocument {
  rules: readonly CssRule[];
}

/**
 * Union type of all CSS rule types.
 *
 * @since 0.1.0
 */
export type CssRule =
  | StyleRule
  | FontFaceRule
  | KeyframesRule
  | LayerRule
  | LayerStatementRule
  | MediaRule
  | SupportsRule
  | ContainerRule
  | PropertyRule;

// Style object types (for higher-level composition)

/**
 * Base style properties from csstype.
 *
 * @since 0.1.0
 */
export type StyleProperties = CSS.Properties<string | number>;

/**
 * Extended style object with nesting support for at-rules and selectors.
 *
 * @example
 * ```ts
 * import { type StyleObject } from "./ast.ts";
 *
 * const style: StyleObject = {
 *   color: "blue",
 *   fontSize: 16,
 *   vars: { "--spacing": "8px" },
 *   selectors: { "&:hover": { color: "red" } },
 *   "@media": { "(min-width: 768px)": { fontSize: 18 } },
 * };
 * ```
 *
 * @since 0.1.0
 */
export interface StyleObject extends StyleProperties {
  /** Set CSS variables */
  vars?: Record<string, string | number>;

  /** Nested selectors (must include & to reference element) */
  selectors?: Record<string, StyleProperties>;

  /** At-rules with nested styles */
  "@media"?: Record<string, StyleObject>;
  "@supports"?: Record<string, StyleObject>;
  "@container"?: Record<string, StyleObject>;
  "@layer"?: Record<string, StyleObject>;
}

/**
 * Array form for style composition (later styles win).
 *
 * @since 0.1.0
 */
export type StyleInput = StyleObject | readonly StyleInput[];

/**
 * Output from compiling styles, containing class name and rules.
 *
 * @since 0.1.0
 */
export interface CompiledStyles {
  /** The generated class name */
  className: string;
  /** AST rules to render */
  rules: readonly CssRule[];
}

// Unitless properties

/**
 * Set of CSS properties that do not require units for numeric values.
 *
 * @example
 * ```ts
 * import { UNITLESS_PROPERTIES } from "./ast.ts";
 *
 * UNITLESS_PROPERTIES.has("zIndex");      // true
 * UNITLESS_PROPERTIES.has("fontSize");    // false
 * ```
 *
 * @since 0.1.0
 */
export const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  "animationIterationCount",
  "borderImageSlice",
  "columnCount",
  "columns",
  "fillOpacity",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnStart",
  "gridRow",
  "gridRowEnd",
  "gridRowStart",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "strokeOpacity",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
]);

// Transform utilities

/**
 * Convert a camelCase string to kebab-case.
 *
 * @example
 * ```ts
 * import { camelToKebab } from "./ast.ts";
 *
 * camelToKebab("backgroundColor"); // "background-color"
 * camelToKebab("zIndex");          // "z-index"
 * ```
 *
 * @since 0.1.0
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Add 'px' to numeric values for properties that require units.
 *
 * @example
 * ```ts
 * import { pixelify } from "./ast.ts";
 *
 * pixelify("fontSize", 16);    // "16px"
 * pixelify("zIndex", 10);      // "10"
 * pixelify("opacity", 0.5);    // "0.5"
 * ```
 *
 * @since 0.1.0
 */
export function pixelify(property: string, value: string | number): string {
  if (
    typeof value === "number" &&
    value !== 0 &&
    !UNITLESS_PROPERTIES.has(property)
  ) {
    return `${value}px`;
  }
  return String(value);
}

/**
 * Transform a style object's properties to an array of CssProperty.
 *
 * @example
 * ```ts
 * import { transformProperties } from "./ast.ts";
 *
 * const props = transformProperties({
 *   color: "red",
 *   fontSize: 16,
 * });
 * // [{ name: "color", value: "red" }, { name: "font-size", value: "16px" }]
 * ```
 *
 * @since 0.1.0
 */
export function transformProperties(obj: StyleProperties): CssProperty[] {
  return Object.entries(obj)
    .filter(
      ([key]) => !key.startsWith("@") && key !== "vars" && key !== "selectors",
    )
    .map(([key, value]) => prop(camelToKebab(key), pixelify(key, value!)));
}

// Validation

/**
 * Validate that a selector references the element with &.
 *
 * @example
 * ```ts
 * import { validateSelector } from "./ast.ts";
 *
 * validateSelector("&:hover");      // OK
 * validateSelector(".other:hover"); // throws Error
 * ```
 *
 * @since 0.1.0
 */
export function validateSelector(selector: string): void {
  if (!selector.includes("&")) {
    throw new Error(
      `Invalid selector "${selector}": must reference the element with &`,
    );
  }
}

/**
 * Basic validation for media query syntax.
 *
 * @example
 * ```ts
 * import { validateMediaQuery } from "./ast.ts";
 *
 * validateMediaQuery("(min-width: 768px)"); // OK
 * validateMediaQuery("screen and (color)"); // OK
 * validateMediaQuery("");                   // throws Error
 * ```
 *
 * @since 0.1.0
 */
export function validateMediaQuery(query: string): void {
  if (!query.trim()) {
    throw new Error("Media query cannot be empty");
  }
  // Basic syntax check - must have parentheses or valid keywords
  if (
    !query.includes("(") &&
    !["all", "print", "screen"].some((k) => query.includes(k))
  ) {
    throw new Error(`Invalid media query: ${query}`);
  }
}

// CSS Variable utilities

/**
 * Create a var() reference string.
 *
 * @example
 * ```ts
 * import { cssVarRef } from "./ast.ts";
 *
 * cssVarRef("primary");           // "var(--primary)"
 * cssVarRef("--primary");         // "var(--primary)"
 * cssVarRef("primary", "blue");   // "var(--primary, blue)"
 * ```
 *
 * @since 0.1.0
 */
export function cssVarRef(name: string, fallback?: string): string {
  const varName = name.startsWith("--") ? name : `--${name}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}

/**
 * Normalize a CSS variable name to include -- prefix.
 *
 * @example
 * ```ts
 * import { cssVarName } from "./ast.ts";
 *
 * cssVarName("primary");   // "--primary"
 * cssVarName("--primary"); // "--primary"
 * ```
 *
 * @since 0.1.0
 */
export function cssVarName(name: string): string {
  return name.startsWith("--") ? name : `--${name}`;
}

/**
 * Create variable assignments from a vars object.
 *
 * @example
 * ```ts
 * import { createVarAssignments } from "./ast.ts";
 *
 * const props = createVarAssignments({ primary: "blue", spacing: "8px" });
 * // [{ name: "--primary", value: "blue" }, { name: "--spacing", value: "8px" }]
 * ```
 *
 * @since 0.1.0
 */
export function createVarAssignments(
  vars: Record<string, string | number>,
): CssProperty[] {
  return Object.entries(vars).map(([name, value]) =>
    prop(cssVarName(name), String(value))
  );
}

// Rule builders

/**
 * Create a style rule with selectors and properties.
 *
 * @example
 * ```ts
 * import { styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = styleRule(cls("btn"), [
 *   prop("display", "inline-flex"),
 *   prop("padding", "8px 16px"),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function styleRule(
  selectors: Selector | Selector[],
  properties: CssProperty[],
): StyleRule {
  return {
    type: "style",
    selectors: Array.isArray(selectors) ? selectors : [selectors],
    properties,
  };
}

/**
 * Create a @media rule.
 *
 * @example
 * ```ts
 * import { mediaRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = mediaRule("(prefers-color-scheme: dark)", [
 *   styleRule(cls("theme"), [prop("background", "#000")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function mediaRule(query: string, rules: CssRule[]): MediaRule {
  return {
    type: "media",
    query,
    rules,
  };
}

/**
 * Create a @supports rule.
 *
 * @example
 * ```ts
 * import { supportsRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = supportsRule("(backdrop-filter: blur(10px))", [
 *   styleRule(cls("glass"), [prop("backdrop-filter", "blur(10px)")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function supportsRule(query: string, rules: CssRule[]): SupportsRule {
  return {
    type: "supports",
    query,
    rules,
  };
}

/**
 * Create a @container rule.
 *
 * @example
 * ```ts
 * import { containerRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = containerRule("(min-width: 300px)", [
 *   styleRule(cls("card-body"), [prop("padding", "24px")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function containerRule(
  query: string,
  rules: CssRule[],
  name?: string,
): ContainerRule {
  return {
    type: "container",
    query,
    rules,
    name,
  };
}

/**
 * Create a @keyframes rule.
 *
 * @example
 * ```ts
 * import { keyframesRule, prop } from "./ast.ts";
 *
 * const rule = keyframesRule("spin", {
 *   "from": [prop("transform", "rotate(0deg)")],
 *   "to": [prop("transform", "rotate(360deg)")],
 * });
 * ```
 *
 * @since 0.1.0
 */
export function keyframesRule(
  name: string,
  frames: Record<string, CssProperty[]>,
): KeyframesRule {
  const frameList: KeyframeFrame[] = Object.entries(frames).map(
    ([offset, properties]) => ({
      offset,
      properties,
    }),
  );
  return {
    type: "keyframes",
    name,
    frames: frameList,
  };
}

/**
 * Create a @font-face rule.
 *
 * @example
 * ```ts
 * import { fontFaceRule, prop } from "./ast.ts";
 *
 * const rule = fontFaceRule([
 *   prop("font-family", '"Inter"'),
 *   prop("src", 'url("/fonts/inter.woff2") format("woff2")'),
 *   prop("font-weight", "400 700"),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function fontFaceRule(properties: CssProperty[]): FontFaceRule {
  return {
    type: "font-face",
    properties,
  };
}

/**
 * Create a @layer rule containing nested rules.
 *
 * @example
 * ```ts
 * import { layerRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = layerRule("components", [
 *   styleRule(cls("btn"), [prop("cursor", "pointer")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function layerRule(name: string, rules: CssRule[]): LayerRule {
  return {
    type: "layer",
    name,
    rules,
  };
}

/**
 * Create a @layer statement for declaring layer order.
 *
 * @example
 * ```ts
 * import { layerStatement } from "./ast.ts";
 *
 * const rule = layerStatement("reset", "base", "components", "utilities");
 * // @layer reset, base, components, utilities;
 * ```
 *
 * @since 0.1.0
 */
export function layerStatement(...names: string[]): LayerStatementRule {
  return {
    type: "layer-statement",
    names,
  };
}

/**
 * Create a @property rule for custom property definitions.
 *
 * @example
 * ```ts
 * import { propertyRule } from "./ast.ts";
 *
 * const rule = propertyRule("--gradient-angle", "<angle>", false, "0deg");
 * ```
 *
 * @since 0.1.0
 */
export function propertyRule(
  name: string,
  syntax: string,
  inherits: boolean,
  initialValue?: string,
): PropertyRule {
  return {
    type: "property",
    name,
    syntax,
    inherits,
    ...(initialValue !== undefined && { initialValue }),
  };
}

// Property/value builders

/**
 * Create a CSS property.
 *
 * @example
 * ```ts
 * import { prop } from "./ast.ts";
 *
 * prop("color", "red");              // { name: "color", value: "red" }
 * prop("display", "none", true);     // { name: "display", value: "none", important: true }
 * ```
 *
 * @since 0.1.0
 */
export function prop(
  name: string,
  value: CssValue,
  important?: boolean,
): CssProperty {
  return {
    name,
    value,
    ...(important && { important }),
  };
}

/**
 * Create a CSS variable reference AST node.
 *
 * @example
 * ```ts
 * import { cssVar, renderValue } from "./ast.ts";
 *
 * const v = cssVar("--primary");
 * renderValue(v); // "var(--primary)"
 *
 * const vFallback = cssVar("--primary", "blue");
 * renderValue(vFallback); // "var(--primary, blue)"
 * ```
 *
 * @since 0.1.0
 */
export function cssVar(name: string, fallback?: CssValue): CssVariable {
  return {
    type: "var",
    name,
    ...(fallback !== undefined && { fallback }),
  };
}

/**
 * Create a fallback chain of CSS values.
 *
 * @example
 * ```ts
 * import { fallback, cssVar, renderValue } from "./ast.ts";
 *
 * const fb = fallback(cssVar("--font"), "Arial", "sans-serif");
 * renderValue(fb); // "var(--font), Arial, sans-serif"
 * ```
 *
 * @since 0.1.0
 */
export function fallback(...values: CssValue[]): CssFallback {
  return {
    type: "fallback",
    values,
  };
}

// Selector builders

/**
 * Create a class selector.
 *
 * @example
 * ```ts
 * import { cls, renderSelector } from "./ast.ts";
 *
 * const selector = cls("button");
 * renderSelector(selector); // ".button"
 * ```
 *
 * @since 0.1.0
 */
export function cls(name: string): SimpleSelector {
  return {
    type: "simple",
    value: `.${name}`,
  };
}

/**
 * Create an ID selector.
 *
 * @example
 * ```ts
 * import { id, renderSelector } from "./ast.ts";
 *
 * const selector = id("main");
 * renderSelector(selector); // "#main"
 * ```
 *
 * @since 0.1.0
 */
export function id(name: string): SimpleSelector {
  return {
    type: "simple",
    value: `#${name}`,
  };
}

/**
 * Create an element/tag selector.
 *
 * @example
 * ```ts
 * import { tag, renderSelector } from "./ast.ts";
 *
 * const selector = tag("div");
 * renderSelector(selector); // "div"
 * ```
 *
 * @since 0.1.0
 */
export function tag(name: string): SimpleSelector {
  return {
    type: "simple",
    value: name,
  };
}

/**
 * Create an attribute selector.
 *
 * @example
 * ```ts
 * import { attr, renderSelector } from "./ast.ts";
 *
 * const selector = attr('[type="text"]');
 * renderSelector(selector); // '[type="text"]'
 * ```
 *
 * @since 0.1.0
 */
export function attr(selector: string): SimpleSelector {
  return {
    type: "simple",
    value: selector,
  };
}

/**
 * Create a universal selector (*).
 *
 * @example
 * ```ts
 * import { universal, renderSelector } from "./ast.ts";
 *
 * const selector = universal();
 * renderSelector(selector); // "*"
 * ```
 *
 * @since 0.1.0
 */
export function universal(): SimpleSelector {
  return {
    type: "simple",
    value: "*",
  };
}

/**
 * Create a compound selector from multiple simple selectors.
 *
 * @example
 * ```ts
 * import { compound, tag, cls, renderSelector } from "./ast.ts";
 *
 * const selector = compound(tag("button"), cls("primary"));
 * renderSelector(selector); // "button.primary"
 * ```
 *
 * @since 0.1.0
 */
export function compound(...selectors: SimpleSelector[]): CompoundSelector {
  return {
    type: "compound",
    selectors,
  };
}

/**
 * Create a descendant combinator selector.
 *
 * @example
 * ```ts
 * import { descendant, cls, tag, renderSelector } from "./ast.ts";
 *
 * const selector = descendant(cls("nav"), tag("a"));
 * renderSelector(selector); // ".nav a"
 * ```
 *
 * @since 0.1.0
 */
export function descendant(
  ancestor: Selector,
  desc: Selector,
): ComplexSelector {
  return {
    type: "complex",
    left: ancestor,
    combinator: " ",
    right: desc,
  };
}

/**
 * Create a child combinator selector (>).
 *
 * @example
 * ```ts
 * import { child, cls, tag, renderSelector } from "./ast.ts";
 *
 * const selector = child(cls("list"), tag("li"));
 * renderSelector(selector); // ".list > li"
 * ```
 *
 * @since 0.1.0
 */
export function child(parent: Selector, ch: Selector): ComplexSelector {
  return {
    type: "complex",
    left: parent,
    combinator: ">",
    right: ch,
  };
}

/**
 * Create an adjacent sibling combinator selector (+).
 *
 * @example
 * ```ts
 * import { adjacent, tag, renderSelector } from "./ast.ts";
 *
 * const selector = adjacent(tag("h1"), tag("p"));
 * renderSelector(selector); // "h1 + p"
 * ```
 *
 * @since 0.1.0
 */
export function adjacent(left: Selector, right: Selector): ComplexSelector {
  return {
    type: "complex",
    left,
    combinator: "+",
    right,
  };
}

/**
 * Create a general sibling combinator selector (~).
 *
 * @example
 * ```ts
 * import { sibling, tag, renderSelector } from "./ast.ts";
 *
 * const selector = sibling(tag("h1"), tag("p"));
 * renderSelector(selector); // "h1 ~ p"
 * ```
 *
 * @since 0.1.0
 */
export function sibling(left: Selector, right: Selector): ComplexSelector {
  return {
    type: "complex",
    left,
    combinator: "~",
    right,
  };
}

/**
 * Create a pseudo-class selector.
 *
 * @example
 * ```ts
 * import { pseudo, cls, renderSelector } from "./ast.ts";
 *
 * const selector = pseudo(cls("btn"), "hover");
 * renderSelector(selector); // ".btn:hover"
 *
 * const nth = pseudo(tag("li"), "nth-child(2n)");
 * renderSelector(nth); // "li:nth-child(2n)"
 * ```
 *
 * @since 0.1.0
 */
export function pseudo(base: Selector, p: string): PseudoSelector {
  return {
    type: "pseudo",
    base,
    pseudo: p,
    isElement: false,
  };
}

/**
 * Create a pseudo-element selector.
 *
 * @example
 * ```ts
 * import { pseudoElement, cls, renderSelector } from "./ast.ts";
 *
 * const selector = pseudoElement(cls("quote"), "before");
 * renderSelector(selector); // ".quote::before"
 * ```
 *
 * @since 0.1.0
 */
export function pseudoElement(base: Selector, p: string): PseudoSelector {
  return {
    type: "pseudo",
    base,
    pseudo: p,
    isElement: true,
  };
}

// Style composition

/**
 * Flatten nested arrays of style inputs.
 */
function flattenInputs(input: StyleInput): StyleObject[] {
  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenInputs(item as StyleInput));
  }
  return [input as StyleObject];
}

/**
 * Deep merge style objects (later styles win).
 *
 * @example
 * ```ts
 * import { mergeStyles } from "./ast.ts";
 *
 * const merged = mergeStyles(
 *   { color: "red", padding: 8 },
 *   { color: "blue", margin: 16 },
 * );
 * // { color: "blue", padding: 8, margin: 16 }
 * ```
 *
 * @since 0.1.0
 */
export function mergeStyles(...inputs: StyleInput[]): StyleObject {
  const result: StyleObject = {};
  const flattened = inputs.flatMap((input) => flattenInputs(input));

  for (const input of flattened) {
    // Save nested objects before Object.assign overwrites them
    const prevVars = result.vars;
    const prevSelectors = result.selectors;
    const prevMedia = result["@media"];
    const prevSupports = result["@supports"];
    const prevContainer = result["@container"];
    const prevLayer = result["@layer"];

    Object.assign(result, input);

    // Deep merge nested objects
    if (prevVars || input.vars) {
      result.vars = { ...prevVars, ...input.vars };
    }
    if (prevSelectors || input.selectors) {
      result.selectors = { ...prevSelectors, ...input.selectors };
    }
    if (prevMedia || input["@media"]) {
      result["@media"] = { ...prevMedia, ...input["@media"] };
    }
    if (prevSupports || input["@supports"]) {
      result["@supports"] = { ...prevSupports, ...input["@supports"] };
    }
    if (prevContainer || input["@container"]) {
      result["@container"] = { ...prevContainer, ...input["@container"] };
    }
    if (prevLayer || input["@layer"]) {
      result["@layer"] = { ...prevLayer, ...input["@layer"] };
    }
  }
  return result;
}

/**
 * Compile a style object to CSS rules for a given class name.
 *
 * @example
 * ```ts
 * import { compileStyle, renderRule } from "./ast.ts";
 *
 * const rules = compileStyle("btn", {
 *   color: "white",
 *   backgroundColor: "blue",
 *   selectors: { "&:hover": { backgroundColor: "darkblue" } },
 * });
 *
 * rules.forEach(rule => console.log(renderRule(rule)));
 * ```
 *
 * @since 0.1.0
 */
export function compileStyle(className: string, input: StyleInput): CssRule[] {
  const style: StyleObject = Array.isArray(input)
    ? mergeStyles(...input)
    : input as StyleObject;
  const rules: CssRule[] = [];
  const selector = cls(className);

  // Base properties + vars
  const properties = [
    ...createVarAssignments(style.vars ?? {}),
    ...transformProperties(style as StyleProperties),
  ];
  if (properties.length > 0) {
    rules.push(styleRule(selector, properties));
  }

  // Nested selectors
  if (style.selectors) {
    for (const [sel, props] of Object.entries(style.selectors)) {
      validateSelector(sel);
      const resolvedSelector = sel.replace(/&/g, `.${className}`);
      rules.push(
        styleRule(
          { type: "simple", value: resolvedSelector },
          transformProperties(props),
        ),
      );
    }
  }

  // Media queries
  if (style["@media"]) {
    for (const [query, nested] of Object.entries(style["@media"])) {
      validateMediaQuery(query);
      const nestedRules = compileStyle(className, nested);
      rules.push(mediaRule(query, nestedRules));
    }
  }

  // Supports queries
  if (style["@supports"]) {
    for (const [query, nested] of Object.entries(style["@supports"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(supportsRule(query, nestedRules));
    }
  }

  // Container queries
  if (style["@container"]) {
    for (const [query, nested] of Object.entries(style["@container"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(containerRule(query, nestedRules));
    }
  }

  // Layers
  if (style["@layer"]) {
    for (const [name, nested] of Object.entries(style["@layer"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(layerRule(name, nestedRules));
    }
  }

  return rules;
}

// Rendering

/**
 * Options for rendering CSS.
 *
 * @since 0.1.0
 */
export interface RenderOptions {
  /** Space string (default: "  ") */
  space: string;
  /** Indentation string (default: "  ") */
  indent: string;
  /** Newline string (default: "\n") */
  newline: string;
}

export function resolveOptions(
  { space = " ", indent = "  ", newline = "\n" }: Partial<RenderOptions> = {
    space: " ",
    indent: "  ",
    newline: "\n",
  },
): RenderOptions {
  return { space, indent, newline };
}

/**
 * Render a CSS value to a string.
 *
 * @example
 * ```ts
 * import { renderValue, cssVar } from "./ast.ts";
 *
 * renderValue("red");              // "red"
 * renderValue(16);                 // "16"
 * renderValue(cssVar("--color"));  // "var(--color)"
 * ```
 *
 * @since 0.1.0
 */
export function renderValue(value: CssValue): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value.type === "var") {
    if (value.fallback !== undefined) {
      return `var(${value.name}, ${renderValue(value.fallback)})`;
    }
    return `var(${value.name})`;
  }
  if (value.type === "fallback") {
    return value.values.map(renderValue).join(", ");
  }

  throw new TypeError(`Cannot render value of type ${typeof value}`, value);
}

/**
 * Render a CSS property to a string.
 *
 * @example
 * ```ts
 * import { renderProperty, prop } from "./ast.ts";
 *
 * renderProperty(prop("color", "red"));           // "color: red"
 * renderProperty(prop("display", "none", true));  // "display: none !important"
 * ```
 *
 * @since 0.1.0
 */
export function renderProperty(property: CssProperty): string {
  // Don't convert CSS custom properties (--varName) to kebab-case
  const name = property.name.startsWith("--")
    ? property.name
    : camelToKebab(property.name);
  const value = renderValue(property.value);
  const important = property.important ? " !important" : "";
  return `${name}: ${value}${important}`;
}

/**
 * Render a selector to a string.
 *
 * @example
 * ```ts
 * import { renderSelector, cls, pseudo, descendant, tag } from "./ast.ts";
 *
 * renderSelector(cls("btn"));                      // ".btn"
 * renderSelector(pseudo(cls("btn"), "hover"));     // ".btn:hover"
 * renderSelector(descendant(cls("nav"), tag("a"))); // ".nav a"
 * ```
 *
 * @since 0.1.0
 */
export function renderSelector(selector: Selector): string {
  switch (selector.type) {
    case "simple":
      return selector.value;
    case "compound":
      return selector.selectors.map((s) => s.value).join("");
    case "complex": {
      const left = renderSelector(selector.left);
      const right = renderSelector(selector.right);
      if (selector.combinator === " ") {
        return `${left} ${right}`;
      }
      return `${left} ${selector.combinator} ${right}`;
    }
    case "pseudo": {
      const base = renderSelector(selector.base);
      const sep = selector.isElement ? "::" : ":";
      return `${base}${sep}${selector.pseudo}`;
    }
  }
}

/**
 * Render a CSS rule to a string.
 *
 * @example
 * ```ts
 * import { renderRule, styleRule, cls, prop } from "./ast.ts";
 *
 * const rule = styleRule(cls("btn"), [prop("color", "blue")]);
 * console.log(renderRule(rule));
 * // .btn {
 * //   color: blue;
 * // }
 * ```
 *
 * @since 0.1.0
 */
export function renderRule(
  rule: CssRule,
  options?: Partial<RenderOptions>,
  depth: number = 0,
): string {
  const opts = resolveOptions(options);
  const { space, indent, newline } = opts;
  const baseIndent = indent.repeat(depth);
  const innerIndent = indent.repeat(depth + 1);
  const propSep = `;${newline}`;

  switch (rule.type) {
    case "style": {
      const selectors = rule.selectors.map(renderSelector).join(`,${space}`);
      const props = rule.properties
        .map((p) => `${innerIndent}${renderProperty(p)}`)
        .join(propSep);
      return `${baseIndent}${selectors}${space}{${newline}${props}${propSep}${baseIndent}}`;
    }

    case "font-face": {
      const props = rule.properties
        .map((p) => `${innerIndent}${renderProperty(p)}`)
        .join(propSep);
      return `${baseIndent}@font-face${space}{${newline}${props}${propSep}${baseIndent}}`;
    }

    case "keyframes": {
      const frames = rule.frames
        .map((frame) => {
          const frameIndent = indent.repeat(depth + 1);
          const frameInner = indent.repeat(depth + 2);
          const props = frame.properties
            .map((p) => `${frameInner}${renderProperty(p)}`)
            .join(propSep);
          return `${frameIndent}${frame.offset}${space}{${newline}${props}${propSep}${frameIndent}}`;
        })
        .join(newline);
      return `${baseIndent}@keyframes ${rule.name}${space}{${newline}${frames}${newline}${baseIndent}}`;
    }

    case "layer": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@layer ${rule.name}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "layer-statement": {
      return `${baseIndent}@layer ${rule.names.join(", ")};`;
    }

    case "media": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@media ${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "supports": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@supports ${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "container": {
      const namePrefix = rule.name ? `${rule.name} ` : "";
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@container ${namePrefix}${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "property": {
      const props: string[] = [
        `${innerIndent}syntax: "${rule.syntax}"`,
        `${innerIndent}inherits: ${rule.inherits}`,
      ];
      if (rule.initialValue !== undefined) {
        props.push(`${innerIndent}initial-value: ${rule.initialValue}`);
      }
      return `${baseIndent}@property ${rule.name}${space}{${newline}${
        props.join(propSep)
      }${propSep}${baseIndent}}`;
    }
  }
}

/**
 * Render a complete CSS document to a string.
 *
 * @example
 * ```ts
 * import { renderCss, styleRule, cls, prop } from "./ast.ts";
 *
 * const doc = {
 *   rules: [
 *     styleRule(cls("a"), [prop("color", "red")]),
 *     styleRule(cls("b"), [prop("color", "blue")]),
 *   ],
 * };
 *
 * console.log(renderCss(doc));
 * // .a {
 * //   color: red;
 * // }
 * // .b {
 * //   color: blue;
 * // }
 * ```
 *
 * @since 0.1.0
 */
export function renderCss(
  document: CssDocument,
  options?: Partial<RenderOptions>,
): string {
  const opts = resolveOptions(options);
  return document.rules
    .map((rule) => renderRule(rule, options, 0))
    .join(opts.newline);
}
