/**
 * CSS style creation and rendering utilities.
 *
 * This module provides functions for creating type-safe CSS styles with
 * automatic class name generation, nested selectors support, and flexible
 * rendering options. Styles can be combined, rendered to strings, and
 * used as class names in your application.
 *
 * @module
 * @since 0.0.4
 */

import type { Properties } from "csstype";
import type { CssValue } from "./_internal.ts";
import type { Selector } from "./selectors.ts";
import type { Variables } from "./variables.ts";

import { camelToKebab, hashObject } from "./_internal.ts";

/**
 * Options for controlling CSS output formatting.
 *
 * Allows customization of newlines, indentation, and spacing in rendered CSS.
 *
 * @example
 * ```ts
 * import type { RenderOptions } from "./style.ts";
 *
 * const minified: RenderOptions = { newline: "", indent: "", space: "" };
 * const pretty: RenderOptions = { newline: "\n", indent: "  ", space: " " };
 * ```
 *
 * @since 0.0.4
 */
export type RenderOptions = {
  readonly newline: string;
  readonly indent: string;
  readonly space: string;
};

/**
 * Standard render options with pretty-printed formatting.
 *
 * Uses newlines, 2-space indentation, and spaces around colons for
 * human-readable CSS output.
 *
 * @example
 * ```ts
 * import { render, style, STANDARD_RENDER_OPTIONS } from "./style.ts";
 *
 * const btn = style({ color: "red" });
 * render(btn, STANDARD_RENDER_OPTIONS);
 * // .abc1234 {
 * //   color: red;
 * // }
 * ```
 *
 * @since 0.0.4
 */
export const STANDARD_RENDER_OPTIONS: RenderOptions = {
  newline: "\n",
  indent: "  ",
  space: " ",
};

/**
 * Minimal render options for minified CSS output.
 *
 * Removes all whitespace for smallest possible output size.
 *
 * @example
 * ```ts
 * import { render, style, MINIMAL_RENDER_OPTIONS } from "./style.ts";
 *
 * const btn = style({ color: "red" });
 * render(btn, MINIMAL_RENDER_OPTIONS);
 * // .abc1234{color:red;}
 * ```
 *
 * @since 0.0.4
 */
export const MINIMAL_RENDER_OPTIONS: RenderOptions = {
  newline: "",
  indent: "",
  space: "",
};

/**
 * A mapping of CSS selectors to their style inputs.
 *
 * Used for nested selector definitions within a style block.
 *
 * @example
 * ```ts
 * import type { SelectorInput } from "./style.ts";
 *
 * const nested: SelectorInput = {
 *   "&:hover": { color: "blue" },
 *   "& > span": { fontWeight: "bold" },
 * };
 * ```
 *
 * @since 0.0.4
 */
export type SelectorInput = { readonly [K in Selector]?: StyleInput };

/**
 * Input for defining CSS styles.
 *
 * Combines CSS custom properties (Variables), standard CSS properties,
 * and optional nested selectors.
 *
 * @example
 * ```ts
 * import type { StyleInput } from "./style.ts";
 *
 * const input: StyleInput = {
 *   "--primary": "blue",
 *   color: "var(--primary)",
 *   padding: "8px",
 *   select: {
 *     "&:hover": { opacity: 0.8 },
 *   },
 * };
 * ```
 *
 * @since 0.0.4
 */
export type StyleInput = Variables & Properties & {
  readonly select?: SelectorInput;
};

/**
 * A single style block containing a selector and its style input.
 *
 * @example
 * ```ts
 * import type { StyleBlock } from "./style.ts";
 *
 * const block: StyleBlock = {
 *   selector: ".button",
 *   input: { color: "red", padding: "8px" },
 * };
 * ```
 *
 * @since 0.0.4
 */
export type StyleBlock = {
  readonly selector: Selector;
  readonly input: StyleInput;
};

/**
 * A branded style object containing an iterable of style blocks.
 *
 * Created by the `style()` function. Can be converted to a class name
 * string via `toString()` and rendered to CSS via `render()`.
 *
 * @example
 * ```ts
 * import type { Style } from "./style.ts";
 * import { style, render } from "./style.ts";
 *
 * const button: Style = style({ color: "red", padding: "8px" });
 * console.log(button.toString()); // ".abc1234"
 * console.log(render(button));    // ".abc1234 { color: red; padding: 8px; }"
 * ```
 *
 * @since 0.0.4
 */
export class Style implements Iterable<StyleBlock> {
  #selectors?: string;

  constructor(private blocks: () => Generator<StyleBlock>) {}

  *[Symbol.iterator]() {
    yield* this.blocks();
  }

  toString(): string {
    if (this.#selectors === undefined) {
      this.#selectors = Array.from(this.blocks()).map((b) => b.selector).join(
        " ",
      );
    }
    return this.#selectors as string;
  }

  join(...styles: readonly Style[]): Style {
    if (styles.length === 0) {
      return this;
    }
    const _styles = [this, ...styles];
    return new Style(function* joinedStyles() {
      for (const style of _styles) {
        yield* style;
      }
    });
  }
}

/**
 * Creates a Style object from CSS properties.
 *
 * When called with just properties, generates a unique class name based on
 * a hash of the input. When called with a selector and properties, uses
 * the provided selector.
 *
 * @param input - CSS properties and optional nested selectors
 * @returns A Style object that can be rendered to CSS
 *
 * @example
 * ```ts
 * import { style, render } from "./style.ts";
 *
 * // Auto-generated class name
 * const button = style({
 *   backgroundColor: "blue",
 *   color: "white",
 *   padding: "8px 16px",
 * });
 * console.log(button.toString()); // ".abc1234"
 *
 * // Custom selector
 * const heading = style("h1", {
 *   fontSize: "2rem",
 *   fontWeight: "bold",
 * });
 * console.log(heading.toString()); // "h1"
 * ```
 *
 * @since 0.0.4
 */
export function style(input: StyleInput): Style;
/**
 * Creates a Style object with a custom selector.
 *
 * @param selector - The CSS selector to use
 * @param input - CSS properties and optional nested selectors
 * @returns A Style object that can be rendered to CSS
 *
 * @since 0.0.4
 */
export function style(selector: Selector, input: StyleInput): Style;
export function style(): Style {
  const block: StyleBlock = arguments.length === 1
    ? { selector: `.${hashObject(arguments[0])}`, input: arguments[0] }
    : { selector: arguments[0], input: arguments[1] };
  return new Style(function* newStyle() {
    yield block;
  });
}

/**
 * Type guard to check if a value is a Style object.
 *
 * @param input - The value to check
 * @returns `true` if the value is a Style, `false` otherwise
 *
 * @example
 * ```ts
 * import { style, isStyle } from "./style.ts";
 *
 * const btn = style({ color: "red" });
 * isStyle(btn);           // true
 * isStyle({ color: "red" }); // false
 * isStyle("string");      // false
 * ```
 *
 * @since 0.0.4
 */
export function isStyle(input: unknown): input is Style {
  return input instanceof Style;
}

/**
 * Identity function for defining style properties with type checking.
 *
 * Useful for defining reusable style objects that will be spread into
 * other styles, while maintaining full type inference.
 *
 * @param input - CSS properties and optional nested selectors
 * @returns The same input, unchanged
 *
 * @example
 * ```ts
 * import { properties, style } from "./style.ts";
 *
 * const flexCenter = properties({
 *   display: "flex",
 *   alignItems: "center",
 *   justifyContent: "center",
 * });
 *
 * const card = style({
 *   ...flexCenter,
 *   padding: "16px",
 * });
 * ```
 *
 * @since 0.0.4
 */
export function properties(input: StyleInput): StyleInput {
  return input;
}

/**
 * Combines multiple Style objects into a single class name string.
 *
 * Joins the class names of all provided styles with spaces, suitable
 * for use in HTML class attributes.
 *
 * @param styles - One or more Style objects to combine
 * @returns A space-separated string of class names
 *
 * @example
 * ```ts
 * import { style, use } from "./style.ts";
 *
 * const base = style({ padding: "8px" });
 * const active = style({ backgroundColor: "blue" });
 * const large = style({ fontSize: "1.5rem" });
 *
 * const className = use(base, active, large);
 * // ".abc1234 .def5678 .ghi9012"
 *
 * // In JSX: <button className={use(base, active)}>Click</button>
 * ```
 *
 * @since 0.0.4
 */
export function use(...styles: [Style, ...Style[]]): string {
  return styles.map((s) => s.toString()).join(" ");
}

/**
 * Combines multiple Style objects into a single Style for rendering.
 *
 * Joins multiple styles so they can be rendered together as a single CSS output.
 * This is useful for combining styles before passing to `render()`.
 *
 * @param styles - Two or more Style objects to combine
 * @returns A single Style containing all style blocks
 *
 * @example
 * ```ts
 * import { style, join, render } from "./style.ts";
 *
 * const button = style({ color: "white", backgroundColor: "blue" });
 * const heading = style("h1", { fontSize: "2rem" });
 *
 * // Combine styles for rendering
 * console.log(render(join(button, heading)));
 * // .abc1234 {
 * //   color: white;
 * //   background-color: blue;
 * // }
 * // h1 {
 * //   font-size: 2rem;
 * // }
 * ```
 *
 * @since 0.0.4
 */
export function join(...styles: [Style, ...Style[]]): Style {
  const [first, ...rest] = styles;
  return first.join(...rest);
}

/**
 * Renders a single CSS property declaration.
 *
 * Converts camelCase property names to kebab-case, preserving custom
 * properties (--*) and at-rules (@*) as-is.
 *
 * @param key - The property name (camelCase or kebab-case)
 * @param value - The property value
 * @param depth - Indentation depth (default: 0)
 * @param options - Render options for formatting
 * @returns A formatted CSS property declaration string
 *
 * @internal
 * @since 0.0.4
 */
function renderProperty(
  key: string,
  value: CssValue,
  depth: number = 0,
  { indent, space }: RenderOptions = STANDARD_RENDER_OPTIONS,
): string {
  const _key = key.startsWith("--") || key.startsWith("@")
    ? key
    : camelToKebab(key);
  return `${indent.repeat(depth)}${_key}:${space}${value};`;
}

/**
 * Renders nested selector blocks.
 *
 * Recursively renders each nested selector and its styles at the
 * appropriate indentation depth.
 *
 * @param input - The nested selector mapping
 * @param depth - Current indentation depth (default: 0)
 * @param options - Render options for formatting
 * @returns Formatted CSS for all nested selectors
 *
 * @internal
 * @since 0.0.4
 */
function renderSelect(
  input: SelectorInput,
  depth: number = 0,
  options: RenderOptions = STANDARD_RENDER_OPTIONS,
): string {
  const { newline } = options;
  return Object.entries(input).map(([s, i]) =>
    i !== undefined
      ? renderBlock({ selector: s, input: i }, depth + 1, options)
      : ""
  ).join(newline);
}

/**
 * Renders a StyleBlock to a CSS rule string.
 *
 * Formats the selector, all properties, and any nested selectors
 * according to the provided render options.
 *
 * @param block - The StyleBlock to render
 * @param depth - Current indentation depth (default: 0)
 * @param options - Render options for formatting
 * @returns A complete CSS rule block string
 *
 * @internal
 * @since 0.0.4
 */
function renderBlock(
  block: StyleBlock,
  depth: number = 0,
  options: RenderOptions = STANDARD_RENDER_OPTIONS,
): string {
  const { newline, space, indent } = options;
  const { selector, input } = block;
  const props = Object.entries(input).map(([key, value]) =>
    key === "select"
      ? renderSelect(value, depth, options)
      : renderProperty(key, value, depth + 1, options)
  ).join(newline);
  return `${
    indent.repeat(depth)
  }${selector}${space}{${newline}${props}${newline}${indent.repeat(depth)}}`;
}

/**
 * Renders a Style object to a CSS string.
 *
 * Iterates over all style blocks in the style and renders each one.
 * Use `join()` to combine multiple styles before rendering.
 *
 * @param style - The Style object to render
 * @param options - Render options for formatting (optional)
 * @returns A complete CSS string with all rules
 *
 * @example
 * ```ts
 * import { style, join, render, MINIMAL_RENDER_OPTIONS } from "./style.ts";
 *
 * const button = style({ color: "white", backgroundColor: "blue" });
 * const heading = style("h1", { fontSize: "2rem" });
 *
 * // Standard formatting (default)
 * console.log(render(join(button, heading)));
 * // .abc1234 {
 * //   color: white;
 * //   background-color: blue;
 * // }
 * // h1 {
 * //   font-size: 2rem;
 * // }
 *
 * // Minified output
 * console.log(render(button, MINIMAL_RENDER_OPTIONS));
 * // .abc1234{color:white;background-color:blue;}
 * ```
 *
 * @since 0.0.4
 */
export function render(
  style: Style,
  options: RenderOptions = STANDARD_RENDER_OPTIONS,
): string {
  return Array.from(style)
    .map((block) => renderBlock(block, 0, options))
    .join(options.newline);
}
