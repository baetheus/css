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

import type * as CSS from "csstype";

export type VariableName = `--${string}`;

export type Variables = { readonly [K in VariableName]: string };

// deno-lint-ignore ban-types
export type Properties<T = 0 | (string & {}), U = string & {}> =
  | CSS.Properties<T, U>
  | Variables;

// deno-lint-ignore ban-types
export type PropertyName<T = 0 | string & {}, U = string & {}> =
  | keyof CSS.Properties<T, U>
  | VariableName;

/**
 * Get the valid values for a CSS property.
 *
 * @since 0.2.0
 */
export type PropertyValue<P = unknown> = P extends keyof CSS.Properties
  ? CSS.Properties[P]
  : string | number;

/**
 * Union type for all selector variants.
 *
 * @since 0.1.0
 */
export type Selector =
  | ElementSelector
  | ClassSelector
  | IdSelector
  | UniversalSelector
  | ParentSelector
  | ComplexSelector;

/**
 * A style rule with selectors and properties.
 *
 * @example
 * ```ts
 * import { styleRule, select, prop } from "./ast.ts";
 *
 * const rule = styleRule(select.cls("button"), [
 *   prop("background", "blue"),
 *   prop("color", "white"),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export type StyleRule = {
  readonly type: "style";
  readonly selectors: readonly Selector[];
  readonly properties: Properties;
};

/**
 * Create a style rule with selectors and properties.
 *
 * @example
 * ```ts
 * import { styleRule, select, prop } from "./ast.ts";
 *
 * const rule = styleRule(select.cls("btn"), [
 *   prop("display", "inline-flex"),
 *   prop("padding", "8px 16px"),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export function styleRule(
  selectors: Selector | Selector[],
  properties: Properties,
): StyleRule {
  return {
    type: "style",
    selectors: Array.isArray(selectors) ? selectors : [selectors],
    properties,
  };
}

/**
 * Properties specific to @font-face rules.
 *
 * @since 0.2.0
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
 * A @font-face rule.
 *
 * @example
 * ```ts
 * import { fontFaceRule } from "./ast.ts";
 *
 * const rule = fontFaceRule({
 *   fontFamily: '"CustomFont"',
 *   src: 'url("/fonts/custom.woff2")',
 * });
 * ```
 *
 * @since 0.1.0
 */
export type FontFaceRule = {
  readonly type: "font-face";
  readonly properties: FontFaceProperties;
};

/**
 * Create a @font-face rule.
 *
 * @example
 * ```ts
 * import { fontFaceRule } from "./ast.ts";
 *
 * const rule = fontFaceRule({
 *   fontFamily: '"Inter"',
 *   src: 'url("/fonts/inter.woff2") format("woff2")',
 *   fontWeight: "400 700",
 * });
 * ```
 *
 * @since 0.1.0
 */
export function fontFaceRule(properties: FontFaceProperties): FontFaceRule {
  return {
    type: "font-face",
    properties,
  };
}

/**
 * A single keyframe within a @keyframes rule.
 *
 * @since 0.1.0
 */
export type KeyframeFrame = {
  readonly offset: string;
  readonly properties: Properties;
};

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
export type KeyframesRule = {
  readonly type: "keyframes";
  readonly name: string;
  readonly frames: readonly KeyframeFrame[];
};

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
  frames: Record<string, Properties>,
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
 * A @layer rule containing nested rules.
 *
 * @example
 * ```ts
 * import { layerRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = layerRule("utilities", [
 *   styleRule(select.cls("hidden"), [prop("display", "none")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export type LayerRule = {
  readonly type: "layer";
  readonly name: string;
  readonly rules: readonly CssRule[];
};

/**
 * Create a @layer rule containing nested rules.
 *
 * @example
 * ```ts
 * import { layerRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = layerRule("components", [
 *   styleRule(select.cls("btn"), [prop("cursor", "pointer")]),
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
export type LayerStatementRule = {
  readonly type: "layer-statement";
  readonly names: readonly string[];
};

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
 * A @media rule with a query and nested rules.
 *
 * @example
 * ```ts
 * import { mediaRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = mediaRule("(min-width: 768px)", [
 *   styleRule(select.cls("container"), [prop("width", "750px")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export type MediaRule = {
  readonly type: "media";
  readonly query: string;
  readonly rules: readonly CssRule[];
};

/**
 * Create a @media rule.
 *
 * @example
 * ```ts
 * import { mediaRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = mediaRule("(prefers-color-scheme: dark)", [
 *   styleRule(select.cls("theme"), [prop("background", "#000")]),
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
 * A @supports rule with a feature query and nested rules.
 *
 * @example
 * ```ts
 * import { supportsRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = supportsRule("(display: grid)", [
 *   styleRule(select.cls("grid"), [prop("display", "grid")]),
 * ]);
 * ```
 *
 * @since 0.1.0
 */
export type SupportsRule = {
  readonly type: "supports";
  readonly query: string;
  readonly rules: readonly CssRule[];
};

/**
 * Create a @supports rule.
 *
 * @example
 * ```ts
 * import { supportsRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = supportsRule("(backdrop-filter: blur(10px))", [
 *   styleRule(select.cls("glass"), [prop("backdrop-filter", "blur(10px)")]),
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
 * A @container rule for container queries.
 *
 * @example
 * ```ts
 * import { containerRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = containerRule("(min-width: 400px)", [
 *   styleRule(select.cls("card"), [prop("flex-direction", "row")]),
 * ], "sidebar");
 * ```
 *
 * @since 0.1.0
 */
export type ContainerRule = {
  readonly type: "container";
  readonly name: string | undefined;
  readonly query: string;
  readonly rules: readonly CssRule[];
};

/**
 * Create a @container rule.
 *
 * @example
 * ```ts
 * import { containerRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = containerRule("(min-width: 300px)", [
 *   styleRule(select.cls("card-body"), [prop("padding", "24px")]),
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
export type PropertyRule = {
  readonly type: "property";
  readonly name: string;
  readonly syntax: string;
  readonly inherits: boolean;
  readonly initialValue?: string;
};

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

/**
 * A @charset rule for declaring character encoding.
 *
 * @example
 * ```ts
 * import { charsetRule } from "./ast.ts";
 *
 * const rule = charsetRule("UTF-8");
 * ```
 *
 * @since 0.2.0
 */
export type CharsetRule = {
  readonly type: "charset";
  readonly encoding: string;
};

/**
 * Create a @charset rule.
 *
 * @example
 * ```ts
 * import { charsetRule } from "./ast.ts";
 *
 * const rule = charsetRule("UTF-8");
 * // @charset "UTF-8";
 * ```
 *
 * @since 0.2.0
 */
export function charsetRule(encoding: string): CharsetRule {
  return {
    type: "charset",
    encoding,
  };
}

/**
 * A @import rule for importing external stylesheets.
 *
 * @example
 * ```ts
 * import { importRule } from "./ast.ts";
 *
 * const rule = importRule("./reset.css");
 * const ruleWithMedia = importRule("./print.css", "print");
 * const ruleWithLayer = importRule("./base.css", undefined, "base");
 * const ruleWithSupports = importRule("./grid.css", undefined, undefined, "(display: grid)");
 * ```
 *
 * @since 0.2.0
 */
export type ImportRule = {
  readonly type: "import";
  readonly url: string;
  readonly media?: string;
  readonly layer?: string | true;
  readonly supports?: string;
};

/**
 * Create a @import rule.
 *
 * @example
 * ```ts
 * import { importRule } from "./ast.ts";
 *
 * importRule("./styles.css");
 * importRule("./print.css", "print");
 * importRule("./base.css", undefined, "utilities");
 * importRule("./base.css", undefined, true); // anonymous layer
 * ```
 *
 * @since 0.2.0
 */
export function importRule(
  url: string,
  media?: string,
  layer?: string | true,
  supports?: string,
): ImportRule {
  return {
    type: "import",
    url,
    ...(media !== undefined && { media }),
    ...(layer !== undefined && { layer }),
    ...(supports !== undefined && { supports }),
  };
}

/**
 * A @namespace rule for declaring XML namespaces.
 *
 * @example
 * ```ts
 * import { namespaceRule } from "./ast.ts";
 *
 * const rule = namespaceRule("http://www.w3.org/1999/xhtml");
 * const svgRule = namespaceRule("http://www.w3.org/2000/svg", "svg");
 * ```
 *
 * @since 0.2.0
 */
export type NamespaceRule = {
  readonly type: "namespace";
  readonly url: string;
  readonly prefix?: string;
};

/**
 * Create a @namespace rule.
 *
 * @example
 * ```ts
 * import { namespaceRule } from "./ast.ts";
 *
 * namespaceRule("http://www.w3.org/1999/xhtml");
 * namespaceRule("http://www.w3.org/2000/svg", "svg");
 * ```
 *
 * @since 0.2.0
 */
export function namespaceRule(url: string, prefix?: string): NamespaceRule {
  return {
    type: "namespace",
    url,
    ...(prefix !== undefined && { prefix }),
  };
}

/**
 * Page selector for @page rules.
 *
 * @since 0.2.0
 */
export type PageSelector =
  | ":first"
  | ":last"
  | ":left"
  | ":right"
  | ":blank"
  | string;

/**
 * A @page rule for print styling.
 *
 * @example
 * ```ts
 * import { pageRule, prop } from "./ast.ts";
 *
 * const rule = pageRule([prop("margin", "2cm")]);
 * const firstPage = pageRule([prop("margin-top", "10cm")], ":first");
 * ```
 *
 * @since 0.2.0
 */
export type PageRule = {
  readonly type: "page";
  readonly selector?: PageSelector;
  readonly properties: Properties;
};

/**
 * Create a @page rule.
 *
 * @example
 * ```ts
 * import { pageRule, prop } from "./ast.ts";
 *
 * pageRule([prop("margin", "2cm")]);
 * pageRule([prop("margin-top", "10cm")], ":first");
 * ```
 *
 * @since 0.2.0
 */
export function pageRule(
  properties: Properties,
  selector?: PageSelector,
): PageRule {
  return {
    type: "page",
    properties,
    ...(selector !== undefined && { selector }),
  };
}

/**
 * Counter style system types.
 *
 * @since 0.2.0
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
 * A @counter-style rule for custom list markers.
 *
 * @example
 * ```ts
 * import { counterStyleRule } from "./ast.ts";
 *
 * const rule = counterStyleRule("thumbs", {
 *   system: "cyclic",
 *   symbols: "\\1F44D",
 *   suffix: " ",
 * });
 * ```
 *
 * @since 0.2.0
 */
export type CounterStyleRule = {
  readonly type: "counter-style";
  readonly name: string;
  readonly descriptors: {
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
};

/**
 * Create a @counter-style rule.
 *
 * @example
 * ```ts
 * import { counterStyleRule } from "./ast.ts";
 *
 * counterStyleRule("emoji", {
 *   system: "cyclic",
 *   symbols: "\\1F600 \\1F601 \\1F602",
 * });
 * ```
 *
 * @since 0.2.0
 */
export function counterStyleRule(
  name: string,
  descriptors: CounterStyleRule["descriptors"],
): CounterStyleRule {
  return {
    type: "counter-style",
    name,
    descriptors,
  };
}

/**
 * Font feature value types.
 *
 * @since 0.2.0
 */
export type FontFeatureValueType =
  | "stylistic"
  | "styleset"
  | "character-variant"
  | "swash"
  | "ornaments"
  | "annotation";

/**
 * A @font-feature-values rule for custom OpenType feature access.
 *
 * @example
 * ```ts
 * import { fontFeatureValuesRule } from "./ast.ts";
 *
 * const rule = fontFeatureValuesRule("Fancy Font", {
 *   stylistic: { cursive: [1] },
 *   swash: { flourish: [2] },
 * });
 * ```
 *
 * @since 0.2.0
 */
export type FontFeatureValuesRule = {
  readonly type: "font-feature-values";
  readonly fontFamily: string;
  readonly values: Partial<
    Record<FontFeatureValueType, Record<string, number[]>>
  >;
};

/**
 * Create a @font-feature-values rule.
 *
 * @example
 * ```ts
 * import { fontFeatureValuesRule } from "./ast.ts";
 *
 * fontFeatureValuesRule("My Font", {
 *   stylistic: { alt: [1] },
 * });
 * ```
 *
 * @since 0.2.0
 */
export function fontFeatureValuesRule(
  fontFamily: string,
  values: FontFeatureValuesRule["values"],
): FontFeatureValuesRule {
  return {
    type: "font-feature-values",
    fontFamily,
    values,
  };
}

/**
 * A @font-palette-values rule for custom color palettes.
 *
 * @example
 * ```ts
 * import { fontPaletteValuesRule } from "./ast.ts";
 *
 * const rule = fontPaletteValuesRule("--my-palette", "Fancy Font", {
 *   basePalette: 1,
 *   overrideColors: { 0: "red", 1: "blue" },
 * });
 * ```
 *
 * @since 0.2.0
 */
export type FontPaletteValuesRule = {
  readonly type: "font-palette-values";
  readonly name: string;
  readonly fontFamily: string;
  readonly descriptors: {
    readonly basePalette?: number | "light" | "dark";
    readonly overrideColors?: Record<number, string>;
  };
};

/**
 * Create a @font-palette-values rule.
 *
 * @example
 * ```ts
 * import { fontPaletteValuesRule } from "./ast.ts";
 *
 * fontPaletteValuesRule("--brand-colors", "Color Font", {
 *   basePalette: "dark",
 *   overrideColors: { 0: "#ff0000" },
 * });
 * ```
 *
 * @since 0.2.0
 */
export function fontPaletteValuesRule(
  name: string,
  fontFamily: string,
  descriptors: FontPaletteValuesRule["descriptors"],
): FontPaletteValuesRule {
  return {
    type: "font-palette-values",
    name,
    fontFamily,
    descriptors,
  };
}

/**
 * Color profile rendering intents.
 *
 * @since 0.2.0
 */
export type ColorProfileRenderingIntent =
  | "relative-colorimetric"
  | "absolute-colorimetric"
  | "perceptual"
  | "saturation";

/**
 * A @color-profile rule for custom color profiles.
 *
 * @example
 * ```ts
 * import { colorProfileRule } from "./ast.ts";
 *
 * const rule = colorProfileRule("--swop5c", "https://example.com/SWOP2006_Coated5v2.icc");
 * ```
 *
 * @since 0.2.0
 */
export type ColorProfileRule = {
  readonly type: "color-profile";
  readonly name: string;
  readonly src: string;
  readonly renderingIntent?: ColorProfileRenderingIntent;
  readonly components?: string;
};

/**
 * Create a @color-profile rule.
 *
 * @example
 * ```ts
 * import { colorProfileRule } from "./ast.ts";
 *
 * colorProfileRule("--srgb", "url('/profiles/sRGB.icc')", "perceptual");
 * ```
 *
 * @since 0.2.0
 */
export function colorProfileRule(
  name: string,
  src: string,
  renderingIntent?: ColorProfileRenderingIntent,
  components?: string,
): ColorProfileRule {
  return {
    type: "color-profile",
    name,
    src,
    ...(renderingIntent !== undefined && { renderingIntent }),
    ...(components !== undefined && { components }),
  };
}

/**
 * A @scope rule for scoped styling.
 *
 * @example
 * ```ts
 * import { scopeRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = scopeRule(".card", ".card-content", [
 *   styleRule(select.el("img"), [prop("border-radius", "8px")]),
 * ]);
 * ```
 *
 * @since 0.2.0
 */
export type ScopeRule = {
  readonly type: "scope";
  readonly start?: string;
  readonly end?: string;
  readonly rules: readonly CssRule[];
};

/**
 * Create a @scope rule.
 *
 * @example
 * ```ts
 * import { scopeRule, styleRule, select, prop } from "./ast.ts";
 *
 * scopeRule(".component", undefined, [
 *   styleRule(select.cls("title"), [prop("font-size", "1.5rem")]),
 * ]);
 *
 * scopeRule(".card", ".footer", [
 *   styleRule(select.el("a"), [prop("color", "blue")]),
 * ]);
 * ```
 *
 * @since 0.2.0
 */
export function scopeRule(
  start: string | undefined,
  end: string | undefined,
  rules: CssRule[],
): ScopeRule {
  return {
    type: "scope",
    ...(start !== undefined && { start }),
    ...(end !== undefined && { end }),
    rules,
  };
}

/**
 * A @starting-style rule for entry animations.
 *
 * @example
 * ```ts
 * import { startingStyleRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = startingStyleRule([
 *   styleRule(select.cls("dialog"), [
 *     prop("opacity", "0"),
 *     prop("transform", "scale(0.9)"),
 *   ]),
 * ]);
 * ```
 *
 * @since 0.2.0
 */
export type StartingStyleRule = {
  readonly type: "starting-style";
  readonly rules: readonly CssRule[];
};

/**
 * Create a @starting-style rule.
 *
 * @example
 * ```ts
 * import { startingStyleRule, styleRule, select, prop } from "./ast.ts";
 *
 * startingStyleRule([
 *   styleRule(select.cls("fade-in"), [prop("opacity", "0")]),
 * ]);
 * ```
 *
 * @since 0.2.0
 */
export function startingStyleRule(rules: CssRule[]): StartingStyleRule {
  return {
    type: "starting-style",
    rules,
  };
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
  | PropertyRule
  | CharsetRule
  | ImportRule
  | NamespaceRule
  | PageRule
  | CounterStyleRule
  | FontFeatureValuesRule
  | FontPaletteValuesRule
  | ColorProfileRule
  | ScopeRule
  | StartingStyleRule;

/**
 * Output from compiling styles, containing class name and rules.
 *
 * @since 0.1.0
 */
export type CompiledStyles = {
  /** The generated class name */
  readonly className: string;
  /** AST rules to render */
  readonly rules: readonly CssRule[];
};

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
export type RenderOptions = {
  /** Space string (default: " ") */
  readonly space: string;
  /** Indentation string (default: "  ") */
  readonly indent: string;
  /** Newline string (default: "\n") */
  readonly newline: string;
};
export const MINIMAL_RENDER_OPTIONS: RenderOptions = {
  space: "",
  indent: "",
  newline: "",
};
export const NORMAL_RENDER_OPTIONS: RenderOptions = {
  space: " ",
  indent: "  ",
  newline: "\n",
};
export const DEFAULT_RENDER_OPTIONS = MINIMAL_RENDER_OPTIONS;

/**
 * Resolve partial render options with defaults.
 *
 * @example
 * ```ts
 * import { resolveOptions, NORMAL_RENDER_OPTIONS } from "./ast.ts";
 *
 * resolveOptions();                           // uses MINIMAL defaults
 * resolveOptions({ indent: "  " });           // override indent only
 * resolveOptions(NORMAL_RENDER_OPTIONS);      // use normal formatting
 * ```
 *
 * @since 0.1.0
 */
export function resolveOptions(
  {
    space = DEFAULT_RENDER_OPTIONS.space,
    indent = DEFAULT_RENDER_OPTIONS.indent,
    newline = DEFAULT_RENDER_OPTIONS.newline,
  }: Partial<RenderOptions> = DEFAULT_RENDER_OPTIONS,
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
export function renderValue(value: PropertyValue): string {
  return String(value);
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
export function renderProperty<T extends PropertyName>(
  name: T,
  value: PropertyValue<T>,
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
  depth = 0,
): string {
  // Don't convert CSS custom properties (--varName) to kebab-case
  const _name = name.startsWith("--") ? name : camelToKebab(name);
  return `${
    options.indent.repeat(depth)
  }${_name}:${options.space}${value};${options.newline}`;
}

/**
 * Render a properties object to CSS declaration string.
 *
 * @example
 * ```ts
 * import { renderProperties, NORMAL_RENDER_OPTIONS } from "./ast.ts";
 *
 * renderProperties({ color: "red", padding: "10px" }, NORMAL_RENDER_OPTIONS, 1);
 * // "  color: red;\n  padding: 10px;\n"
 * ```
 *
 * @since 0.1.0
 */
export function renderProperties(
  properties: Properties,
  options = DEFAULT_RENDER_OPTIONS,
  depth = 0,
): string {
  let result = "";
  for (const [key, value] of Object.entries(properties)) {
    result += renderProperty(key as PropertyName, value, options, depth);
  }
  return result;
}

/**
 * Render font-face properties to CSS declaration string.
 *
 * @internal
 */
function renderFontFaceProperties(
  properties: FontFaceProperties,
  options = DEFAULT_RENDER_OPTIONS,
  depth = 0,
): string {
  let result = "";
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) {
      const name = camelToKebab(key);
      result += `${
        options.indent.repeat(depth)
      }${name}:${options.space}${value};`;
    }
  }
  return result;
}

/**
 * Sort modifiers in the correct CSS order:
 * classes → attributes → pseudo-classes → pseudo-element → at-rules
 *
 * @internal
 */
function sortModifiers(modifiers: readonly SelectorMod[]): SelectorMod[] {
  const order: Record<SelectorMod["type"], number> = {
    "class-mod": 0,
    "attr-mod": 1,
    "pseudo-class-mod": 2,
    "pseudo-element-mod": 3,
    "media-mod": 4,
    "supports-mod": 5,
    "container-mod": 6,
    "layer-mod": 7,
  };
  return [...modifiers].sort((a, b) => order[a.type] - order[b.type]);
}

/**
 * Render a single modifier to a string.
 *
 * @internal
 */
function renderModifier(mod: SelectorMod): string {
  switch (mod.type) {
    case "class-mod":
      return `.${mod.name}`;
    case "attr-mod": {
      if (mod.op !== undefined && mod.value !== undefined) {
        const i = mod.insensitive ? " i" : "";
        return `[${mod.name}${mod.op}"${mod.value}"${i}]`;
      }
      return `[${mod.name}]`;
    }
    case "pseudo-class-mod": {
      if (mod.arg !== undefined) {
        if (Array.isArray(mod.arg)) {
          // Selector list argument (for :is, :where, :not, :has)
          const selectors = mod.arg.map(renderSelector).join(", ");
          return `:${mod.name}(${selectors})`;
        }
        return `:${mod.name}(${mod.arg})`;
      }
      return `:${mod.name}`;
    }
    case "pseudo-element-mod":
      return `::${mod.name}`;
    case "media-mod":
      return `@media ${mod.query}`;
    case "supports-mod":
      return `@supports ${mod.query}`;
    case "container-mod":
      return mod.name
        ? `@container ${mod.name} ${mod.query}`
        : `@container ${mod.query}`;
    case "layer-mod":
      return `@layer ${mod.name}`;
  }
}

/**
 * Render modifiers to a string, sorted in correct CSS order.
 *
 * @internal
 */
function renderModifiers(modifiers: readonly SelectorMod[]): string {
  return sortModifiers(modifiers).map(renderModifier).join("");
}

/**
 * Render a selector to a string.
 *
 * @example
 * ```ts
 * import { renderSelector, select } from "./ast.ts";
 *
 * renderSelector(select.cls("btn"));                           // ".btn"
 * renderSelector(select.cls("btn", select.pseudoClass("hover"))); // ".btn:hover"
 * renderSelector(select.descendant(select.cls("nav"), select.el("a"))); // ".nav a"
 * renderSelector(select.el("div", select.class_("active")));   // "div.active"
 * ```
 *
 * @since 0.1.0
 */
export function renderSelector(selector: Selector): string {
  switch (selector.type) {
    case "element":
      return `${selector.name}${renderModifiers(selector.modifiers)}`;
    case "class-selector":
      return `.${selector.name}${renderModifiers(selector.modifiers)}`;
    case "id-selector":
      return `#${selector.name}${renderModifiers(selector.modifiers)}`;
    case "universal-selector":
      return `*${renderModifiers(selector.modifiers)}`;
    case "parent-selector":
      return `&${renderModifiers(selector.modifiers)}`;
    case "complex": {
      const left = renderSelector(selector.left);
      const right = renderSelector(selector.right);
      if (selector.combinator === " ") {
        return `${left} ${right}`;
      }
      return `${left} ${selector.combinator} ${right}`;
    }
  }
}

/**
 * Render a CSS rule to a string.
 *
 * @example
 * ```ts
 * import { renderRule, styleRule, select, prop } from "./ast.ts";
 *
 * const rule = styleRule(select.cls("btn"), [prop("color", "blue")]);
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
  const propSep = ";";

  switch (rule.type) {
    case "style": {
      const selectors = rule.selectors.map(renderSelector).join(`,${space}`);
      const props = renderProperties(rule.properties, opts, depth + 1);
      return `${baseIndent}${selectors}${space}{${newline}${props}${baseIndent}}`;
    }

    case "font-face": {
      const props = renderFontFaceProperties(rule.properties, opts, depth + 1);
      return `${baseIndent}@font-face${space}{${newline}${props}${baseIndent}}`;
    }

    case "keyframes": {
      const frames = rule.frames
        .map((frame) => {
          const frameIndent = indent.repeat(depth + 1);
          const props = renderProperties(frame.properties, opts, depth + 2);
          return `${frameIndent}${frame.offset}${space}{${newline}${props}${frameIndent}}`;
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

    case "charset": {
      return `${baseIndent}@charset "${rule.encoding}";`;
    }

    case "import": {
      let result = `${baseIndent}@import url("${rule.url}")`;
      if (rule.layer !== undefined) {
        result += rule.layer === true ? " layer" : ` layer(${rule.layer})`;
      }
      if (rule.supports !== undefined) {
        result += ` supports(${rule.supports})`;
      }
      if (rule.media !== undefined) {
        result += ` ${rule.media}`;
      }
      return `${result};`;
    }

    case "namespace": {
      if (rule.prefix !== undefined) {
        return `${baseIndent}@namespace ${rule.prefix} url("${rule.url}");`;
      }
      return `${baseIndent}@namespace url("${rule.url}");`;
    }

    case "page": {
      const selector = rule.selector !== undefined ? ` ${rule.selector}` : "";
      const props = renderProperties(rule.properties, opts, depth + 1);
      return `${baseIndent}@page${selector}${space}{${newline}${props}${baseIndent}}`;
    }

    case "counter-style": {
      const descriptors: string[] = [];
      const d = rule.descriptors;
      if (d.system !== undefined) {
        descriptors.push(`${innerIndent}system: ${d.system}`);
      }
      if (d.symbols !== undefined) {
        descriptors.push(`${innerIndent}symbols: ${d.symbols}`);
      }
      if (d.additiveSymbols !== undefined) {
        descriptors.push(
          `${innerIndent}additive-symbols: ${d.additiveSymbols}`,
        );
      }
      if (d.negative !== undefined) {
        descriptors.push(`${innerIndent}negative: ${d.negative}`);
      }
      if (d.prefix !== undefined) {
        descriptors.push(`${innerIndent}prefix: "${d.prefix}"`);
      }
      if (d.suffix !== undefined) {
        descriptors.push(`${innerIndent}suffix: "${d.suffix}"`);
      }
      if (d.range !== undefined) {
        descriptors.push(`${innerIndent}range: ${d.range}`);
      }
      if (d.pad !== undefined) descriptors.push(`${innerIndent}pad: ${d.pad}`);
      if (d.fallback !== undefined) {
        descriptors.push(`${innerIndent}fallback: ${d.fallback}`);
      }
      if (d.speakAs !== undefined) {
        descriptors.push(`${innerIndent}speak-as: ${d.speakAs}`);
      }
      return `${baseIndent}@counter-style ${rule.name}${space}{${newline}${
        descriptors.join(propSep)
      }${propSep}${baseIndent}}`;
    }

    case "font-feature-values": {
      const blocks: string[] = [];
      const blockIndent = indent.repeat(depth + 1);
      const valueIndent = indent.repeat(depth + 2);
      for (const [blockType, values] of Object.entries(rule.values)) {
        if (values) {
          const entries = Object.entries(values)
            .map(([name, nums]) => `${valueIndent}${name}: ${nums.join(" ")}`)
            .join(propSep);
          blocks.push(
            `${blockIndent}@${blockType}${space}{${newline}${entries}${propSep}${blockIndent}}`,
          );
        }
      }
      return `${baseIndent}@font-feature-values ${rule.fontFamily}${space}{${newline}${
        blocks.join(newline)
      }${newline}${baseIndent}}`;
    }

    case "font-palette-values": {
      const descriptors: string[] = [];
      descriptors.push(`${innerIndent}font-family: ${rule.fontFamily}`);
      const d = rule.descriptors;
      if (d.basePalette !== undefined) {
        descriptors.push(`${innerIndent}base-palette: ${d.basePalette}`);
      }
      if (d.overrideColors !== undefined) {
        const overrides = Object.entries(d.overrideColors)
          .map(([idx, color]) => `${idx} ${color}`)
          .join(", ");
        descriptors.push(`${innerIndent}override-colors: ${overrides}`);
      }
      return `${baseIndent}@font-palette-values ${rule.name}${space}{${newline}${
        descriptors.join(propSep)
      }${propSep}${baseIndent}}`;
    }

    case "color-profile": {
      const descriptors: string[] = [
        `${innerIndent}src: ${rule.src}`,
      ];
      if (rule.renderingIntent !== undefined) {
        descriptors.push(
          `${innerIndent}rendering-intent: ${rule.renderingIntent}`,
        );
      }
      if (rule.components !== undefined) {
        descriptors.push(`${innerIndent}components: ${rule.components}`);
      }
      return `${baseIndent}@color-profile ${rule.name}${space}{${newline}${
        descriptors.join(propSep)
      }${propSep}${baseIndent}}`;
    }

    case "scope": {
      let scopeHeader = "@scope";
      if (rule.start !== undefined) {
        scopeHeader += ` (${rule.start})`;
      }
      if (rule.end !== undefined) {
        scopeHeader += ` to (${rule.end})`;
      }
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}${scopeHeader}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "starting-style": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@starting-style${space}{${newline}${nested}${newline}${baseIndent}}`;
    }
  }
}

/**
 * Render a complete CSS document to a string.
 *
 * @example
 * ```ts
 * import { renderCss, styleRule, select, prop } from "./ast.ts";
 *
 * const doc = {
 *   rules: [
 *     styleRule(select.cls("a"), [prop("color", "red")]),
 *     styleRule(select.cls("b"), [prop("color", "blue")]),
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

// =============================================================================
// Type-Safe Selector Combinators
// =============================================================================

/**
 * All valid HTML element names.
 *
 * @since 0.2.0
 */
export type HtmlElement =
  // Document metadata
  | "html"
  | "head"
  | "title"
  | "base"
  | "link"
  | "meta"
  | "style"
  // Sectioning
  | "body"
  | "article"
  | "section"
  | "nav"
  | "aside"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "hgroup"
  | "header"
  | "footer"
  | "address"
  | "main"
  // Grouping
  | "p"
  | "hr"
  | "pre"
  | "blockquote"
  | "ol"
  | "ul"
  | "menu"
  | "li"
  | "dl"
  | "dt"
  | "dd"
  | "figure"
  | "figcaption"
  | "div"
  // Text-level
  | "a"
  | "em"
  | "strong"
  | "small"
  | "s"
  | "cite"
  | "q"
  | "dfn"
  | "abbr"
  | "ruby"
  | "rt"
  | "rp"
  | "data"
  | "time"
  | "code"
  | "var"
  | "samp"
  | "kbd"
  | "sub"
  | "sup"
  | "i"
  | "b"
  | "u"
  | "mark"
  | "bdi"
  | "bdo"
  | "span"
  | "br"
  | "wbr"
  // Edits
  | "ins"
  | "del"
  // Embedded
  | "picture"
  | "source"
  | "img"
  | "iframe"
  | "embed"
  | "object"
  | "param"
  | "video"
  | "audio"
  | "track"
  | "map"
  | "area"
  | "canvas"
  // Tabular
  | "table"
  | "caption"
  | "colgroup"
  | "col"
  | "tbody"
  | "thead"
  | "tfoot"
  | "tr"
  | "td"
  | "th"
  // Forms
  | "form"
  | "label"
  | "input"
  | "button"
  | "select"
  | "datalist"
  | "optgroup"
  | "option"
  | "textarea"
  | "output"
  | "progress"
  | "meter"
  | "fieldset"
  | "legend"
  // Interactive
  | "details"
  | "summary"
  | "dialog"
  // Scripting
  | "script"
  | "noscript"
  | "template"
  | "slot"
  // SVG
  | "svg"
  | "g"
  | "path"
  | "circle"
  | "ellipse"
  | "line"
  | "polyline"
  | "polygon"
  | "rect"
  | "text"
  | "tspan"
  | "textPath"
  | "image"
  | "use"
  | "defs"
  | "symbol"
  | "clipPath"
  | "mask"
  | "pattern"
  | "marker"
  | "linearGradient"
  | "radialGradient"
  | "stop"
  | "filter"
  | "feBlend"
  | "feColorMatrix"
  | "feGaussianBlur"
  | "foreignObject"
  // MathML
  | "math"
  | "mi"
  | "mn"
  | "mo"
  | "ms"
  | "mtext"
  | "mrow"
  | "mfrac"
  | "msqrt"
  | "mroot"
  | "msub"
  | "msup"
  | "msubsup"
  | "munder"
  | "mover"
  | "munderover"
  | "mtable"
  | "mtr"
  | "mtd";

/**
 * Global HTML attributes that apply to all elements.
 *
 * @since 0.2.0
 */
export type GlobalAttribute =
  | "id"
  | "class"
  | "style"
  | "title"
  | "lang"
  | "dir"
  | "hidden"
  | "tabindex"
  | "accesskey"
  | "contenteditable"
  | "draggable"
  | "spellcheck"
  | "translate"
  | "inert"
  | "popover"
  | "autofocus"
  | "slot"
  | "part"
  | "exportparts"
  | "inputmode"
  | "enterkeyhint"
  | "is"
  | "itemid"
  | "itemprop"
  | "itemref"
  | "itemscope"
  | "itemtype"
  | "nonce";

/**
 * Element-specific attributes mapping.
 *
 * @since 0.2.0
 */
export type ElementAttributes = {
  a:
    | "href"
    | "target"
    | "rel"
    | "download"
    | "hreflang"
    | "type"
    | "referrerpolicy"
    | "ping";
  abbr: never;
  address: never;
  area:
    | "alt"
    | "coords"
    | "shape"
    | "href"
    | "target"
    | "download"
    | "rel"
    | "referrerpolicy";
  article: never;
  aside: never;
  audio:
    | "src"
    | "controls"
    | "autoplay"
    | "loop"
    | "muted"
    | "preload"
    | "crossorigin";
  b: never;
  base: "href" | "target";
  bdi: never;
  bdo: never;
  blockquote: "cite";
  body: never;
  br: never;
  button:
    | "type"
    | "name"
    | "value"
    | "disabled"
    | "form"
    | "formaction"
    | "formmethod"
    | "formenctype"
    | "formnovalidate"
    | "formtarget"
    | "popovertarget"
    | "popovertargetaction";
  canvas: "width" | "height";
  caption: never;
  cite: never;
  code: never;
  col: "span";
  colgroup: "span";
  data: "value";
  datalist: never;
  dd: never;
  del: "cite" | "datetime";
  details: "open" | "name";
  dfn: never;
  dialog: "open";
  div: never;
  dl: never;
  dt: never;
  em: never;
  embed: "src" | "type" | "width" | "height";
  fieldset: "disabled" | "form" | "name";
  figcaption: never;
  figure: never;
  footer: never;
  form:
    | "action"
    | "method"
    | "enctype"
    | "target"
    | "autocomplete"
    | "novalidate"
    | "accept-charset"
    | "rel"
    | "name";
  h1: never;
  h2: never;
  h3: never;
  h4: never;
  h5: never;
  h6: never;
  head: never;
  header: never;
  hgroup: never;
  hr: never;
  html: "xmlns";
  i: never;
  iframe:
    | "src"
    | "srcdoc"
    | "name"
    | "width"
    | "height"
    | "sandbox"
    | "allow"
    | "allowfullscreen"
    | "loading"
    | "referrerpolicy";
  img:
    | "src"
    | "srcset"
    | "sizes"
    | "alt"
    | "width"
    | "height"
    | "loading"
    | "decoding"
    | "crossorigin"
    | "usemap"
    | "ismap"
    | "fetchpriority";
  input:
    | "type"
    | "name"
    | "value"
    | "placeholder"
    | "required"
    | "disabled"
    | "readonly"
    | "checked"
    | "min"
    | "max"
    | "minlength"
    | "maxlength"
    | "step"
    | "pattern"
    | "multiple"
    | "accept"
    | "autocomplete"
    | "form"
    | "list"
    | "size"
    | "width"
    | "height"
    | "src"
    | "alt"
    | "capture"
    | "dirname"
    | "formaction"
    | "formmethod"
    | "formenctype"
    | "formnovalidate"
    | "formtarget"
    | "popovertarget"
    | "popovertargetaction";
  ins: "cite" | "datetime";
  kbd: never;
  label: "for" | "form";
  legend: never;
  li: "value";
  link:
    | "href"
    | "rel"
    | "type"
    | "media"
    | "sizes"
    | "as"
    | "crossorigin"
    | "integrity"
    | "referrerpolicy"
    | "fetchpriority"
    | "blocking"
    | "disabled"
    | "hreflang"
    | "imagesizes"
    | "imagesrcset";
  main: never;
  map: "name";
  mark: never;
  menu: never;
  meta: "name" | "content" | "charset" | "http-equiv" | "media";
  meter: "value" | "min" | "max" | "low" | "high" | "optimum";
  nav: never;
  noscript: never;
  object: "data" | "type" | "name" | "width" | "height" | "form";
  ol: "reversed" | "start" | "type";
  optgroup: "disabled" | "label";
  option: "value" | "selected" | "disabled" | "label";
  output: "for" | "form" | "name";
  p: never;
  param: "name" | "value";
  picture: never;
  pre: never;
  progress: "value" | "max";
  q: "cite";
  rp: never;
  rt: never;
  ruby: never;
  s: never;
  samp: never;
  script:
    | "src"
    | "type"
    | "async"
    | "defer"
    | "crossorigin"
    | "integrity"
    | "nomodule"
    | "referrerpolicy"
    | "blocking"
    | "fetchpriority";
  section: never;
  select:
    | "name"
    | "multiple"
    | "size"
    | "required"
    | "disabled"
    | "autocomplete"
    | "form";
  slot: "name";
  small: never;
  source: "src" | "srcset" | "sizes" | "type" | "media" | "width" | "height";
  span: never;
  strong: never;
  style: "media" | "blocking";
  sub: never;
  summary: never;
  sup: never;
  table: never;
  tbody: never;
  td: "colspan" | "rowspan" | "headers";
  template:
    | "shadowrootmode"
    | "shadowrootclonable"
    | "shadowrootdelegatesfocus";
  textarea:
    | "name"
    | "rows"
    | "cols"
    | "placeholder"
    | "required"
    | "disabled"
    | "readonly"
    | "minlength"
    | "maxlength"
    | "wrap"
    | "autocomplete"
    | "form"
    | "dirname";
  tfoot: never;
  th: "colspan" | "rowspan" | "headers" | "scope" | "abbr";
  thead: never;
  time: "datetime";
  title: never;
  tr: never;
  track: "src" | "kind" | "srclang" | "label" | "default";
  u: never;
  ul: never;
  var: never;
  video:
    | "src"
    | "poster"
    | "width"
    | "height"
    | "controls"
    | "autoplay"
    | "loop"
    | "muted"
    | "preload"
    | "playsinline"
    | "crossorigin";
  wbr: never;
  // SVG elements with common attributes
  svg:
    | "viewBox"
    | "width"
    | "height"
    | "xmlns"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "preserveAspectRatio";
  g: "fill" | "stroke" | "stroke-width" | "transform" | "opacity";
  path:
    | "d"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "stroke-linecap"
    | "stroke-linejoin"
    | "transform"
    | "opacity";
  circle:
    | "cx"
    | "cy"
    | "r"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "transform"
    | "opacity";
  ellipse:
    | "cx"
    | "cy"
    | "rx"
    | "ry"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "transform"
    | "opacity";
  line:
    | "x1"
    | "y1"
    | "x2"
    | "y2"
    | "stroke"
    | "stroke-width"
    | "stroke-linecap"
    | "transform"
    | "opacity";
  polyline:
    | "points"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "stroke-linecap"
    | "stroke-linejoin"
    | "transform"
    | "opacity";
  polygon:
    | "points"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "stroke-linejoin"
    | "transform"
    | "opacity";
  rect:
    | "x"
    | "y"
    | "width"
    | "height"
    | "rx"
    | "ry"
    | "fill"
    | "stroke"
    | "stroke-width"
    | "transform"
    | "opacity";
  text:
    | "x"
    | "y"
    | "dx"
    | "dy"
    | "text-anchor"
    | "dominant-baseline"
    | "fill"
    | "font-size"
    | "font-family"
    | "transform"
    | "opacity";
  tspan:
    | "x"
    | "y"
    | "dx"
    | "dy"
    | "text-anchor"
    | "dominant-baseline"
    | "fill"
    | "font-size"
    | "font-family";
  textPath: "href" | "startOffset" | "method" | "spacing";
  image:
    | "href"
    | "x"
    | "y"
    | "width"
    | "height"
    | "preserveAspectRatio"
    | "crossorigin";
  use: "href" | "x" | "y" | "width" | "height";
  defs: never;
  symbol: "viewBox" | "preserveAspectRatio";
  clipPath: "clipPathUnits";
  mask: "x" | "y" | "width" | "height" | "maskUnits" | "maskContentUnits";
  pattern:
    | "x"
    | "y"
    | "width"
    | "height"
    | "patternUnits"
    | "patternContentUnits"
    | "patternTransform"
    | "href";
  marker:
    | "viewBox"
    | "preserveAspectRatio"
    | "refX"
    | "refY"
    | "markerUnits"
    | "markerWidth"
    | "markerHeight"
    | "orient";
  linearGradient:
    | "x1"
    | "y1"
    | "x2"
    | "y2"
    | "gradientUnits"
    | "gradientTransform"
    | "spreadMethod"
    | "href";
  radialGradient:
    | "cx"
    | "cy"
    | "r"
    | "fx"
    | "fy"
    | "fr"
    | "gradientUnits"
    | "gradientTransform"
    | "spreadMethod"
    | "href";
  stop: "offset" | "stop-color" | "stop-opacity";
  filter: "x" | "y" | "width" | "height" | "filterUnits" | "primitiveUnits";
  feBlend: "in" | "in2" | "mode";
  feColorMatrix: "in" | "type" | "values";
  feGaussianBlur: "in" | "stdDeviation";
  foreignObject: "x" | "y" | "width" | "height";
  // MathML elements
  math: "display" | "xmlns";
  mi: never;
  mn: never;
  mo: "stretchy" | "fence" | "separator" | "lspace" | "rspace";
  ms: never;
  mtext: never;
  mrow: never;
  mfrac: "linethickness";
  msqrt: never;
  mroot: never;
  msub: never;
  msup: never;
  msubsup: never;
  munder: never;
  mover: never;
  munderover: never;
  mtable: never;
  mtr: never;
  mtd: "columnspan" | "rowspan";
};

export type Attributes =
  | GlobalAttribute
  | ElementAttributes[keyof ElementAttributes];

/**
 * Get valid attributes for an element (global + element-specific).
 *
 * @since 0.2.0
 */
export type AttributeFor<E extends string = string> = E extends HtmlElement
  ? ElementAttributes[E]
  : GlobalAttribute;

/**
 * Simple pseudo-classes that take no arguments.
 *
 * @since 0.2.0
 */
export type SimplePseudoClass =
  // User action
  | "hover"
  | "active"
  | "focus"
  | "focus-visible"
  | "focus-within"
  // Link
  | "link"
  | "visited"
  | "any-link"
  | "local-link"
  | "target"
  | "target-within"
  // Input state
  | "enabled"
  | "disabled"
  | "read-only"
  | "read-write"
  | "placeholder-shown"
  | "autofill"
  | "default"
  | "checked"
  | "indeterminate"
  // Validation
  | "valid"
  | "invalid"
  | "in-range"
  | "out-of-range"
  | "required"
  | "optional"
  | "user-valid"
  | "user-invalid"
  // Tree-structural
  | "root"
  | "empty"
  | "first-child"
  | "last-child"
  | "only-child"
  | "first-of-type"
  | "last-of-type"
  | "only-of-type"
  // Resource state
  | "playing"
  | "paused"
  | "seeking"
  | "buffering"
  | "stalled"
  | "muted"
  | "volume-locked"
  // Time-dimensional
  | "current"
  | "past"
  | "future"
  // Display state
  | "fullscreen"
  | "modal"
  | "picture-in-picture"
  | "open"
  | "closed"
  | "popover-open"
  // Printing
  | "first"
  | "left"
  | "right"
  | "blank"
  // Misc
  | "defined"
  | "scope";

/**
 * Pseudo-classes that require an argument.
 *
 * @since 0.2.0
 */
export type ParameterizedPseudoClass =
  | "nth-child"
  | "nth-last-child"
  | "nth-of-type"
  | "nth-last-of-type"
  | "is"
  | "where"
  | "not"
  | "has"
  | "lang"
  | "dir"
  | "host"
  | "host-context"
  | "state";

/**
 * All pseudo-class names.
 *
 * @since 0.2.0
 */
export type PseudoClassName = SimplePseudoClass | ParameterizedPseudoClass;

/**
 * All pseudo-element names.
 *
 * @since 0.2.0
 */
export type PseudoElementName =
  | "before"
  | "after"
  | "first-line"
  | "first-letter"
  | "marker"
  | "placeholder"
  | "selection"
  | "backdrop"
  | "cue"
  | "cue-region"
  | "file-selector-button"
  | "target-text"
  | "spelling-error"
  | "grammar-error"
  | "highlight"
  | "view-transition"
  | "view-transition-group"
  | "view-transition-image-pair"
  | "view-transition-old"
  | "view-transition-new";

// =============================================================================
// Selector Modifier Types
// =============================================================================

/**
 * Attribute selector operators.
 *
 * @since 0.2.0
 */
export type AttrOp = "=" | "^=" | "$=" | "*=" | "~=" | "|=";

/**
 * A class modifier that adds a class to a selector.
 *
 * @since 0.2.0
 */
export type ClassMod = {
  readonly type: "class-mod";
  readonly name: string;
};

/**
 * An attribute modifier that adds an attribute selector.
 *
 * @since 0.2.0
 */
export type AttrMod<A extends string = string> = {
  readonly type: "attr-mod";
  readonly name: A;
  readonly op?: AttrOp;
  readonly value?: string;
  readonly insensitive?: boolean;
};

/**
 * A pseudo-class modifier.
 *
 * @since 0.2.0
 */
export type PseudoClassMod = {
  readonly type: "pseudo-class-mod";
  readonly name: PseudoClassName;
  readonly arg?: string | readonly Selector[];
};

/**
 * A pseudo-element modifier.
 *
 * @since 0.2.0
 */
export type PseudoElementMod = {
  readonly type: "pseudo-element-mod";
  readonly name: PseudoElementName;
};

/**
 * A @media at-rule modifier.
 *
 * @since 0.3.0
 */
export type MediaMod = {
  readonly type: "media-mod";
  readonly query: string;
};

/**
 * A @supports at-rule modifier.
 *
 * @since 0.3.0
 */
export type SupportsMod = {
  readonly type: "supports-mod";
  readonly query: string;
};

/**
 * A @container at-rule modifier.
 *
 * @since 0.3.0
 */
export type ContainerMod = {
  readonly type: "container-mod";
  readonly name?: string;
  readonly query: string;
};

/**
 * A @layer at-rule modifier.
 *
 * @since 0.3.0
 */
export type LayerMod = {
  readonly type: "layer-mod";
  readonly name: string;
};

/**
 * Union type for all at-rule modifiers.
 *
 * @since 0.3.0
 */
export type AtRuleMod = MediaMod | SupportsMod | ContainerMod | LayerMod;

/**
 * Modifier type for element selectors with type-safe attributes.
 *
 * When E is an HtmlElement, allows global attributes plus element-specific attributes.
 * Otherwise allows any attribute string.
 *
 * @since 0.2.0
 */
export type SelectorMod<E extends string = string> =
  | ClassMod
  | AttrMod<
    E extends HtmlElement ? GlobalAttribute | ElementAttributes[E] : Attributes
  >
  | PseudoClassMod
  | PseudoElementMod
  | AtRuleMod;

/**
 * String key types for modifications record.
 *
 * @since 0.3.0
 */
export type PseudoClassKey = `:${SimplePseudoClass}`;
export type PseudoClassArgKey = `:${ParameterizedPseudoClass}(${string})`;
export type PseudoElementKey = `::${PseudoElementName}`;
export type AttrExistsKey<A extends CSS.HtmlAttributes> = `[${A}]`;
export type AttrValueKey<A extends CSS.HtmlAttributes> =
  | `[${A}="${string}"]`
  | `[${A}^="${string}"]`
  | `[${A}$="${string}"]`
  | `[${A}*="${string}"]`
  | `[${A}~="${string}"]`
  | `[${A}|="${string}"]`;
export type AttrKey<A extends CSS.HtmlAttributes> =
  | AttrExistsKey<A>
  | AttrValueKey<A>;
export type MediaKey = `@media ${string}`;
export type SupportsKey = `@supports ${string}`;
export type ContainerKey = `@container ${string}`;
export type LayerKey = `@layer ${string}`;

export type ModificationKey<A extends CSS.HtmlAttributes> =
  | PseudoClassKey
  | PseudoClassArgKey
  | PseudoElementKey
  | AttrKey<A>
  | MediaKey
  | SupportsKey
  | ContainerKey
  | LayerKey;

/**
 * A record type for style modifications (pseudos, attrs, at-rules).
 *
 * @example
 * ```ts
 * const mods: Modifications<Properties> = {
 *   ":hover": { backgroundColor: "blue" },
 *   "::before": { content: '""' },
 *   "[disabled]": { opacity: 0.5 },
 *   "@media (min-width: 768px)": { padding: 16 },
 * };
 * ```
 *
 * @since 0.3.0
 */
export type Modifications<
  T,
  A extends CSS.HtmlAttributes = CSS.HtmlAttributes,
> = {
  readonly [K in ModificationKey<A>]?: T;
};

// =============================================================================
// New Selector Types with Modifier Support
// =============================================================================

/**
 * An element selector with optional modifiers.
 *
 * @example
 * ```ts
 * // div.active:hover
 * select.el("div", select.class_("active"), select.pseudoClass("hover"))
 * ```
 *
 * @since 0.2.0
 */
export type ElementSelector = {
  readonly type: "element";
  readonly name: HtmlElement;
  readonly modifiers: readonly SelectorMod[];
};

/**
 * A class selector with optional modifiers.
 *
 * @example
 * ```ts
 * // .button:disabled
 * select.cls("button", select.pseudoClass("disabled"))
 * ```
 *
 * @since 0.2.0
 */
export type ClassSelector = {
  readonly type: "class-selector";
  readonly name: string;
  readonly modifiers: readonly SelectorMod[];
};

/**
 * An ID selector with optional modifiers.
 *
 * @example
 * ```ts
 * // #main:target
 * select.id("main", select.pseudoClass("target"))
 * ```
 *
 * @since 0.2.0
 */
export type IdSelector = {
  readonly type: "id-selector";
  readonly name: string;
  readonly modifiers: readonly SelectorMod[];
};

/**
 * A universal selector with optional modifiers.
 *
 * @example
 * ```ts
 * // *:first-child
 * select.universal(select.pseudoClass("first-child"))
 * ```
 *
 * @since 0.2.0
 */
export type UniversalSelector = {
  readonly type: "universal-selector";
  readonly modifiers: readonly SelectorMod[];
};

/**
 * A parent/nesting selector (&) with optional modifiers.
 *
 * @example
 * ```ts
 * // &:hover
 * select.parent(select.pseudoClass("hover"))
 * ```
 *
 * @since 0.2.0
 */
export type ParentSelector = {
  readonly type: "parent-selector";
  readonly modifiers: readonly SelectorMod[];
};

export type ComplexSelector = {
  readonly type: "complex";
  readonly left: Selector;
  readonly combinator: " " | ">" | "+" | "~";
  readonly right: Selector;
};

/**
 * Union type for all new selector variants with modifier support.
 *
 * @since 0.2.0
 */
export type ModSelector =
  | ElementSelector
  | ClassSelector
  | IdSelector
  | UniversalSelector
  | ParentSelector;

// =============================================================================
// Type-Safe Selector Builder
// =============================================================================

/**
 * Type-safe selector builder with support for element-specific attributes,
 * pseudo-classes, pseudo-elements, and combinators.
 *
 * Modifiers are automatically sorted during rendering:
 * classes → attributes → pseudo-classes → pseudo-element
 *
 * Note: Only one pseudo-element is allowed per selector (CSS spec).
 *
 * @example
 * ```ts
 * import { select, styleRule, prop } from "./ast.ts";
 *
 * // Element with type-safe attributes
 * select.el("a", select.attr("href"), select.pseudoClass("hover"))
 * // → a[href]:hover
 *
 * // Class selector with pseudo-class
 * select.cls("button", select.pseudoClass("disabled"))
 * // → .button:disabled
 *
 * // Combinator
 * select.descendant(select.el("nav"), select.el("a"))
 * // → nav a
 *
 * // Complex selector
 * select.child(
 *   select.el("ul", select.class_("menu")),
 *   select.el("li", select.pseudoClass("first-child"))
 * )
 * // → ul.menu > li:first-child
 * ```
 *
 * @since 0.2.0
 */
export class select {
  private constructor() {} // Prevent instantiation

  // ===========================================================================
  // Selector Builders
  // ===========================================================================

  /**
   * Create an element selector with optional modifiers.
   *
   * @example
   * ```ts
   * select.el("div")                           // div
   * select.el("a", select.attr("href"))        // a[href]
   * select.el("input", select.attr("type", "=", "text")) // input[type="text"]
   * ```
   */
  static el<E extends HtmlElement>(
    name: E,
    ...modifiers: SelectorMod<E>[]
  ): ElementSelector {
    return { type: "element", name, modifiers };
  }

  /**
   * Create a class selector with optional modifiers.
   *
   * @example
   * ```ts
   * select.cls("button")                        // .button
   * select.cls("btn", select.pseudoClass("hover")) // .btn:hover
   * ```
   */
  static cls(name: string, ...modifiers: SelectorMod[]): ClassSelector {
    return { type: "class-selector", name, modifiers };
  }

  /**
   * Create an ID selector with optional modifiers.
   *
   * @example
   * ```ts
   * select.id("main")                           // #main
   * select.id("header", select.pseudoClass("target")) // #header:target
   * ```
   */
  static id(name: string, ...modifiers: SelectorMod[]): IdSelector {
    return { type: "id-selector", name, modifiers };
  }

  /**
   * Create a universal selector with optional modifiers.
   *
   * @example
   * ```ts
   * select.universal()                          // *
   * select.universal(select.pseudoClass("first-child")) // *:first-child
   * ```
   */
  static universal(...modifiers: SelectorMod[]): UniversalSelector {
    return { type: "universal-selector", modifiers };
  }

  /**
   * Create a parent/nesting selector (&) with optional modifiers.
   *
   * @example
   * ```ts
   * select.parent()                             // &
   * select.parent(select.pseudoClass("hover"))  // &:hover
   * ```
   */
  static parent(...modifiers: SelectorMod[]): ParentSelector {
    return { type: "parent-selector", modifiers };
  }

  // ===========================================================================
  // Modifiers
  // ===========================================================================

  /**
   * Create a class modifier to add a class to a selector.
   *
   * @example
   * ```ts
   * select.el("div", select.class_("active"))   // div.active
   * select.cls("btn", select.class_("primary")) // .btn.primary
   * ```
   */
  static class_(name: string): ClassMod {
    return { type: "class-mod", name };
  }

  /**
   * Create an attribute modifier (existence check).
   *
   * @example
   * ```ts
   * select.attr("disabled")                     // [disabled]
   * ```
   */
  static attr<A extends Attributes>(name: A): AttrMod<A>;
  /**
   * Create an attribute modifier with operator and value.
   *
   * @example
   * ```ts
   * select.attr("type", "=", "text")            // [type="text"]
   * select.attr("href", "^=", "https")          // [href^="https"]
   * select.attr("class", "~=", "btn")           // [class~="btn"]
   * ```
   */
  static attr<A extends Attributes>(
    name: A,
    op: AttrOp,
    value: string,
  ): AttrMod<A>;
  static attr<A extends Attributes>(
    name: A,
    op?: AttrOp,
    value?: string,
  ): AttrMod<A> {
    if (op !== undefined && value !== undefined) {
      return { type: "attr-mod", name, op, value };
    }
    return { type: "attr-mod", name };
  }

  /**
   * Create a case-insensitive attribute modifier.
   *
   * @example
   * ```ts
   * select.attrInsensitive("type", "=", "TEXT") // [type="TEXT" i]
   * ```
   */
  static attrInsensitive<A extends Attributes>(
    name: A,
    op: AttrOp,
    value: string,
  ): AttrMod<A> {
    return { type: "attr-mod", name, op, value, insensitive: true };
  }

  /**
   * Create a simple pseudo-class modifier (no argument).
   *
   * @example
   * ```ts
   * select.pseudoClass("hover")                 // :hover
   * select.pseudoClass("focus")                 // :focus
   * ```
   */
  static pseudoClass(name: SimplePseudoClass): PseudoClassMod;
  /**
   * Create a parameterized pseudo-class modifier with argument.
   *
   * @example
   * ```ts
   * select.pseudoClass("nth-child", "2n+1")     // :nth-child(2n+1)
   * select.pseudoClass("lang", "en")            // :lang(en)
   * ```
   */
  static pseudoClass(
    name: ParameterizedPseudoClass,
    arg: string,
  ): PseudoClassMod;
  static pseudoClass(name: PseudoClassName, arg?: string): PseudoClassMod {
    if (arg !== undefined) {
      return { type: "pseudo-class-mod", name, arg };
    }
    return { type: "pseudo-class-mod", name };
  }

  /**
   * Create a pseudo-element modifier.
   *
   * @example
   * ```ts
   * select.pseudoElement("before")              // ::before
   * select.pseudoElement("placeholder")         // ::placeholder
   * ```
   */
  static pseudoElement(name: PseudoElementName): PseudoElementMod {
    return { type: "pseudo-element-mod", name };
  }

  // ===========================================================================
  // At-Rule Modifiers
  // ===========================================================================

  /**
   * Create a @media at-rule modifier.
   *
   * @example
   * ```ts
   * select.media("(min-width: 768px)")          // @media (min-width: 768px)
   * select.media("screen and (color)")          // @media screen and (color)
   * ```
   */
  static media(query: string): MediaMod {
    return { type: "media-mod", query };
  }

  /**
   * Create a @supports at-rule modifier.
   *
   * @example
   * ```ts
   * select.supports("(display: grid)")          // @supports (display: grid)
   * select.supports("(backdrop-filter: blur(10px))") // @supports (backdrop-filter: blur(10px))
   * ```
   */
  static supports(query: string): SupportsMod {
    return { type: "supports-mod", query };
  }

  /**
   * Create a @container at-rule modifier.
   *
   * @example
   * ```ts
   * select.container("(min-width: 400px)")              // @container (min-width: 400px)
   * select.container("(min-width: 400px)", "sidebar")   // @container sidebar (min-width: 400px)
   * ```
   */
  static container(query: string, name?: string): ContainerMod {
    return {
      type: "container-mod",
      query,
      ...(name !== undefined && { name }),
    };
  }

  /**
   * Create a @layer at-rule modifier.
   *
   * @example
   * ```ts
   * select.layer("utilities")                   // @layer utilities
   * select.layer("components")                  // @layer components
   * ```
   */
  static layer(name: string): LayerMod {
    return { type: "layer-mod", name };
  }

  // ===========================================================================
  // Selector-Accepting Pseudo-Classes
  // ===========================================================================

  /**
   * Create an :is() pseudo-class with selector arguments.
   *
   * @example
   * ```ts
   * select.is(select.el("h1"), select.el("h2"), select.el("h3"))
   * // :is(h1, h2, h3)
   * ```
   */
  static is(...selectors: Selector[]): PseudoClassMod {
    return { type: "pseudo-class-mod", name: "is", arg: selectors };
  }

  /**
   * Create a :where() pseudo-class with selector arguments.
   * Like :is() but with zero specificity.
   *
   * @example
   * ```ts
   * select.where(select.cls("a"), select.cls("b"))
   * // :where(.a, .b)
   * ```
   */
  static where(...selectors: Selector[]): PseudoClassMod {
    return { type: "pseudo-class-mod", name: "where", arg: selectors };
  }

  /**
   * Create a :not() pseudo-class with selector arguments.
   *
   * @example
   * ```ts
   * select.not(select.cls("hidden"))
   * // :not(.hidden)
   * ```
   */
  static not(...selectors: Selector[]): PseudoClassMod {
    return { type: "pseudo-class-mod", name: "not", arg: selectors };
  }

  /**
   * Create a :has() pseudo-class with selector arguments.
   *
   * @example
   * ```ts
   * select.has(select.el("img"))
   * // :has(img)
   * ```
   */
  static has(...selectors: Selector[]): PseudoClassMod {
    return { type: "pseudo-class-mod", name: "has", arg: selectors };
  }

  // ===========================================================================
  // Combinators
  // ===========================================================================

  /**
   * Create a descendant combinator selector (space).
   *
   * @example
   * ```ts
   * select.descendant(select.el("nav"), select.el("a"))
   * // nav a
   * ```
   */
  static descendant(ancestor: Selector, desc: Selector): ComplexSelector {
    return { type: "complex", left: ancestor, combinator: " ", right: desc };
  }

  /**
   * Create a child combinator selector (>).
   *
   * @example
   * ```ts
   * select.child(select.el("ul"), select.el("li"))
   * // ul > li
   * ```
   */
  static child(parent: Selector, ch: Selector): ComplexSelector {
    return { type: "complex", left: parent, combinator: ">", right: ch };
  }

  /**
   * Create an adjacent sibling combinator selector (+).
   *
   * @example
   * ```ts
   * select.adjacent(select.el("h1"), select.el("p"))
   * // h1 + p
   * ```
   */
  static adjacent(left: Selector, right: Selector): ComplexSelector {
    return { type: "complex", left, combinator: "+", right };
  }

  /**
   * Create a general sibling combinator selector (~).
   *
   * @example
   * ```ts
   * select.sibling(select.el("h1"), select.el("p"))
   * // h1 ~ p
   * ```
   */
  static sibling(left: Selector, right: Selector): ComplexSelector {
    return { type: "complex", left, combinator: "~", right };
  }
}
