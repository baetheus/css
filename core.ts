import * as ast from "./ast.ts";

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

export class Style {
  readonly [StyleBrand] = null;
  readonly hash: string;
  readonly name: string;

  constructor(
    readonly selector: ast.Selector,
    readonly properties: ast.Properties,
    readonly children: readonly Style[],
  ) {
    this.hash = hashObject(properties);
    this.name = ast.renderSelector(selector);
  }

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
 * @example
 * ```ts
 * import { style } from "./core.ts";
 * import { select } from "./ast.ts";
 *
 * const s = style(select.cls("btn"), { color: "blue", padding: "8px" });
 * ```
 *
 * @since 0.1.0
 */
export function style(
  selector: ast.Selector,
  properties: ast.Properties,
  children: readonly Style[] = [],
): Style {
  return new Style(selector, properties, children);
}

/**
 * Create a class selector style.
 *
 * @example
 * ```ts
 * import { cls } from "./core.ts";
 *
 * const s = cls("button", { color: "blue" });
 * // Renders as: .button { color: blue; }
 * ```
 *
 * @since 0.1.0
 */
export function cls(
  properties: ast.Properties,
  ...children: Style[]
): Style {
  const hash = hashObject(properties);
  return style(ast.select.cls(hash), properties, children);
}

/**
 * Create an element selector style.
 *
 * @example
 * ```ts
 * import { el } from "./core.ts";
 *
 * const s = el("div", { padding: "16px" });
 * // Renders as: div { padding: 16px; }
 * ```
 *
 * @since 0.1.0
 */
export function el(
  name: ast.HtmlElement,
  properties: ast.Properties,
  ...children: Style[]
): Style {
  return style(ast.select.el(name), properties, children);
}

/**
 * Create an ID selector style.
 *
 * @example
 * ```ts
 * import { id } from "./core.ts";
 *
 * const s = id("main", { maxWidth: "1200px" });
 * // Renders as: #main { max-width: 1200px; }
 * ```
 *
 * @since 0.1.0
 */
export function id(
  name: string,
  properties: ast.Properties,
  ...children: Style[]
): Style {
  return style(ast.select.id(name), properties, children);
}

/**
 * Create a universal selector style.
 *
 * @example
 * ```ts
 * import { universal } from "./core.ts";
 *
 * const s = universal({ boxSizing: "border-box" });
 * // Renders as: * { box-sizing: border-box; }
 * ```
 *
 * @since 0.1.0
 */
export function universal(
  properties: ast.Properties,
  ...children: Style[]
): Style {
  return style(ast.select.universal(), properties, children);
}

/**
 * Create a parent/nesting selector (&) style.
 *
 * @example
 * ```ts
 * import { parent, cls } from "./core.ts";
 *
 * const hover = parent({ color: "darkblue" });
 * const s = cls("btn", { color: "blue" }, hover);
 * ```
 *
 * @since 0.1.0
 */
export function parent(
  properties: ast.Properties,
  ...children: Style[]
): Style {
  return style(ast.select.parent(), properties, children);
}

/**
 * Create a record of styles from base properties and variant-specific properties.
 * Each resulting style has the base properties merged with its variant properties.
 *
 * @example
 * ```ts
 * import { variants } from "./core.ts";
 *
 * const buttons = variants(
 *   { padding: "8px 16px", borderRadius: "4px" },
 *   {
 *     primary: { backgroundColor: "blue", color: "white" },
 *     secondary: { backgroundColor: "gray", color: "black" },
 *   }
 * );
 * // buttons.primary -> Style with padding, borderRadius, backgroundColor, color
 * // buttons.secondary -> Style with padding, borderRadius, backgroundColor, color
 * ```
 *
 * @since 0.1.0
 */
export function variants<K extends string>(
  base: ast.Properties,
  records: Record<K, ast.Properties>,
): Record<K, Style> {
  const result = {} as Record<K, Style>;
  for (const key of Object.keys(records) as K[]) {
    result[key] = cls({ ...base, ...records[key] });
  }
  return result;
}

/**
 * Render a Style to a CSS string.
 *
 * @example
 * ```ts
 * import { render, cls, NORMAL_RENDER_OPTIONS } from "./core.ts";
 *
 * const s = cls("btn", { color: "blue" });
 * render(s, NORMAL_RENDER_OPTIONS);
 * // .btn {
 * //   color: blue;
 * // }
 * ```
 *
 * @since 0.1.0
 */
export function renderStyle(
  s: Style,
  options?: Partial<ast.RenderOptions>,
  depth: number = 0,
): string {
  const opts = ast.resolveOptions(options);
  const { space, indent, newline } = opts;
  const baseIndent = indent.repeat(depth);

  const selector = s.toString();
  const props = ast.renderProperties(s.properties, opts, depth + 1);

  let nested = "";
  for (const child of s.children) {
    nested += renderStyle(child, options, depth + 1);
  }

  return `${baseIndent}${selector}${space}{${newline}${props}${newline}${nested}${baseIndent}}${newline}`;
}

/**
 * Alias for renderStyle.
 *
 * @since 0.1.0
 */
export const render = renderStyle;

// =============================================================================
// Recipe Types
// =============================================================================

/**
 * A record of variant groups, where each group maps option names to CSS properties.
 *
 * @example
 * ```ts
 * type ButtonVariants = {
 *   color: { brand: Properties; accent: Properties };
 *   size: { sm: Properties; lg: Properties };
 * };
 * ```
 *
 * @since 0.2.0
 */
export type VariantGroups = Record<string, Record<string, ast.Properties>>;

/**
 * Extract the valid selection options from a VariantGroups type.
 *
 * @since 0.2.0
 */
export type VariantSelection<V extends VariantGroups> = {
  [K in keyof V]?: keyof V[K];
};

/**
 * A compound variant that applies styles when specific variant combinations are active.
 *
 * @since 0.2.0
 */
export type CompoundVariant<V extends VariantGroups> = {
  readonly variants: VariantSelection<V>;
  readonly style: ast.Properties;
};

/**
 * Configuration for creating a recipe.
 *
 * @since 0.2.0
 */
export type RecipeConfig<V extends VariantGroups> = {
  readonly base?: ast.Properties;
  readonly variants?: V;
  readonly compoundVariants?: readonly CompoundVariant<V>[];
  readonly defaultVariants?: VariantSelection<V>;
};

// =============================================================================
// Recipe Class
// =============================================================================

const RecipeBrand = Symbol("@baetheus/css/core/recipe");

type VariantStyles<V extends VariantGroups> = {
  [K in keyof V]: { [O in keyof V[K]]: Style };
};

type CompoundVariantStyle<V extends VariantGroups> = {
  readonly variants: VariantSelection<V>;
  readonly style: Style;
};

/**
 * A Recipe is a Style with variant support. It generates multiple CSS classes
 * that can be combined at runtime based on variant selection.
 *
 * @example
 * ```ts
 * import { recipe } from "./core.ts";
 *
 * const button = recipe({
 *   base: { padding: "8px 16px", borderRadius: "4px" },
 *   variants: {
 *     color: {
 *       brand: { backgroundColor: "blue", color: "white" },
 *       accent: { backgroundColor: "green", color: "white" },
 *     },
 *     size: {
 *       sm: { fontSize: "12px" },
 *       lg: { fontSize: "18px" },
 *     },
 *   },
 *   defaultVariants: { color: "brand", size: "sm" },
 * });
 *
 * button.with();                     // base + brand + sm
 * button.with({ color: "accent" });  // base + accent + sm
 * button.with({ size: "lg" });       // base + brand + lg
 * ```
 *
 * @since 0.2.0
 */
export class Recipe<V extends VariantGroups = VariantGroups> extends Style {
  readonly [RecipeBrand] = null;
  readonly variantStyles: VariantStyles<V>;
  readonly compoundVariantStyles: readonly CompoundVariantStyle<V>[];
  readonly defaultVariants: VariantSelection<V>;

  constructor(config: RecipeConfig<V>) {
    const baseProps = config.base ?? {};
    const baseHash = hashObject(baseProps);
    super(ast.select.cls(baseHash), baseProps, []);

    this.defaultVariants = config.defaultVariants ?? {};

    // Build variant styles
    const variantStyles = {} as VariantStyles<V>;
    if (config.variants) {
      for (const group of Object.keys(config.variants) as (keyof V)[]) {
        variantStyles[group] = {} as { [O in keyof V[typeof group]]: Style };
        const options = config.variants[group];
        for (const option of Object.keys(options) as (keyof typeof options)[]) {
          const props = options[option];
          variantStyles[group][option] = cls(props);
        }
      }
    }
    this.variantStyles = variantStyles;

    // Build compound variant styles
    const compoundStyles: CompoundVariantStyle<V>[] = [];
    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        compoundStyles.push({
          variants: compound.variants,
          style: cls(compound.style),
        });
      }
    }
    this.compoundVariantStyles = compoundStyles;
  }

  /**
   * Get class names for the given variant selection.
   * Returns the base class plus any matching variant and compound variant classes.
   *
   * @example
   * ```ts
   * button.with();                     // "abc1234 def5678 ghi9012"
   * button.with({ color: "accent" });  // "abc1234 jkl3456 ghi9012"
   * ```
   */
  with(selection?: VariantSelection<V>): string {
    const merged = { ...this.defaultVariants, ...selection };
    const classes: string[] = [this.name];

    // Add variant classes
    for (const group of Object.keys(this.variantStyles) as (keyof V)[]) {
      const value = merged[group];
      if (value !== undefined) {
        const groupStyles = this.variantStyles[group];
        const style = groupStyles[value as keyof typeof groupStyles];
        if (style) {
          classes.push(style.name);
        }
      }
    }

    // Add compound variant classes
    for (const compound of this.compoundVariantStyles) {
      if (this.matchesCompound(compound.variants, merged)) {
        classes.push(compound.style.name);
      }
    }

    return classes.join(" ");
  }

  private matchesCompound(
    compoundVariants: VariantSelection<V>,
    selection: VariantSelection<V>,
  ): boolean {
    for (const key of Object.keys(compoundVariants) as (keyof V)[]) {
      if (selection[key] !== compoundVariants[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all styles that make up this recipe (base + all variants + compound variants).
   * Useful for rendering the complete CSS.
   */
  allStyles(): Style[] {
    const styles: Style[] = [this as Style];

    for (const group of Object.keys(this.variantStyles) as (keyof V)[]) {
      for (const option of Object.keys(this.variantStyles[group])) {
        styles.push(this.variantStyles[group][option as keyof V[typeof group]]);
      }
    }

    for (const compound of this.compoundVariantStyles) {
      styles.push(compound.style);
    }

    return styles;
  }
}

/**
 * Type guard to check if a value is a Recipe object.
 *
 * @since 0.2.0
 */
export function isRecipe(input: unknown): input is Recipe {
  return input !== null && typeof input === "object" &&
    Object.hasOwn(input, RecipeBrand);
}

/**
 * Create a recipe with base styles, variants, compound variants, and defaults.
 *
 * @example
 * ```ts
 * import { recipe } from "./core.ts";
 *
 * const button = recipe({
 *   base: { padding: "8px 16px" },
 *   variants: {
 *     color: {
 *       brand: { backgroundColor: "blue" },
 *       accent: { backgroundColor: "green" },
 *     },
 *   },
 *   defaultVariants: { color: "brand" },
 * });
 * ```
 *
 * @since 0.2.0
 */
export function recipe<V extends VariantGroups>(
  config: RecipeConfig<V>,
): Recipe<V> {
  return new Recipe(config);
}

/**
 * Render all styles from a Recipe to a CSS string.
 *
 * @since 0.2.0
 */
export function renderRecipe(
  r: Recipe,
  options?: Partial<ast.RenderOptions>,
): string {
  return r.allStyles().map((s) => renderStyle(s, options)).join("");
}
