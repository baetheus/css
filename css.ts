import type * as CSS from "csstype";

// =============================================================================
// Properties and Variables
// =============================================================================

export type VariableKey = `--${string}`;

export type VariableValue = `var(${VariableKey}${string})`;

export type Variables = { readonly [K in VariableKey]: string };

export type Properties =
  | CSS.Properties
  | Variables;

// =============================================================================
// Selectors
// =============================================================================

// deno-fmt-ignore
export type HtmlElement =
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
export type PseudoClassValue =
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
 * TODO: Hoist FunctionClassValues that take selectors into their own types.
 *
 * @since 0.4.0
 */
export type FunctionClassValue =
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
export type PseudoElementValue =
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
export type ClassSelector = `.${string}`;

/**
 * ID selector (e.g., `#main`).
 *
 * @since 0.4.0
 */
export type IdSelector = `#${string}`;

/**
 * Universal selector.
 *
 * @since 0.4.0
 */
export type UniversalSelector = "*";

/**
 * Parent/nesting selector.
 *
 * @since 0.4.0
 */
export type ParentSelector = "&";

export type HtmlAttributes = CSS.HtmlAttributes extends `[${infer Attr}]` ? Attr
  : never;

/**
 * Attribute selector with optional operator and value.
 *
 * @since 0.4.0
 */
export type AttributeSelector =
  | `[${HtmlAttributes}]`
  | `[${HtmlAttributes}="${string}"]`
  | `[${HtmlAttributes}^="${string}"]`
  | `[${HtmlAttributes}$="${string}"]`
  | `[${HtmlAttributes}*="${string}"]`
  | `[${HtmlAttributes}~="${string}"]`
  | `[${HtmlAttributes}|="${string}"]`;

/**
 * Union of all simple selector types.
 *
 * @since 0.4.0
 */
export type SimpleSelector =
  | HtmlElement
  | ClassSelector
  | IdSelector
  | UniversalSelector
  | ParentSelector
  | AttributeSelector;

/**
 * CSS selector combinators.
 *
 * @since 0.4.0
 */
export type SelectorCombinator = " " | ">" | "+" | "~";

/**
 * All possible values in a selector's values array.
 *
 * @since 0.4.0
 */
export type SelectorValue =
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

export type SelectorValues = readonly [SelectorValue, ...SelectorValue[]];

export type CompoundSelector = {
  readonly type: "CompoundSelector";
  readonly values: SelectorValues;
};

export function compoundSelector(...values: SelectorValues): CompoundSelector {
  return { type: "CompoundSelector", values };
}

export type ComplexSelector = {
  readonly type: "ComplexSelector";
  readonly combinator: SelectorCombinator;
  readonly values: SelectorValues;
};

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

export function renderSelector(selector: Selector): string {
  if (selector.type === "CompoundSelector") {
    return selector.values.map(renderSelectorValue).join("");
  }
  return selector.values.map(renderSelectorValue).join(selector.combinator);
}

/**
 * String representations of all selector types.
 *
 * @since 0.4.0
 */
export type SelectorKind =
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
export type AtRuleQueries = {
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
export type AtRuleProperties = {
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
export type AtRuleChildren = {
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

  "@starting-style": readonly Style[];
  "@counter-style": undefined;
  "@font-feature-values": undefined;
  "@font-palette-values": undefined;
  "@color-profile": undefined;
};

const AtRuleBrand = Symbol("@baetheus/css/core/atrule");

type IfDef<T, True, False> = T extends undefined ? False : True;

type AtRuleOptions<T extends AtRuleTag> =
  // deno-lint-ignore ban-types
  & IfDef<AtRuleQueries[T], { readonly query: AtRuleQueries[T] }, {}>
  // deno-lint-ignore ban-types
  & IfDef<AtRuleProperties[T], { readonly properties: AtRuleProperties[T] }, {}>
  // deno-lint-ignore ban-types
  & IfDef<AtRuleChildren[T], { readonly children: AtRuleChildren[T][] }, {}>;

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
}

// =============================================================================
// At-Rule Constructor Functions
// =============================================================================

/**
 * Create an @media at-rule.
 *
 * @example
 * ```ts
 * media("(min-width: 768px)", style1, style2);
 * ```
 */
export function media(
  query: string,
  ...children: AtRuleChildren["@media"][]
): AtRule<"@media"> {
  return new AtRule("@media", { query, children });
}

/**
 * Create an @supports at-rule.
 *
 * @example
 * ```ts
 * supports("(display: grid)", style1, style2);
 * ```
 */
export function supports(
  query: string,
  ...children: AtRuleChildren["@supports"][]
): AtRule<"@supports"> {
  return new AtRule("@supports", { query, children });
}

/**
 * Create an @container at-rule.
 *
 * @example
 * ```ts
 * container("(min-width: 400px)", style1);
 * ```
 */
export function container(
  query: string,
  ...children: AtRuleChildren["@container"][]
): AtRule<"@container"> {
  return new AtRule("@container", { query, children });
}

/**
 * Create an @layer at-rule.
 *
 * @example
 * ```ts
 * layer("utilities", style1, style2);
 * ```
 */
export function layer(
  query: string,
  ...children: AtRuleChildren["@layer"][]
): AtRule<"@layer"> {
  return new AtRule("@layer", { query, children });
}

/**
 * Create an @scope at-rule.
 *
 * @example
 * ```ts
 * scope("(.card) to (.card-content)", style1);
 * ```
 */
export function scope(
  query: string,
  ...children: AtRuleChildren["@scope"][]
): AtRule<"@scope"> {
  return new AtRule("@scope", { query, children });
}

/**
 * Create an @starting-style at-rule.
 *
 * @example
 * ```ts
 * startingStyle(style1, style2);
 * ```
 */
export function startingStyle(
  ...children: AtRuleChildren["@starting-style"][]
): AtRule<"@starting-style"> {
  return new AtRule("@starting-style", { children });
}

/**
 * Create an @keyframes at-rule.
 *
 * @example
 * ```ts
 * keyframes("fadeIn", [
 *   { offset: "from", properties: { opacity: "0" } },
 *   { offset: "to", properties: { opacity: "1" } },
 * ]);
 * ```
 */
export function keyframes(
  query: string,
  properties: KeyframeProperties,
): AtRule<"@keyframes"> {
  return new AtRule("@keyframes", { query, properties });
}

/**
 * Create an @font-face at-rule.
 *
 * @example
 * ```ts
 * fontFace({
 *   fontFamily: "MyFont",
 *   src: "url(/fonts/myfont.woff2) format('woff2')",
 *   fontWeight: "400",
 * });
 * ```
 */
export function fontFace(properties: FontFaceProperties): AtRule<"@font-face"> {
  return new AtRule("@font-face", { properties });
}

/**
 * Create an @import at-rule.
 *
 * @example
 * ```ts
 * importRule("'styles.css'");
 * importRule("url('theme.css') screen");
 * ```
 */
export function importRule(query: string): AtRule<"@import"> {
  return new AtRule("@import", { query });
}

/**
 * Create an @charset at-rule.
 *
 * @example
 * ```ts
 * charset("'UTF-8'");
 * ```
 */
export function charset(query: string): AtRule<"@charset"> {
  return new AtRule("@charset", { query });
}

/**
 * Create an @namespace at-rule.
 *
 * @example
 * ```ts
 * namespace("svg url('http://www.w3.org/2000/svg')");
 * ```
 */
export function cssNamespace(query: string): AtRule<"@namespace"> {
  return new AtRule("@namespace", { query });
}

/**
 * Create an @page at-rule.
 *
 * @example
 * ```ts
 * page(":first", { margin: "2cm" });
 * ```
 */
export function page(
  query: PagePseudo | string,
  properties: Properties,
): AtRule<"@page"> {
  return new AtRule("@page", { query, properties });
}

/**
 * Create an @property at-rule.
 *
 * @example
 * ```ts
 * property("--my-color", {
 *   syntax: "<color>",
 *   inherits: false,
 *   initialValue: "red",
 * });
 * ```
 */
export function property(
  query: `--${string}`,
  properties: PropertyDescriptors,
): AtRule<"@property"> {
  return new AtRule("@property", { query, properties });
}

/**
 * Create an @counter-style at-rule.
 *
 * @example
 * ```ts
 * counterStyle("thumbs", {
 *   system: "cyclic",
 *   symbols: "👍",
 *   suffix: " ",
 * });
 * ```
 */
export function counterStyle(
  query: string,
  properties: CounterStyleDescriptors,
): AtRule<"@counter-style"> {
  return new AtRule("@counter-style", { query, properties });
}

/**
 * Create an @font-feature-values at-rule.
 *
 * @example
 * ```ts
 * fontFeatureValues("Font Name", {
 *   stylistic: { fancy: [1] },
 * });
 * ```
 */
export function fontFeatureValues(
  query: string,
  properties: FontFeatureValuesDescriptors,
): AtRule<"@font-feature-values"> {
  return new AtRule("@font-feature-values", { query, properties });
}

/**
 * Create an @font-palette-values at-rule.
 *
 * @example
 * ```ts
 * fontPaletteValues("--my-palette", {
 *   basePalette: 0,
 *   overrideColors: { 0: "red", 1: "blue" },
 * });
 * ```
 */
export function fontPaletteValues(
  query: string,
  properties: FontPaletteDescriptors,
): AtRule<"@font-palette-values"> {
  return new AtRule("@font-palette-values", { query, properties });
}

/**
 * Create an @color-profile at-rule.
 *
 * @example
 * ```ts
 * colorProfile("--swop5c", {
 *   src: "url('https://example.com/SWOP.icc')",
 *   renderingIntent: "relative-colorimetric",
 * });
 * ```
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
export function hashObject(input: unknown): string {
  const content = JSON.stringify(input);
  const hash = djb2(content);
  return hash.toString(36).padStart(7, "0"); // 7 chars, zero-padded
}

const StyleBrand = Symbol("@baetheus/css/core/style");

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

/**
 * Child types allowed inside a Style rule.
 *
 * @since 0.4.0
 */
export type StyleChild = Style | AtRule<StyleNestedAtRuleTag>;

export class Style {
  readonly [StyleBrand] = null;

  constructor(
    readonly name: string,
    readonly hash: string,
    readonly selector: Selector,
    readonly properties: Properties,
    readonly children: readonly StyleChild[],
  ) {}

  toString() {
    return this.name;
  }
}

/**
 * Type guard to check if a value is a Style object.
 *
 * @example
 * ```ts
 * import { isStyle, style } from "./core.ts";
 * import { select } from "./ast.ts";
 *
 * const s = style(select.cls("btn"), { color: "red" });
 * isStyle(s);              // true
 * isStyle({ color: "red" }); // false
 * ```
 *
 * @since 0.1.0
 */
export function isStyle(input: unknown): input is Style {
  return input !== null && typeof input == "object" &&
    Object.hasOwn(input, StyleBrand);
}

/**
 * Create a style with a selector, properties, and optional children.
 *
 * @since 0.1.0
 */
export function style(
  selector: Selector,
  properties: Properties,
  children: readonly StyleChild[] = [],
): Style {
  const name = renderSelector(selector);
  const hash = hashObject(properties);
  return new Style(name, hash, selector, properties, children);
}

export function compound(
  selectorValues: readonly [SelectorValue, ...SelectorValue[]],
  properties: Properties,
  ...children: readonly StyleChild[]
): Style {
  return style(compoundSelector(...selectorValues), properties, children);
}

export function complex(
  combinator: SelectorCombinator,
  selector: readonly [SelectorValue, ...SelectorValue[]],
  properties: Properties,
  ...children: readonly StyleChild[]
): Style {
  return style(
    complexSelector(combinator, ...selector),
    properties,
    children,
  );
}

export function cls(
  properties: Properties,
  ...children: readonly StyleChild[]
): Style {
  const selector = compoundSelector(`.${hashObject(properties)}`);
  return style(selector, properties, children);
}

/**
 * Create a new Style by extending an existing Style with additional properties and children.
 * Performs a deep merge of properties.
 *
 * @example
 * ```ts
 * const baseButton = cls({ padding: "1rem", color: "black" });
 * const primaryButton = from(baseButton, { color: "blue" });
 * // primaryButton has { padding: "1rem", color: "blue" }
 * ```
 *
 * @since 0.5.0
 */
export function from(
  base: Style,
  properties: Properties = {},
  children: readonly StyleChild[] = [],
): Style {
  const mergedProperties = { ...base.properties, ...properties };
  const mergedChildren = [...base.children, ...children];
  return cls(mergedProperties, ...mergedChildren);
}

export type VariantInput = Readonly<Record<string, Style | Properties>>;

/**
 * Creates a collection of named style variants.
 * Returns an object mapping variant names to Style instances.
 *
 * @example
 * ```ts
 * const background = styleVariants({
 *   primary: { background: "blue" },
 *   secondary: { background: "aqua" },
 * });
 *
 * // Use: background.primary.toString() -> ".abc123"
 * ```
 *
 * @example With base style
 * ```ts
 * const baseButton = cls({ padding: "1rem" });
 *
 * const buttons = styleVariants({
 *   primary: from(baseButton, { background: "blue" }),
 *   secondary: from(baseButton, { background: "gray" }),
 * });
 * ```
 *
 * @since 0.5.0
 */
export function variants<T extends VariantInput>(
  variants: T,
): { readonly [K in keyof T]: Style } {
  const result = {} as { [K in keyof T]: Style };

  for (const [variantName, input] of Object.entries(variants)) {
    const variant = isStyle(input) ? input : cls(input);
    result[variantName as keyof T] = variant;
  }

  return result;
}

/**
 * Variant definition for a recipe.
 * Maps variant names to their possible values and styles.
 */
export type RecipeVariants = Readonly<Record<string, VariantInput>>;

/**
 * Extract the variant selection type from a RecipeVariants definition.
 */
type RecipeVariantSelection<V extends RecipeVariants> = {
  [K in keyof V]?: keyof V[K];
};

/**
 * Compound variant definition - applies styles when multiple variants match.
 */
export type CompoundVariant<V extends RecipeVariants> = {
  readonly variants: RecipeVariantSelection<V>;
  readonly style: Style | Properties;
};

export type CompoundStyle<V extends RecipeVariants> = {
  readonly variants: RecipeVariantSelection<V>;
  readonly style: Style;
};

/**
 * Configuration for the recipe function.
 */
export type RecipeConfig<V extends RecipeVariants> = {
  readonly base: Style | Properties;
  readonly variants?: V;
  readonly compoundVariants?: readonly CompoundVariant<V>[];
};

export type RecipeVariantStyles<V extends RecipeVariants> = {
  readonly [K in keyof V]: { readonly [VK in keyof V[K]]: Style };
};

const RecipeBrand = Symbol("@baetheus/css/core/recipe");

/**
 * Recipe class extends Style and provides variant selection via the `with` method.
 *
 * @since 0.5.0
 */
export class Recipe<V extends RecipeVariants = RecipeVariants> extends Style {
  readonly [RecipeBrand] = null;
  readonly variants: RecipeVariantStyles<V>;
  readonly compounds: readonly CompoundStyle<V>[];

  constructor(
    readonly config: RecipeConfig<V>,
  ) {
    // Create base (some triple hashing here :D
    const base = isStyle(config.base) ? config.base : cls(config.base);
    super(base.name, base.hash, base.selector, base.properties, base.children);

    // Create variant styles
    const variants: Record<string, Record<string, Style>> = {};
    for (const [option, inputs] of Object.entries(config.variants ?? {})) {
      variants[option] = {};
      for (const [name, input] of Object.entries(inputs)) {
        const variant = isStyle(input) ? input : cls(input);
        variants[option][name] = variant;
      }
    }

    // Create compound variant styles
    const compoundInputs = config.compoundVariants ?? [];
    const compounds: CompoundStyle<V>[] = compoundInputs.map(
      (compound) => {
        const compoundStyle = isStyle(compound.style)
          ? compound.style
          : cls(compound.style);
        return { variants: compound.variants, style: compoundStyle };
      },
    );

    this.variants = variants as RecipeVariantStyles<V>;
    this.compounds = compounds;
  }

  /**
   * Select variants and return the combined class names as a space-separated string.
   *
   * @example
   * ```ts
   * const button = recipe({
   *   base: { padding: "1rem" },
   *   variants: {
   *     color: { primary: { background: "blue" }, secondary: { background: "gray" } },
   *     size: { small: { fontSize: "0.875rem" }, large: { fontSize: "1.25rem" } },
   *   },
   *   defaultVariants: { color: "primary" },
   * });
   *
   * button.with({ color: "secondary", size: "large" });
   * // Returns: ".baseHash .secondaryHash .largeHash"
   * ```
   */
  with(selection: RecipeVariantSelection<V> = {}): string {
    const classNames: string[] = [this.name];

    // Add variant class names
    for (const [option, name] of Object.entries(selection)) {
      const variants = this.variants[option];
      const variant = variants[name];
      classNames.push(variant.name);
    }

    // Check compound variants
    for (let i = 0; i < this.compounds.length; i++) {
      const compound = this.compounds[i];
      const matches = Object.entries(compound.variants).every(
        ([key, value]) => selection[key] === value,
      );
      if (matches) {
        classNames.push(this.compounds[i].style.name);
      }
    }

    return classNames.join(" ");
  }
}

/**
 * Type guard to check if a value is a Recipe object.
 *
 * @since 0.5.0
 */
export function isRecipe<V extends RecipeVariants>(
  input: unknown,
): input is Recipe<V> {
  return (
    input !== null && typeof input === "object" &&
    Object.hasOwn(input, RecipeBrand)
  );
}

/**
 * Create a recipe with multi-variant styles.
 *
 * @example
 * ```ts
 * const button = recipe({
 *   base: { borderRadius: "6px" },
 *   variants: {
 *     color: {
 *       neutral: { background: "gray" },
 *       brand: { background: "blue" },
 *     },
 *     size: {
 *       small: { padding: "0.5rem" },
 *       medium: { padding: "1rem" },
 *     },
 *   },
 *   compoundVariants: [
 *     {
 *       variants: { color: "brand", size: "large" },
 *       style: { fontWeight: "bold" },
 *     },
 *   ],
 *   defaultVariants: { color: "neutral", size: "medium" },
 * });
 *
 * // Get base class name
 * button.toString(); // ".abc123"
 *
 * // Get combined class names for variant selection
 * button.with({ color: "brand", size: "small" }); // ".abc123 .def456 .ghi789"
 * ```
 *
 * @since 0.5.0
 */
export function recipe<V extends RecipeVariants>(
  config: RecipeConfig<V>,
): Recipe<V> {
  const _recipe = new Recipe(config);
  return _recipe;
}
