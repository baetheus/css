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

// Transform utilities

// Validation

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

// Rendering
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
  rules: readonly CssRule[],
  options?: Partial<RenderOptions>,
): string {
  const opts = resolveOptions(options);
  return rules
    .map((rule) => renderRule(rule, options, 0))
    .join(opts.newline);
}
