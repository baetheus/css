/**
 * @module css
 *
 * A type-safe CSS-in-TypeScript library for generating CSS stylesheets.
 *
 * This module provides utilities for creating CSS styles, variables, selectors,
 * and at-rules with full TypeScript type safety. It supports CSS nesting,
 * custom properties (CSS variables), and all standard CSS at-rules.
 *
 * @example Basic usage
 * ```ts
 * import { style, render, STANDARD_RENDER } from "./css.ts";
 *
 * const button = style({ color: "blue", padding: "8px 16px" });
 * console.log(render([button], STANDARD_RENDER));
 * ```
 *
 * @example CSS Variables
 * ```ts
 * import { vars, style } from "./css.ts";
 *
 * const theme = vars({ colors: { primary: "blue", secondary: "green" } });
 * const card = style({ ...theme.toProperties(), color: theme.colors.primary.toValue() });
 * ```
 *
 * @example Media queries
 * ```ts
 * import { style, media, render } from "./css.ts";
 *
 * const responsive = style({ fontSize: "16px" });
 * const query = media("(min-width: 768px)", responsive);
 * console.log(render([query]));
 * ```
 *
 * @since 0.0.2
 */

import type * as CSS from "csstype";
import type { Intersect } from "@baetheus/fun/kind";
import * as R from "@baetheus/fun/record";
import { pipe } from "@baetheus/fun/fn";

// =============================================================================
// Render Options
// =============================================================================

export type RenderOptions = {
  readonly space: string;
  readonly indent: string;
  readonly newline: string;
};

/**
 * Standard render options with spaces, indentation, and newlines for human-readable CSS output.
 *
 * @example
 * ```ts
 * import { style, render, STANDARD_RENDER } from "./css.ts";
 *
 * const s = style({ color: "red" });
 * console.log(render([s], STANDARD_RENDER));
 * // Output:
 * // .abc123 {
 * //   color: red;
 * // }
 * ```
 *
 * @since 0.0.2
 */
export const STANDARD_RENDER: RenderOptions = {
  space: " ",
  indent: "  ",
  newline: "\n",
};

/**
 * Minimal render options with no spaces, indentation, or newlines for minified CSS output.
 *
 * @example
 * ```ts
 * import { style, render, MINIMAL_RENDER } from "./css.ts";
 *
 * const s = style({ color: "red" });
 * console.log(render([s], MINIMAL_RENDER));
 * // Output: .abc123{color:red;}
 * ```
 *
 * @since 0.0.2
 */
export const MINIMAL_RENDER: RenderOptions = {
  space: "",
  indent: "",
  newline: "",
};

// =============================================================================
// Properties and Variables
// =============================================================================

type VariableKey = `--${string}`;

type VariableValue = `var(${VariableKey}${string})`;

type Variables = { readonly [K in VariableKey]: string };

export type Properties =
  | CSS.Properties
  | Variables;

export type CssValue = string | number;

// =============================================================================
// CssVars
// =============================================================================

export type CssVarsInput = Record<
  Exclude<string, "toProperties" | "toGroups">,
  Record<string, CssValue>
>;

type CssVarsGroups<T extends CssVarsInput> = {
  readonly [G in keyof T]: {
    readonly [K in keyof T[G]]: VariableValue;
  };
};

type CssVarsProperties<T extends CssVarsInput> = Intersect<
  {
    [K in keyof T & string]: {
      [IK in keyof T[K] & string as `--${string}-${K}-${IK}`]: T[K][IK];
    };
  }[keyof T & string]
>;

const CssVarsBrand: unique symbol = Symbol("@baetheus/css/core/cssvars");

export type CssVars<T extends CssVarsInput = CssVarsInput> = {
  readonly [CssVarsBrand]: null;
  readonly hash: string;
  toProperties(): CssVarsProperties<T>;
  toGroups(): CssVarsGroups<T>;
} & CssVarsGroups<T>;

/**
 * Creates a collection of CSS variables organized by groups.
 *
 * Each group contains named variables that can be accessed directly or converted
 * to CSS properties for rendering.
 *
 * @param input - An object mapping group names to variable definitions
 * @returns A CssVars object with grouped variables and conversion methods
 *
 * @example
 * ```ts
 * import { vars, style } from "./css.ts";
 *
 * const theme = vars({
 *   colors: { primary: "blue", secondary: "green" },
 *   spacing: { small: "8px", large: "24px" },
 * });
 *
 * // Access variables
 * console.log(theme.colors.primary.toValue()); // "var(--hash-colors-primary)"
 *
 * // Convert to CSS properties
 * const root = style(theme.toProperties());
 * ```
 *
 * @since 0.0.2
 */
export function vars<T extends CssVarsInput = CssVarsInput>(
  input: T,
  refHash?: string,
): CssVars<T> {
  const hash = refHash ?? hashObject(input);
  const groups = pipe(
    input,
    R.map((outer, a) =>
      pipe(
        outer,
        R.map((_, b) => `var(--${hash}-${a}-${b})`),
      )
    ),
  ) as CssVarsGroups<T>;

  const properties = pipe(
    input,
    R.flatmap((groups, a) =>
      pipe(
        groups,
        R.flatmap((value, b) => ({ [`--${hash}-${a}-${b}`]: value })),
      )
    ),
  ) as CssVarsProperties<T>;

  const base = {
    [CssVarsBrand]: null,
    hash,
    toProperties() {
      return properties;
    },
    toGroups() {
      return groups;
    },
  };

  return Object.assign(base, groups);
}

export type FromVarsInput<T extends CssVarsInput> =
  & Partial<{ [G in keyof T]: Partial<T[G]> }>
  & CssVarsInput;

/**
 * Creates a new CssVars collection based on an existing one, allowing partial overrides.
 *
 * This is useful for creating theme variants that override specific values
 * while maintaining type safety.
 *
 * @param _ref - The reference CssVars to base the new collection on (used for type inference)
 * @param input - The new variable values (can be partial)
 * @returns A new CssVars object with the specified values
 *
 * @example
 * ```ts
 * import { vars, fromVars } from "./css.ts";
 *
 * const lightTheme = vars({
 *   colors: { bg: "white", text: "black" },
 * });
 *
 * const darkTheme = fromVars(lightTheme, {
 *   colors: { bg: "black", text: "white" },
 * });
 * ```
 *
 * @since 0.0.2
 */
export function fromVars<T extends CssVarsInput, U extends FromVarsInput<T>>(
  _ref: CssVars<T>,
  input: U,
): CssVars<U> {
  return vars(input, _ref.hash);
}

// =============================================================================
// Selectors
// =============================================================================

// deno-fmt-ignore
type HtmlElement =
  // Document metadata
  | "html" | "head" | "title" | "base" | "link" | "meta" | "style"
  // Sectioning
  | "body" | "article" | "section" | "nav" | "aside" | "h1" | "h2" | "h3"
  | "h4" | "h5" | "h6" | "hgroup" | "header" | "footer" | "address" | "main"
  // Grouping
  | "p" | "hr" | "pre" | "blockquote" | "ol" | "ul" | "menu" | "li" | "dl"
  | "dt" | "dd" | "figure" | "figcaption" | "div"
  // Text-level
  | "a" | "em" | "strong" | "small" | "s" | "cite" | "q" | "dfn" | "abbr"
  | "ruby" | "rt" | "rp" | "data" | "time" | "code" | "var" | "samp" | "kbd"
  | "sub" | "sup" | "i" | "b" | "u" | "mark" | "bdi" | "bdo" | "span" | "br"
  | "wbr"
  // Edits
  | "ins" | "del"
  // Embedded
  | "picture" | "source" | "img" | "iframe" | "embed" | "object" | "param"
  | "video" | "audio" | "track" | "map" | "area" | "canvas"
  // Tabular
  | "table" | "caption" | "colgroup" | "col" | "tbody" | "thead" | "tfoot"
  | "tr" | "td" | "th"
  // Forms
  | "form" | "label" | "input" | "button" | "select" | "datalist"
  | "optgroup" | "option" | "textarea" | "output" | "progress" | "meter"
  | "fieldset" | "legend"
  // Interactive
  | "details" | "summary" | "dialog"
  // Scripting
  | "script" | "noscript" | "template" | "slot"
  // SVG
  | "svg" | "g" | "path" | "circle" | "ellipse" | "line" | "polyline"
  | "polygon" | "rect" | "text" | "tspan" | "textPath" | "image" | "use"
  | "defs" | "symbol" | "clipPath" | "mask" | "pattern" | "marker"
  | "linearGradient" | "radialGradient" | "stop" | "filter" | "feBlend"
  | "feColorMatrix" | "feGaussianBlur" | "foreignObject"
  // MathML
  | "math" | "mi" | "mn" | "mo" | "ms" | "mtext" | "mrow" | "mfrac"
  | "msqrt" | "mroot" | "msub" | "msup" | "msubsup" | "munder" | "mover"
  | "munderover" | "mtable" | "mtr" | "mtd";

/**
 * Simple pseudo-class selectors that take no arguments.
 *
 * @since 0.4.0
 */
// deno-fmt-ignore
type PseudoClassValue =
  // User action
  | ":active" | ":hover" | ":focus" | ":focus-visible" | ":focus-within"
  // Link
  | ":link" | ":visited" | ":any-link" | ":local-link" | ":target"
  | ":target-within"
  // Input state
  | ":enabled" | ":disabled" | ":read-only" | ":read-write"
  | ":placeholder-shown" | ":autofill" | ":default" | ":checked"
  | ":indeterminate"
  // Validation
  | ":valid" | ":invalid" | ":in-range" | ":out-of-range" | ":required"
  | ":optional" | ":user-valid" | ":user-invalid"
  // Tree-structural
  | ":root" | ":empty" | ":first-child" | ":last-child" | ":only-child"
  | ":first-of-type" | ":last-of-type" | ":only-of-type"
  // Resource state
  | ":playing" | ":paused" | ":seeking" | ":buffering" | ":stalled"
  | ":muted" | ":volume-locked"
  // Time-dimensional
  | ":current" | ":past" | ":future"
  // Display state
  | ":fullscreen" | ":modal" | ":picture-in-picture" | ":open"
  | ":closed" | ":popover-open"
  // Printing
  | ":first" | ":left" | ":right" | ":blank"
  // Misc
  | ":defined" | ":scope";

/**
 * Parameterized pseudo-class selectors using template literals.
 *
 * @since 0.4.0
 */
type FunctionClassValue =
  | `:nth-child(${string})`
  | `:nth-last-child(${string})`
  | `:nth-of-type(${string})`
  | `:nth-last-of-type(${string})`
  | `:is(${string})`
  | `:where(${string})`
  | `:not(${string})`
  | `:has(${string})`
  | `:lang(${string})`
  | `:dir(${string})`
  | `:host(${string})`
  | `:host-context(${string})`
  | `:state(${string})`;

/**
 * Pseudo-element selectors.
 *
 * @since 0.4.0
 */
type PseudoElementValue =
  | "::before"
  | "::after"
  | "::first-line"
  | "::first-letter"
  | "::marker"
  | "::placeholder"
  | "::selection"
  | "::backdrop"
  | "::cue"
  | "::cue-region"
  | "::file-selector-button"
  | "::target-text"
  | "::spelling-error"
  | "::grammar-error"
  | "::highlight"
  | "::view-transition"
  | "::view-transition-group"
  | "::view-transition-image-pair"
  | "::view-transition-old"
  | "::view-transition-new";

/**
 * Class selector (e.g., `.button`).
 *
 * @since 0.4.0
 */
type ClassSelector = `.${string}`;

/**
 * ID selector (e.g., `#main`).
 *
 * @since 0.4.0
 */
type IdSelector = `#${string}`;

/**
 * Universal selector.
 *
 * @since 0.4.0
 */
type UniversalSelector = "*";

/**
 * Parent/nesting selector.
 *
 * @since 0.4.0
 */
type ParentSelector = "&";

type HtmlAttributes = CSS.HtmlAttributes extends `[${infer Attr}]` ? Attr
  : never;

/**
 * Attribute selector with optional operator and value.
 *
 * @since 0.4.0
 */
type AttributeSelector =
  | `[${HtmlAttributes}]`
  | `[${HtmlAttributes}="${string}"]`
  | `[${HtmlAttributes}^="${string}"]`
  | `[${HtmlAttributes}$="${string}"]`
  | `[${HtmlAttributes}*="${string}"]`
  | `[${HtmlAttributes}~="${string}"]`
  | `[${HtmlAttributes}|="${string}"]`;

/**
 * CSS selector combinators.
 *
 * @since 0.4.0
 */
type SelectorCombinator = " " | ">" | "+" | "~";

/**
 * All possible values in a selector's values array.
 *
 * @since 0.4.0
 */
type SelectorValue =
  | HtmlElement
  | ClassSelector
  | IdSelector
  | UniversalSelector
  | ParentSelector
  | AttributeSelector
  | PseudoClassValue
  | FunctionClassValue
  | PseudoElementValue
  | Selector;

type SelectorValues = readonly [SelectorValue, ...SelectorValue[]];

export type CompoundSelector = {
  readonly type: "CompoundSelector";
  readonly values: SelectorValues;
};

/**
 * Creates a compound selector from one or more selector values.
 *
 * Compound selectors combine multiple simple selectors without a combinator,
 * e.g., `div.class#id` or `.btn:hover`.
 *
 * @param values - The selector values to combine
 * @returns A CompoundSelector object
 *
 * @example
 * ```ts
 * import { compoundSelector, renderSelector } from "./css.ts";
 *
 * const sel = compoundSelector(".button", ":hover");
 * console.log(renderSelector(sel)); // ".button:hover"
 *
 * const nested = compoundSelector("&", ".active");
 * console.log(renderSelector(nested)); // "&.active"
 * ```
 *
 * @since 0.0.2
 */
export function compoundSelector(...values: SelectorValues): CompoundSelector {
  return { type: "CompoundSelector", values };
}

export type ComplexSelector = {
  readonly type: "ComplexSelector";
  readonly combinator: SelectorCombinator;
  readonly values: SelectorValues;
};

/**
 * Creates a complex selector with a combinator between selector values.
 *
 * Complex selectors use combinators like descendant (` `), child (`>`),
 * adjacent sibling (`+`), or general sibling (`~`).
 *
 * @param combinator - The CSS combinator to use
 * @param values - The selector values to combine
 * @returns A ComplexSelector object
 *
 * @example
 * ```ts
 * import { complexSelector, renderSelector } from "./css.ts";
 *
 * const descendant = complexSelector(" ", ".parent", ".child");
 * console.log(renderSelector(descendant)); // ".parent .child"
 *
 * const child = complexSelector(">", "ul", "li");
 * console.log(renderSelector(child)); // "ul>li"
 * ```
 *
 * @since 0.0.2
 */
export function complexSelector(
  combinator: SelectorCombinator,
  ...values: SelectorValues
): ComplexSelector {
  return { type: "ComplexSelector", combinator, values };
}

export type Selector = CompoundSelector | ComplexSelector;

function renderSelectorValue(value: SelectorValue): string {
  if (typeof value === "object" && value !== null && "type" in value) {
    return renderSelector(value);
  }
  return value;
}

/**
 * Renders a Selector to its CSS string representation.
 *
 * @param selector - The selector to render
 * @returns The CSS selector string
 *
 * @example
 * ```ts
 * import { compoundSelector, complexSelector, renderSelector } from "./css.ts";
 *
 * const compound = compoundSelector(".btn", ":active");
 * console.log(renderSelector(compound)); // ".btn:active"
 *
 * const complex = complexSelector(">", ".nav", "a");
 * console.log(renderSelector(complex)); // ".nav>a"
 * ```
 *
 * @since 0.0.2
 */
export function renderSelector(selector: Selector): string {
  if (selector.type === "CompoundSelector") {
    return selector.values.map(renderSelectorValue).join("");
  }
  return selector.values.map(renderSelectorValue).join(selector.combinator);
}

// =============================================================================
// Render Helper Functions
// =============================================================================

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/**
 * Renders a single CSS property to its string representation.
 *
 * Converts camelCase property names to kebab-case, but preserves
 * CSS custom properties (those starting with `--`).
 *
 * @param key - The property name (camelCase or kebab-case)
 * @param value - The property value
 * @param options - Render options for formatting
 * @returns The formatted CSS property string
 *
 * @example
 * ```ts
 * import { renderProperty, STANDARD_RENDER } from "./css.ts";
 *
 * console.log(renderProperty("backgroundColor", "red"));
 * // "background-color: red;"
 *
 * console.log(renderProperty("--custom", "blue"));
 * // "--custom: blue;"
 * ```
 *
 * @since 0.0.2
 */
export function renderProperty(
  key: string,
  value: CssValue,
  options: RenderOptions = STANDARD_RENDER,
): string {
  const prop = key.startsWith("--") ? key : camelToKebab(key);
  return `${prop}:${options.space}${value};`;
}

/**
 * Renders a collection of CSS properties to a string.
 *
 * @param properties - The CSS properties object
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted CSS properties string, or empty string if no properties
 *
 * @example
 * ```ts
 * import { renderProperties, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderProperties(
 *   { color: "red", fontSize: "16px" },
 *   STANDARD_RENDER,
 *   1
 * );
 * // "  color: red;\n  font-size: 16px;"
 * ```
 *
 * @since 0.0.2
 */
export function renderProperties(
  properties: Properties,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries = Object.entries(properties);
  if (entries.length === 0) return "";
  return entries
    .map(([key, value]) => `${indent}${renderProperty(key, value, options)}`)
    .join(options.newline);
}

/**
 * Renders a CSS block with a prelude (selector or at-rule) and body.
 *
 * @param prelude - The block prelude (selector or at-rule text)
 * @param body - The block body content
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted CSS block string
 *
 * @example
 * ```ts
 * import { renderBlock, STANDARD_RENDER } from "./css.ts";
 *
 * const block = renderBlock(".button", "color: red;", STANDARD_RENDER);
 * // ".button {\ncolor: red;\n}"
 *
 * const empty = renderBlock(".empty", "", STANDARD_RENDER);
 * // ".empty {}"
 * ```
 *
 * @since 0.0.2
 */
export function renderBlock(
  prelude: string,
  body: string,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const open = `${indent}${prelude}${options.space}{`;
  const close = `${indent}}`;
  if (body === "") {
    return `${open}${close}`;
  }
  return `${open}${options.newline}${body}${options.newline}${close}`;
}

/**
 * Renders keyframe properties for a @keyframes at-rule.
 *
 * @param properties - Array of keyframe definitions with offset and properties
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted keyframes body string
 *
 * @example
 * ```ts
 * import { renderKeyframes, STANDARD_RENDER } from "./css.ts";
 *
 * const frames = [
 *   { offset: "from", properties: { opacity: "0" } },
 *   { offset: "to", properties: { opacity: "1" } },
 * ];
 * console.log(renderKeyframes(frames, STANDARD_RENDER));
 * // "from {\n  opacity: 0;\n}\nto {\n  opacity: 1;\n}"
 * ```
 *
 * @since 0.0.2
 */
export function renderKeyframes(
  properties: KeyframeProperties,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  return properties
    .map((frame) => {
      const body = renderProperties(
        frame.properties as Properties,
        options,
        depth + 1,
      );
      return renderBlock(frame.offset, body, options, depth);
    })
    .join(options.newline);
}

/**
 * Renders font-face descriptor properties for a @font-face at-rule.
 *
 * @param properties - The font-face descriptor properties
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted font-face body string
 *
 * @example
 * ```ts
 * import { renderFontFace, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderFontFace({
 *   fontFamily: "MyFont",
 *   src: "url('font.woff2')",
 *   fontWeight: "400",
 * }, STANDARD_RENDER, 1);
 * ```
 *
 * @since 0.0.2
 */
export function renderFontFace(
  properties: FontFaceProperties,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries: string[] = [];
  if (properties.fontFamily !== undefined) {
    entries.push(
      `${indent}font-family:${options.space}${properties.fontFamily};`,
    );
  }
  if (properties.src !== undefined) {
    entries.push(`${indent}src:${options.space}${properties.src};`);
  }
  if (properties.fontStyle !== undefined) {
    entries.push(
      `${indent}font-style:${options.space}${properties.fontStyle};`,
    );
  }
  if (properties.fontWeight !== undefined) {
    entries.push(
      `${indent}font-weight:${options.space}${properties.fontWeight};`,
    );
  }
  if (properties.fontStretch !== undefined) {
    entries.push(
      `${indent}font-stretch:${options.space}${properties.fontStretch};`,
    );
  }
  if (properties.fontDisplay !== undefined) {
    entries.push(
      `${indent}font-display:${options.space}${properties.fontDisplay};`,
    );
  }
  if (properties.unicodeRange !== undefined) {
    entries.push(
      `${indent}unicode-range:${options.space}${properties.unicodeRange};`,
    );
  }
  if (properties.fontVariant !== undefined) {
    entries.push(
      `${indent}font-variant:${options.space}${properties.fontVariant};`,
    );
  }
  if (properties.fontFeatureSettings !== undefined) {
    entries.push(
      `${indent}font-feature-settings:${options.space}${properties.fontFeatureSettings};`,
    );
  }
  if (properties.fontVariationSettings !== undefined) {
    entries.push(
      `${indent}font-variation-settings:${options.space}${properties.fontVariationSettings};`,
    );
  }
  if (properties.ascentOverride !== undefined) {
    entries.push(
      `${indent}ascent-override:${options.space}${properties.ascentOverride};`,
    );
  }
  if (properties.descentOverride !== undefined) {
    entries.push(
      `${indent}descent-override:${options.space}${properties.descentOverride};`,
    );
  }
  if (properties.lineGapOverride !== undefined) {
    entries.push(
      `${indent}line-gap-override:${options.space}${properties.lineGapOverride};`,
    );
  }
  if (properties.sizeAdjust !== undefined) {
    entries.push(
      `${indent}size-adjust:${options.space}${properties.sizeAdjust};`,
    );
  }
  return entries.join(options.newline);
}

/**
 * Renders property descriptors for a @property at-rule.
 *
 * @param descriptors - The property descriptors (syntax, inherits, initialValue)
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted @property body string
 *
 * @example
 * ```ts
 * import { renderPropertyDescriptors, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderPropertyDescriptors({
 *   syntax: "<color>",
 *   inherits: false,
 *   initialValue: "red",
 * }, STANDARD_RENDER, 1);
 * ```
 *
 * @since 0.0.2
 */
export function renderPropertyDescriptors(
  descriptors: PropertyDescriptors,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries: string[] = [];
  entries.push(`${indent}syntax:${options.space}"${descriptors.syntax}";`);
  entries.push(`${indent}inherits:${options.space}${descriptors.inherits};`);
  if (descriptors.initialValue !== undefined) {
    entries.push(
      `${indent}initial-value:${options.space}${descriptors.initialValue};`,
    );
  }
  return entries.join(options.newline);
}

/**
 * Renders counter style descriptors for a @counter-style at-rule.
 *
 * @param descriptors - The counter style descriptors
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted @counter-style body string
 *
 * @example
 * ```ts
 * import { renderCounterStyle, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderCounterStyle({
 *   system: "cyclic",
 *   symbols: "'*' '†' '‡'",
 *   suffix: " ",
 * }, STANDARD_RENDER, 1);
 * ```
 *
 * @since 0.0.2
 */
export function renderCounterStyle(
  descriptors: CounterStyleDescriptors,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries: string[] = [];
  if (descriptors.system !== undefined) {
    entries.push(`${indent}system:${options.space}${descriptors.system};`);
  }
  if (descriptors.symbols !== undefined) {
    entries.push(`${indent}symbols:${options.space}${descriptors.symbols};`);
  }
  if (descriptors.additiveSymbols !== undefined) {
    entries.push(
      `${indent}additive-symbols:${options.space}${descriptors.additiveSymbols};`,
    );
  }
  if (descriptors.negative !== undefined) {
    entries.push(`${indent}negative:${options.space}${descriptors.negative};`);
  }
  if (descriptors.prefix !== undefined) {
    entries.push(`${indent}prefix:${options.space}${descriptors.prefix};`);
  }
  if (descriptors.suffix !== undefined) {
    entries.push(`${indent}suffix:${options.space}${descriptors.suffix};`);
  }
  if (descriptors.range !== undefined) {
    entries.push(`${indent}range:${options.space}${descriptors.range};`);
  }
  if (descriptors.pad !== undefined) {
    entries.push(`${indent}pad:${options.space}${descriptors.pad};`);
  }
  if (descriptors.fallback !== undefined) {
    entries.push(`${indent}fallback:${options.space}${descriptors.fallback};`);
  }
  if (descriptors.speakAs !== undefined) {
    entries.push(`${indent}speak-as:${options.space}${descriptors.speakAs};`);
  }
  return entries.join(options.newline);
}

/**
 * Renders font feature values descriptors for a @font-feature-values at-rule.
 *
 * @param descriptors - The font feature values descriptors
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted @font-feature-values body string
 *
 * @example
 * ```ts
 * import { renderFontFeatureValues, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderFontFeatureValues({
 *   stylistic: { fancy: [1] },
 *   swash: { flowing: [2] },
 * }, STANDARD_RENDER);
 * ```
 *
 * @since 0.0.2
 */
export function renderFontFeatureValues(
  descriptors: FontFeatureValuesDescriptors,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const blocks: string[] = [];
  for (const [type, values] of Object.entries(descriptors)) {
    if (values) {
      const indent = options.indent.repeat(depth + 1);
      const innerEntries = Object.entries(values)
        .map(([name, nums]) =>
          `${indent}${name}:${options.space}${(nums as number[]).join(" ")};`
        );
      blocks.push(
        renderBlock(
          `@${type}`,
          innerEntries.join(options.newline),
          options,
          depth,
        ),
      );
    }
  }
  return blocks.join(options.newline);
}

/**
 * Renders font palette descriptors for a @font-palette-values at-rule.
 *
 * @param descriptors - The font palette descriptors
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted @font-palette-values body string
 *
 * @example
 * ```ts
 * import { renderFontPalette, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderFontPalette({
 *   basePalette: 0,
 *   overrideColors: { 0: "red", 1: "blue" },
 * }, STANDARD_RENDER, 1);
 * ```
 *
 * @since 0.0.2
 */
export function renderFontPalette(
  descriptors: FontPaletteDescriptors,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries: string[] = [];
  if (descriptors.basePalette !== undefined) {
    entries.push(
      `${indent}base-palette:${options.space}${descriptors.basePalette};`,
    );
  }
  if (descriptors.overrideColors !== undefined) {
    const colors = Object.entries(descriptors.overrideColors)
      .map(([idx, color]) => `${idx} ${color}`)
      .join(", ");
    entries.push(`${indent}override-colors:${options.space}${colors};`);
  }
  return entries.join(options.newline);
}

/**
 * Renders color profile descriptors for a @color-profile at-rule.
 *
 * @param descriptors - The color profile descriptors
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted @color-profile body string
 *
 * @example
 * ```ts
 * import { renderColorProfile, STANDARD_RENDER } from "./css.ts";
 *
 * const css = renderColorProfile({
 *   src: "url('profile.icc')",
 *   renderingIntent: "relative-colorimetric",
 * }, STANDARD_RENDER, 1);
 * ```
 *
 * @since 0.0.2
 */
export function renderColorProfile(
  descriptors: ColorProfileDescriptors,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const entries: string[] = [];
  entries.push(`${indent}src:${options.space}${descriptors.src};`);
  if (descriptors.renderingIntent !== undefined) {
    entries.push(
      `${indent}rendering-intent:${options.space}${descriptors.renderingIntent};`,
    );
  }
  if (descriptors.components !== undefined) {
    entries.push(
      `${indent}components:${options.space}${descriptors.components};`,
    );
  }
  return entries.join(options.newline);
}

function getSelectorKindFromString(value: string): SelectorKind {
  if (value === "*") return "universal";
  if (value === "&") return "parent";
  if (value.startsWith(".")) return "class";
  if (value.startsWith("#")) return "id";
  if (value.startsWith("[")) return "attribute";
  if (value.startsWith("::")) return "pseudo-element";
  if (value.startsWith(":") && value.includes("(")) return "function-class";
  if (value.startsWith(":")) return "pseudo-class";
  return "html";
}

function getSelectorKind(selector: Selector): SelectorKind {
  const first = selector.values[0];
  if (typeof first === "object" && first !== null && "type" in first) {
    return getSelectorKind(first);
  }
  return getSelectorKindFromString(first);
}

function isNestableSelector(selector: Selector): boolean {
  switch (getSelectorKind(selector)) {
    case "html":
    case "universal":
    case "parent":
      return false;
    default:
      return true;
  }
}

/**
 * String representations of all selector types.
 *
 * @since 0.4.0
 */
type SelectorKind =
  | "html"
  | "class"
  | "id"
  | "universal"
  | "parent"
  | "attribute"
  | "pseudo-class"
  | "function-class"
  | "pseudo-element";

// =============================================================================
// AtRule Types
// =============================================================================

/**
 * Union of all at-rule tags.
 *
 * @since 0.4.0
 */
export type AtRuleTag =
  | "@media"
  | "@supports"
  | "@container"
  | "@layer"
  | "@keyframes"
  | "@font-face"
  | "@import"
  | "@charset"
  | "@namespace"
  | "@page"
  | "@property"
  | "@scope"
  | "@starting-style"
  | "@counter-style"
  | "@font-feature-values"
  | "@font-palette-values"
  | "@color-profile";

/**
 * Keyframe offset values.
 *
 * @since 0.4.0
 */
export type KeyframeOffset = "from" | "to" | `${number}%`;

/**
 * Keyframe properties - frames with offset and CSS properties.
 *
 * @since 0.4.0
 */
export type KeyframeProperties = readonly {
  readonly offset: KeyframeOffset;
  readonly properties: Properties;
}[];

/**
 * Font-face descriptor properties.
 *
 * @since 0.4.0
 */
export type FontFaceProperties = {
  readonly fontFamily?: string;
  readonly src?: string;
  readonly fontStyle?: string;
  readonly fontWeight?: string | number;
  readonly fontStretch?: string;
  readonly fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  readonly unicodeRange?: string;
  readonly fontVariant?: string;
  readonly fontFeatureSettings?: string;
  readonly fontVariationSettings?: string;
  readonly ascentOverride?: string;
  readonly descentOverride?: string;
  readonly lineGapOverride?: string;
  readonly sizeAdjust?: string;
};

/**
 * Page pseudo-classes for @page rules.
 *
 * @since 0.4.0
 */
export type PagePseudo = ":first" | ":last" | ":left" | ":right" | ":blank";

/**
 * Property descriptor for @property at-rule.
 *
 * @since 0.4.0
 */
export type PropertyDescriptors = {
  readonly syntax: string;
  readonly inherits: boolean;
  readonly initialValue?: string;
};

/**
 * Counter style system values for @counter-style.
 *
 * @since 0.4.0
 */
export type CounterStyleSystem =
  | "cyclic"
  | "numeric"
  | "alphabetic"
  | "symbolic"
  | "additive"
  | "fixed"
  | `fixed ${number}`
  | `extends ${string}`;

/**
 * Counter style descriptors for @counter-style at-rule.
 *
 * @since 0.4.0
 */
export type CounterStyleDescriptors = {
  readonly system?: CounterStyleSystem;
  readonly symbols?: string;
  readonly additiveSymbols?: string;
  readonly negative?: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly range?: string;
  readonly pad?: string;
  readonly fallback?: string;
  readonly speakAs?: string;
};

/**
 * Font feature value types for @font-feature-values.
 *
 * @since 0.4.0
 */
export type FontFeatureValueType =
  | "stylistic"
  | "styleset"
  | "character-variant"
  | "swash"
  | "ornaments"
  | "annotation";

/**
 * Font feature values descriptors for @font-feature-values at-rule.
 *
 * @since 0.4.0
 */
export type FontFeatureValuesDescriptors = Partial<
  Record<FontFeatureValueType, Record<string, number[]>>
>;

/**
 * Font palette descriptors for @font-palette-values at-rule.
 *
 * @since 0.4.0
 */
export type FontPaletteDescriptors = {
  readonly basePalette?: number | "light" | "dark";
  readonly overrideColors?: Record<number, string>;
};

/**
 * Rendering intent for @color-profile.
 *
 * @since 0.4.0
 */
export type ColorProfileRenderingIntent =
  | "relative-colorimetric"
  | "absolute-colorimetric"
  | "perceptual"
  | "saturation";

/**
 * Color profile descriptors for @color-profile at-rule.
 *
 * @since 0.4.0
 */
export type ColorProfileDescriptors = {
  readonly src: string;
  readonly renderingIntent?: ColorProfileRenderingIntent;
  readonly components?: string;
};

/**
 * Map of at-rule tags to their query type (content between tag and `{` or `;`).
 *
 * @since 0.4.0
 */
type AtRuleQueries = {
  "@media": string;
  "@supports": string;
  "@container": string;
  "@layer": string;
  "@keyframes": string;
  "@font-face": undefined;
  "@import": string;
  "@charset": string;
  "@namespace": string;
  "@page": PagePseudo | string;
  "@property": `--${string}`;
  "@scope": string;
  "@starting-style": undefined;
  "@counter-style": string;
  "@font-feature-values": string;
  "@font-palette-values": string;
  "@color-profile": string;
};

/**
 * Map of at-rule tags to their properties type (content inside the block).
 *
 * @since 0.4.0
 */
type AtRuleProperties = {
  "@media": undefined;
  "@supports": undefined;
  "@container": undefined;
  "@layer": undefined;
  "@keyframes": KeyframeProperties;
  "@font-face": FontFaceProperties;
  "@import": undefined;
  "@charset": undefined;
  "@namespace": undefined;
  "@page": Properties;
  "@property": PropertyDescriptors;
  "@scope": undefined;
  "@starting-style": undefined;
  "@counter-style": CounterStyleDescriptors;
  "@font-feature-values": FontFeatureValuesDescriptors;
  "@font-palette-values": FontPaletteDescriptors;
  "@color-profile": ColorProfileDescriptors;
};

/**
 * Map of at-rule tags to their children type.
 *
 * Based on CSS nesting rules - each at-rule can only contain specific
 * nested at-rules and style rules.
 *
 * @since 0.4.0
 */
// deno-fmt-ignore
type AtRuleChildren = {
  "@media": AtRule<"@media" | "@supports" | "@scope" | "@starting-style"
    | "@container" | "@layer" | "@font-face" | "@keyframes"> | Style;

  "@supports": AtRule<"@media" | "@supports" | "@scope" | "@starting-style"
    | "@container" | "@layer" | "@font-face"> | Style;

  "@container": AtRule<"@media" | "@supports" | "@scope" | "@starting-style"
    | "@layer"> | Style;

  "@layer": AtRule<"@media" | "@supports" | "@scope" | "@starting-style"
    | "@container" | "@layer" | "@font-face" | "@keyframes" | "@page"
    | "@property" | "@counter-style"> | Style;

  "@keyframes": undefined;
  "@font-face": undefined;
  "@import": undefined;
  "@charset": undefined;
  "@namespace": undefined;
  "@page": undefined;
  "@property": undefined;
  "@scope": AtRule<"@media" | "@supports" | "@scope" | "@starting-style"
    | "@container"> | Style;

  "@starting-style": Style;
  "@counter-style": undefined;
  "@font-feature-values": undefined;
  "@font-palette-values": undefined;
  "@color-profile": undefined;
};

type IfDef<T, True, False> = T extends undefined ? False : True;

type AtRuleOptions<T extends AtRuleTag> =
  // deno-lint-ignore ban-types
  & IfDef<AtRuleQueries[T], { readonly query: AtRuleQueries[T] }, {}>
  // deno-lint-ignore ban-types
  & IfDef<AtRuleProperties[T], { readonly properties: AtRuleProperties[T] }, {}>
  // deno-lint-ignore ban-types
  & IfDef<AtRuleChildren[T], { readonly children: AtRuleChildren[T][] }, {}>;

const AtRuleBrand = Symbol("@baetheus/css/core/atrule");

/**
 * Represents a CSS at-rule (e.g., @media, @keyframes, @font-face).
 *
 * AtRule instances encapsulate the tag, query, properties, and children
 * of CSS at-rules and can be rendered to CSS strings.
 *
 * @example
 * ```ts
 * import { AtRule, STANDARD_RENDER } from "./css.ts";
 *
 * const rule = new AtRule("@media", {
 *   query: "(min-width: 768px)",
 *   children: [],
 * });
 * console.log(rule.render(STANDARD_RENDER));
 * ```
 *
 * @since 0.0.2
 */
export class AtRule<T extends AtRuleTag = AtRuleTag> {
  readonly [AtRuleBrand] = null;
  readonly hash: string;

  constructor(
    readonly tag: T,
    readonly options: AtRuleOptions<T>,
  ) {
    this.hash = hashObject({
      tag,
      options,
    });
  }

  render(options: RenderOptions = STANDARD_RENDER, depth: number = 0): string {
    return renderAtRule(this, options, depth);
  }
}

/**
 * Type guard to check if a value is an AtRule instance.
 *
 * @param value - The value to check
 * @returns `true` if the value is an AtRule, `false` otherwise
 *
 * @example
 * ```ts
 * import { media, isAtRule, style } from "./css.ts";
 *
 * const m = media("(min-width: 768px)");
 * const s = style({ color: "red" });
 *
 * console.log(isAtRule(m)); // true
 * console.log(isAtRule(s)); // false
 * console.log(isAtRule(null)); // false
 * ```
 *
 * @since 0.0.2
 */
export function isAtRule(value: unknown): value is AtRule {
  return typeof value === "object" && value !== null && AtRuleBrand in value;
}

function renderAtRuleChild(
  child: AtRule | Style,
  options: RenderOptions,
  depth: number,
): string {
  if (isAtRule(child)) {
    return renderAtRule(child, options, depth);
  }
  return (child as Style).render(options, depth);
}

/**
 * Renders an AtRule to its CSS string representation.
 *
 * Handles all CSS at-rule types including statement rules (@import, @charset, @namespace)
 * and block rules (@media, @keyframes, @font-face, etc.).
 *
 * @param rule - The AtRule to render
 * @param options - Render options for formatting
 * @param depth - The indentation depth
 * @returns The formatted CSS at-rule string
 *
 * @example
 * ```ts
 * import { media, style, renderAtRule, STANDARD_RENDER } from "./css.ts";
 *
 * const s = style({ color: "red" });
 * const m = media("(min-width: 768px)", s);
 * console.log(renderAtRule(m, STANDARD_RENDER));
 * ```
 *
 * @since 0.0.2
 */
export function renderAtRule(
  rule: AtRule,
  options: RenderOptions = STANDARD_RENDER,
  depth: number = 0,
): string {
  const indent = options.indent.repeat(depth);
  const opts = rule.options as Record<string, unknown>;
  const query = opts.query as string | undefined;
  const properties = opts.properties;
  const children = opts.children as (AtRule | Style)[] | undefined;

  // Statement at-rules (no block)
  switch (rule.tag) {
    case "@import":
    case "@charset":
    case "@namespace":
      return `${indent}${rule.tag}${options.space}${query};`;
  }

  // Block at-rules
  const prelude = query !== undefined
    ? `${rule.tag}${options.space}${query}`
    : rule.tag;

  switch (rule.tag) {
    case "@keyframes":
      return renderBlock(
        prelude,
        renderKeyframes(properties as KeyframeProperties, options, depth + 1),
        options,
        depth,
      );

    case "@font-face":
      return renderBlock(
        prelude,
        renderFontFace(properties as FontFaceProperties, options, depth + 1),
        options,
        depth,
      );

    case "@page":
      return renderBlock(
        prelude,
        renderProperties(properties as Properties, options, depth + 1),
        options,
        depth,
      );

    case "@property":
      return renderBlock(
        prelude,
        renderPropertyDescriptors(
          properties as PropertyDescriptors,
          options,
          depth + 1,
        ),
        options,
        depth,
      );

    case "@counter-style":
      return renderBlock(
        prelude,
        renderCounterStyle(
          properties as CounterStyleDescriptors,
          options,
          depth + 1,
        ),
        options,
        depth,
      );

    case "@font-feature-values":
      return renderBlock(
        prelude,
        renderFontFeatureValues(
          properties as FontFeatureValuesDescriptors,
          options,
          depth + 1,
        ),
        options,
        depth,
      );

    case "@font-palette-values":
      return renderBlock(
        prelude,
        renderFontPalette(
          properties as FontPaletteDescriptors,
          options,
          depth + 1,
        ),
        options,
        depth,
      );

    case "@color-profile":
      return renderBlock(
        prelude,
        renderColorProfile(
          properties as ColorProfileDescriptors,
          options,
          depth + 1,
        ),
        options,
        depth,
      );

    case "@media":
    case "@supports":
    case "@container":
    case "@layer":
    case "@scope":
    case "@starting-style": {
      const body = children
        ? children.map((c) => renderAtRuleChild(c, options, depth + 1)).join(
          options.newline,
        )
        : "";
      return renderBlock(prelude, body, options, depth);
    }

    default:
      return "";
  }
}

// =============================================================================
// At-Rule Constructor Functions
// =============================================================================

/**
 * Creates an @media at-rule for responsive styles.
 *
 * @param query - The media query string
 * @param children - Child styles or nested at-rules
 * @returns An AtRule instance for @media
 *
 * @example
 * ```ts
 * import { media, style, render } from "./css.ts";
 *
 * const responsive = style({ fontSize: "14px" });
 * const rule = media("(min-width: 768px)", responsive);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function media(
  query: string,
  ...children: AtRuleChildren["@media"][]
): AtRule<"@media"> {
  return new AtRule("@media", { query, children });
}

/**
 * Creates an @supports at-rule for feature detection.
 *
 * @param query - The feature query string
 * @param children - Child styles or nested at-rules
 * @returns An AtRule instance for @supports
 *
 * @example
 * ```ts
 * import { supports, style, render } from "./css.ts";
 *
 * const gridStyle = style({ display: "grid" });
 * const rule = supports("(display: grid)", gridStyle);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function supports(
  query: string,
  ...children: AtRuleChildren["@supports"][]
): AtRule<"@supports"> {
  return new AtRule("@supports", { query, children });
}

/**
 * Creates an @container at-rule for container queries.
 *
 * @param query - The container query string
 * @param children - Child styles or nested at-rules
 * @returns An AtRule instance for @container
 *
 * @example
 * ```ts
 * import { container, style, render } from "./css.ts";
 *
 * const cardStyle = style({ padding: "16px" });
 * const rule = container("(min-width: 400px)", cardStyle);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function container(
  query: string,
  ...children: AtRuleChildren["@container"][]
): AtRule<"@container"> {
  return new AtRule("@container", { query, children });
}

/**
 * Creates an @layer at-rule for cascade layers.
 *
 * @param query - The layer name
 * @param children - Child styles or nested at-rules
 * @returns An AtRule instance for @layer
 *
 * @example
 * ```ts
 * import { layer, style, render } from "./css.ts";
 *
 * const utility = style({ margin: "0" });
 * const rule = layer("utilities", utility);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function layer(
  query: string,
  ...children: AtRuleChildren["@layer"][]
): AtRule<"@layer"> {
  return new AtRule("@layer", { query, children });
}

/**
 * Creates an @scope at-rule for scoped styling.
 *
 * @param query - The scope boundary definition
 * @param children - Child styles or nested at-rules
 * @returns An AtRule instance for @scope
 *
 * @example
 * ```ts
 * import { scope, style, render } from "./css.ts";
 *
 * const cardStyle = style({ borderRadius: "8px" });
 * const rule = scope("(.card) to (.card-content)", cardStyle);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function scope(
  query: string,
  ...children: AtRuleChildren["@scope"][]
): AtRule<"@scope"> {
  return new AtRule("@scope", { query, children });
}

/**
 * Creates an @starting-style at-rule for entry animations.
 *
 * @param children - Child styles for the starting state
 * @returns An AtRule instance for @starting-style
 *
 * @example
 * ```ts
 * import { startingStyle, style, render } from "./css.ts";
 *
 * const initial = style({ opacity: "0" });
 * const rule = startingStyle(initial);
 * console.log(render([rule]));
 * ```
 *
 * @since 0.0.2
 */
export function startingStyle(
  ...children: Style[]
): AtRule<"@starting-style"> {
  return new AtRule("@starting-style", { children });
}

/**
 * Creates an @keyframes at-rule for CSS animations.
 *
 * @param query - The animation name
 * @param properties - Array of keyframe definitions with offset and properties
 * @returns An AtRule instance for @keyframes
 *
 * @example
 * ```ts
 * import { keyframes, render } from "./css.ts";
 *
 * const fadeIn = keyframes("fadeIn", [
 *   { offset: "from", properties: { opacity: "0" } },
 *   { offset: "to", properties: { opacity: "1" } },
 * ]);
 * console.log(render([fadeIn]));
 * ```
 *
 * @since 0.0.2
 */
export function keyframes(
  query: string,
  properties: KeyframeProperties,
): AtRule<"@keyframes"> {
  return new AtRule("@keyframes", { query, properties });
}

/**
 * Creates an @font-face at-rule for custom fonts.
 *
 * @param properties - The font-face descriptor properties
 * @returns An AtRule instance for @font-face
 *
 * @example
 * ```ts
 * import { fontFace, render } from "./css.ts";
 *
 * const font = fontFace({
 *   fontFamily: "MyFont",
 *   src: "url(/fonts/myfont.woff2) format('woff2')",
 *   fontWeight: "400",
 * });
 * console.log(render([font]));
 * ```
 *
 * @since 0.0.2
 */
export function fontFace(properties: FontFaceProperties): AtRule<"@font-face"> {
  return new AtRule("@font-face", { properties });
}

/**
 * Creates an @import at-rule for importing external stylesheets.
 *
 * @param query - The import URL and optional media query
 * @returns An AtRule instance for @import
 *
 * @example
 * ```ts
 * import { importRule, render } from "./css.ts";
 *
 * const imp = importRule("'styles.css'");
 * console.log(render([imp])); // "@import 'styles.css';"
 *
 * const withMedia = importRule("url('print.css') print");
 * console.log(render([withMedia]));
 * ```
 *
 * @since 0.0.2
 */
export function importRule(query: string): AtRule<"@import"> {
  return new AtRule("@import", { query });
}

/**
 * Creates an @charset at-rule for specifying character encoding.
 *
 * @param query - The character encoding (e.g., "'UTF-8'")
 * @returns An AtRule instance for @charset
 *
 * @example
 * ```ts
 * import { charset, render } from "./css.ts";
 *
 * const enc = charset("'UTF-8'");
 * console.log(render([enc])); // "@charset 'UTF-8';"
 * ```
 *
 * @since 0.0.2
 */
export function charset(query: string): AtRule<"@charset"> {
  return new AtRule("@charset", { query });
}

/**
 * Creates an @namespace at-rule for XML namespaces.
 *
 * @param query - The namespace definition
 * @returns An AtRule instance for @namespace
 *
 * @example
 * ```ts
 * import { cssNamespace, render } from "./css.ts";
 *
 * const ns = cssNamespace("svg url('http://www.w3.org/2000/svg')");
 * console.log(render([ns]));
 * ```
 *
 * @since 0.0.2
 */
export function cssNamespace(query: string): AtRule<"@namespace"> {
  return new AtRule("@namespace", { query });
}

/**
 * Creates an @page at-rule for print styling.
 *
 * @param query - The page selector (e.g., ":first", ":left")
 * @param properties - CSS properties for the page
 * @returns An AtRule instance for @page
 *
 * @example
 * ```ts
 * import { page, render } from "./css.ts";
 *
 * const firstPage = page(":first", { margin: "2cm" });
 * console.log(render([firstPage]));
 * ```
 *
 * @since 0.0.2
 */
export function page(
  query: PagePseudo | string,
  properties: Properties,
): AtRule<"@page"> {
  return new AtRule("@page", { query, properties });
}

/**
 * Creates an @property at-rule for custom property definitions.
 *
 * @param query - The custom property name (must start with --)
 * @param properties - The property descriptors
 * @returns An AtRule instance for @property
 *
 * @example
 * ```ts
 * import { property, render } from "./css.ts";
 *
 * const colorProp = property("--my-color", {
 *   syntax: "<color>",
 *   inherits: false,
 *   initialValue: "red",
 * });
 * console.log(render([colorProp]));
 * ```
 *
 * @since 0.0.2
 */
export function property(
  query: `--${string}`,
  properties: PropertyDescriptors,
): AtRule<"@property"> {
  return new AtRule("@property", { query, properties });
}

/**
 * Creates an @counter-style at-rule for custom list markers.
 *
 * @param query - The counter style name
 * @param properties - The counter style descriptors
 * @returns An AtRule instance for @counter-style
 *
 * @example
 * ```ts
 * import { counterStyle, render } from "./css.ts";
 *
 * const thumbs = counterStyle("thumbs", {
 *   system: "cyclic",
 *   symbols: "'*'",
 *   suffix: " ",
 * });
 * console.log(render([thumbs]));
 * ```
 *
 * @since 0.0.2
 */
export function counterStyle(
  query: string,
  properties: CounterStyleDescriptors,
): AtRule<"@counter-style"> {
  return new AtRule("@counter-style", { query, properties });
}

/**
 * Creates an @font-feature-values at-rule for font feature aliases.
 *
 * @param query - The font family name
 * @param properties - The font feature values descriptors
 * @returns An AtRule instance for @font-feature-values
 *
 * @example
 * ```ts
 * import { fontFeatureValues, render } from "./css.ts";
 *
 * const features = fontFeatureValues("MyFont", {
 *   stylistic: { fancy: [1] },
 * });
 * console.log(render([features]));
 * ```
 *
 * @since 0.0.2
 */
export function fontFeatureValues(
  query: string,
  properties: FontFeatureValuesDescriptors,
): AtRule<"@font-feature-values"> {
  return new AtRule("@font-feature-values", { query, properties });
}

/**
 * Creates an @font-palette-values at-rule for color font palettes.
 *
 * @param query - The palette name (typically starts with --)
 * @param properties - The font palette descriptors
 * @returns An AtRule instance for @font-palette-values
 *
 * @example
 * ```ts
 * import { fontPaletteValues, render } from "./css.ts";
 *
 * const palette = fontPaletteValues("--my-palette", {
 *   basePalette: 0,
 *   overrideColors: { 0: "red", 1: "blue" },
 * });
 * console.log(render([palette]));
 * ```
 *
 * @since 0.0.2
 */
export function fontPaletteValues(
  query: string,
  properties: FontPaletteDescriptors,
): AtRule<"@font-palette-values"> {
  return new AtRule("@font-palette-values", { query, properties });
}

/**
 * Creates an @color-profile at-rule for ICC color profiles.
 *
 * @param query - The color profile name (typically starts with --)
 * @param properties - The color profile descriptors
 * @returns An AtRule instance for @color-profile
 *
 * @example
 * ```ts
 * import { colorProfile, render } from "./css.ts";
 *
 * const profile = colorProfile("--swop5c", {
 *   src: "url('https://example.com/SWOP.icc')",
 *   renderingIntent: "relative-colorimetric",
 * });
 * console.log(render([profile]));
 * ```
 *
 * @since 0.0.2
 */
export function colorProfile(
  query: string,
  properties: ColorProfileDescriptors,
): AtRule<"@color-profile"> {
  return new AtRule("@color-profile", { query, properties });
}

/**
 * DJB2 hash - fast, simple, good distribution.
 *
 * @internal
 */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Hash any value to a 7-character base36 string.
 *
 * @example
 * ```ts
 * import { hashObject } from "./core.ts";
 *
 * hashObject({ color: "red" });  // "0a1b2c3"
 * hashObject([1, 2, 3]);         // "x7y8z9a"
 * ```
 *
 * @since 0.1.0
 */
function hashObject(input: unknown): string {
  const content = JSON.stringify(input);
  const hash = djb2(content);
  return hash.toString(36).padStart(7, "0"); // 7 chars, zero-padded
}

const StyleBrand: unique symbol = Symbol("@baetheus/css/core/style");

/**
 * At-rules that can be nested inside a style rule.
 *
 * @since 0.4.0
 */
export type StyleNestedAtRuleTag =
  | "@media"
  | "@supports"
  | "@container"
  | "@layer"
  | "@scope"
  | "@starting-style";

// =============================================================================
// Style Types
// =============================================================================

/**
 * Input type for style variants and children - either an existing Style or raw Properties.
 */
export type StyleInput = Style | Properties;

/**
 * Constraint type for variant definitions.
 */
export type StyleRecord = Readonly<Record<string, StyleInput>>;

/**
 * Convert StyleInput to proper Style type.
 */
export type ToStyle<T> = T extends Style<infer V, infer C> ? Style<V, C>
  : Style;

/**
 * Full Style type with variants and children accessible as direct properties.
 */
class BaseStyle<
  // deno-lint-ignore ban-types
  V extends StyleRecord = {},
  // deno-lint-ignore ban-types
  C extends StyleRecord = {},
> {
  readonly [StyleBrand] = null;
  #name: string;
  #hash: string;
  #selector: Selector;
  #properties: Properties;
  #atrules: readonly AtRule<StyleNestedAtRuleTag>[];
  #variants: Readonly<{ [K in keyof V]: ToStyle<V[K]> }>;
  #children: Readonly<{ [K in keyof C]: ToStyle<C[K]> }>;

  constructor(
    name: string,
    hash: string,
    selector: Selector,
    properties: Properties,
    atrules: readonly AtRule<StyleNestedAtRuleTag>[],
    variants: Readonly<{ [K in keyof V]: ToStyle<V[K]> }>,
    children: Readonly<{ [K in keyof C]: ToStyle<C[K]> }>,
  ) {
    this.#name = name;
    this.#hash = hash;
    this.#selector = selector;
    this.#properties = properties;
    this.#atrules = atrules;
    this.#variants = variants;
    this.#children = children;
  }

  toString(): string {
    return this.#name;
  }

  nest(): Style<V, C> {
    if (isNestableSelector(this.#selector)) {
      const base = new BaseStyle(
        this.#name,
        this.#hash,
        compoundSelector("&", this.#selector),
        this.#properties,
        this.#atrules,
        this.#variants,
        this.#children,
      );
      return Object.assign(base, this.#children);
    }
    return this as Style<V, C>;
  }

  with(...keys: (keyof V)[]): string {
    return [this.#name, ...keys.map((key) => this.#variants[key].toString())]
      .join(" ");
  }

  render(options: RenderOptions = STANDARD_RENDER, depth: number = 0): string {
    const parts: string[] = [];

    // Render main style block
    const propsBody = renderProperties(this.#properties, options, depth + 1);
    if (propsBody !== "") {
      parts.push(
        renderBlock(renderSelector(this.#selector), propsBody, options, depth),
      );
    }

    // Render variants
    for (const variant of Object.values(this.#variants)) {
      parts.push((variant as Style).render(options, depth));
    }

    // Render children
    for (const child of Object.values(this.#children)) {
      parts.push((child as Style).render(options, depth));
    }

    // Render nested at-rules
    for (const atrule of this.#atrules) {
      parts.push(atrule.render(options, depth));
    }

    return parts.filter((p) => p !== "").join(options.newline);
  }
}

export type Style<
  // deno-lint-ignore ban-types
  V extends StyleRecord = {},
  // deno-lint-ignore ban-types
  C extends StyleRecord = {},
> =
  & BaseStyle<V, C>
  & { readonly [K in Exclude<keyof C, keyof BaseStyle<V>>]: ToStyle<C[K]> };

/**
 * Options for style construction.
 */
export type StyleOptions<V extends StyleRecord, C extends StyleRecord> = {
  readonly properties: Properties;
  readonly at?: readonly AtRule<StyleNestedAtRuleTag>[];
  readonly variants?: V;
  readonly children?: C;
};

/**
 * Type guard to check if a value is a Style object.
 *
 * @param input - The value to check
 * @returns `true` if the value is a Style, `false` otherwise
 *
 * @example
 * ```ts
 * import { isStyle, style } from "./css.ts";
 *
 * const s = style({ color: "red" });
 * console.log(isStyle(s));              // true
 * console.log(isStyle({ color: "red" })); // false
 * console.log(isStyle(null));           // false
 * ```
 *
 * @since 0.0.2
 */
export function isStyle(input: unknown): input is Style {
  return input !== null && typeof input === "object" &&
    Object.hasOwn(input, StyleBrand);
}

export type ExtraOptions<V extends StyleRecord, C extends StyleRecord> = Omit<
  StyleOptions<V, C>,
  "properties"
>;

function base<V extends StyleRecord, C extends StyleRecord>(
  name: string,
  hash: string,
  selector: Selector,
  options: StyleOptions<V, C>,
): Style<V, C> {
  const variants = pipe(
    options.variants ?? {} as StyleRecord,
    R.map((input) => isStyle(input) ? input.nest() : style(input).nest()),
  ) as Readonly<{ [K in keyof V]: ToStyle<V[K]> }>;

  const children = pipe(
    options.children ?? {} as StyleRecord,
    R.map((input) => isStyle(input) ? input : style(input)),
  ) as Readonly<{ [K in keyof C]: ToStyle<C[K]> }>;

  // Create base style object
  const base = new BaseStyle<V, C>(
    name,
    hash,
    selector,
    options.properties,
    options.at ?? [],
    variants,
    children,
  );

  return Object.assign(base, children);
}

/**
 * Creates a style with a custom selector instead of an auto-generated class.
 *
 * Use this when you need to target specific selectors like HTML elements,
 * pseudo-elements, or complex selector patterns.
 *
 * @param selector - The selector value to use
 * @param options - Style options including properties, variants, children, and at-rules
 * @returns A Style instance with the specified selector
 *
 * @example
 * ```ts
 * import { raw, render } from "./css.ts";
 *
 * const link = raw("a", { properties: { textDecoration: "none" } });
 * const hover = raw("a:hover", { properties: { color: "blue" } });
 * console.log(render([link, hover]));
 * ```
 *
 * @since 0.0.2
 */
export function raw<
  V extends StyleRecord,
  C extends StyleRecord,
  S extends SelectorValue,
>(
  selector: S,
  options: StyleOptions<V, C>,
): Style<V, C> {
  const hash = hashObject(options.properties);
  return base("", hash, compoundSelector(selector as Selector), options);
}

/**
 * Creates a style with an auto-generated class name based on the properties hash.
 *
 * This is the primary way to create styles. The generated class name is deterministic
 * and based on the content of the properties, enabling deduplication.
 *
 * @param properties - The CSS properties for this style
 * @param extra - Optional additional options (variants, children, at-rules)
 * @returns A Style instance with an auto-generated class selector
 *
 * @example
 * ```ts
 * import { style, render } from "./css.ts";
 *
 * const button = style({ color: "blue", padding: "8px 16px" });
 * console.log(button.toString()); // ".abc123" (hash-based class)
 * console.log(render([button]));
 *
 * // With variants
 * const card = style({ padding: "16px" }, {
 *   variants: {
 *     large: { padding: "32px" },
 *   },
 * });
 * console.log(card.with("large")); // ".abc123 .def456"
 * ```
 *
 * @since 0.0.2
 */
export function style<V extends StyleRecord, C extends StyleRecord>(
  properties: Properties,
  extra?: ExtraOptions<V, C>,
): Style<V, C> {
  const hash = hashObject(properties);
  const name = `.${hash}` as const;
  const selector = compoundSelector(name);
  return base(name, hash, selector, { properties, ...extra });
}

/**
 * Creates a style with an ID selector.
 *
 * @param id - The ID name (without the # prefix)
 * @param properties - The CSS properties for this style
 * @param extra - Optional additional options (variants, children, at-rules)
 * @returns A Style instance with an ID selector
 *
 * @example
 * ```ts
 * import { id, render } from "./css.ts";
 *
 * const header = id("header", { position: "fixed", top: "0" });
 * console.log(header.toString()); // "#header"
 * console.log(render([header]));
 * ```
 *
 * @since 0.0.2
 */
export function id<V extends StyleRecord, C extends StyleRecord>(
  id: string,
  properties: Properties,
  extra?: ExtraOptions<V, C>,
): Style<V, C> {
  const hash = hashObject(properties);
  const name = `#${id}` as const;
  const selector = compoundSelector(name);
  return base(name, hash, selector, { properties, ...extra });
}

/**
 * Creates a style targeting an HTML element.
 *
 * @param el - The HTML element name
 * @param properties - The CSS properties for this style
 * @param extra - Optional additional options (variants, children, at-rules)
 * @returns A Style instance with an element selector
 *
 * @example
 * ```ts
 * import { element, render } from "./css.ts";
 *
 * const body = element("body", { margin: "0", fontFamily: "sans-serif" });
 * console.log(body.toString()); // "body"
 * console.log(render([body]));
 * ```
 *
 * @since 0.0.2
 */
export function element<V extends StyleRecord, C extends StyleRecord>(
  el: HtmlElement,
  properties: Properties,
  extra?: ExtraOptions<V, C>,
): Style<V, C> {
  const hash = hashObject(properties);
  const name = el;
  const selector = compoundSelector(name);
  return base(name, hash, selector, { properties, ...extra });
}

// =============================================================================
// Root Render Function
// =============================================================================

export type RenderItem = Style | AtRule | Record<string, Style>;

function isStyleRecord(value: RenderItem): value is Record<string, Style> {
  return typeof value === "object" && value !== null && !isStyle(value) &&
    !isAtRule(value);
}

/**
 * Renders an array of styles and at-rules to a CSS string.
 *
 * This is the main function for generating the final CSS output. It accepts
 * Style instances, AtRule instances, and records of styles.
 *
 * @param items - Array of styles, at-rules, or style records to render
 * @param options - Render options for formatting
 * @returns The complete CSS string
 *
 * @example
 * ```ts
 * import { style, media, render, STANDARD_RENDER, MINIMAL_RENDER } from "./css.ts";
 *
 * const button = style({ color: "blue" });
 * const responsive = media("(min-width: 768px)", button);
 *
 * // Standard output with formatting
 * console.log(render([button, responsive], STANDARD_RENDER));
 *
 * // Minified output
 * console.log(render([button, responsive], MINIMAL_RENDER));
 *
 * // Render a record of styles
 * const styles = { btn: style({ color: "red" }), card: style({ padding: "16px" }) };
 * console.log(render([styles]));
 * ```
 *
 * @since 0.0.2
 */
export function render(
  items: RenderItem[],
  options: RenderOptions = STANDARD_RENDER,
): string {
  const parts: string[] = [];

  for (const item of items) {
    if (isStyle(item)) {
      parts.push(item.render(options, 0));
    } else if (isAtRule(item)) {
      parts.push(item.render(options, 0));
    } else if (isStyleRecord(item)) {
      for (const style of Object.values(item)) {
        parts.push(style.render(options, 0));
      }
    }
  }

  return parts.join(options.newline);
}
