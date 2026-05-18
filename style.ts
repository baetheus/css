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
 * render(STANDARD_RENDER_OPTIONS, btn);
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
 * render(MINIMAL_RENDER_OPTIONS, btn);
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
 * Internal symbol for branding Style objects.
 *
 * @internal
 * @since 0.0.4
 */
const StyleBrand = Symbol("StyleInput");

/**
 * A branded style object containing a selector and style input.
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
export type Style = {
  readonly [StyleBrand]: [Selector, StyleInput];
  toString(): string;
};

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
  const value: [Selector, StyleInput] = arguments.length === 1
    ? [`.${hashObject(arguments[0])}`, arguments[0]]
    : [arguments[0], arguments[1]];

  return {
    [StyleBrand]: value,
    toString() {
      return value[0];
    },
  };
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
  return typeof input === "object" && input !== null && StyleBrand in input;
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
    i !== undefined ? renderStyle(style(s, i), depth + 1, options) : ""
  ).join(newline);
}

/**
 * Renders a complete Style object to a CSS rule string.
 *
 * Formats the selector, all properties, and any nested selectors
 * according to the provided render options.
 *
 * @param input - The Style object to render
 * @param depth - Current indentation depth (default: 0)
 * @param options - Render options for formatting
 * @returns A complete CSS rule block string
 *
 * @internal
 * @since 0.0.4
 */
function renderStyle(
  input: Style,
  depth: number = 0,
  options: RenderOptions = STANDARD_RENDER_OPTIONS,
): string {
  const { newline, space, indent } = options;
  const [selector, styles] = input[StyleBrand];
  const props = Object.entries(styles).map(([key, value]) =>
    key === "select"
      ? renderSelect(value, depth, options)
      : renderProperty(key, value, depth + 1, options)
  ).join(newline);
  return `${
    indent.repeat(depth)
  }${selector}${space}{${newline}${props}${newline}${indent.repeat(depth)}}`;
}

/**
 * Renders multiple Style objects to a CSS string.
 *
 * Can be called with render options as the first argument for custom
 * formatting, or with just styles to use standard formatting.
 *
 * @param options - Render options for formatting (optional)
 * @param styles - One or more Style objects to render
 * @returns A complete CSS string with all rules
 *
 * @example
 * ```ts
 * import { style, render, MINIMAL_RENDER_OPTIONS } from "./style.ts";
 *
 * const button = style({ color: "white", backgroundColor: "blue" });
 * const heading = style("h1", { fontSize: "2rem" });
 *
 * // Standard formatting (default)
 * console.log(render(button, heading));
 * // .abc1234 {
 * //   color: white;
 * //   background-color: blue;
 * // }
 * // h1 {
 * //   font-size: 2rem;
 * // }
 *
 * // Minified output
 * console.log(render(MINIMAL_RENDER_OPTIONS, button));
 * // .abc1234{color:white;background-color:blue;}
 * ```
 *
 * @since 0.0.4
 */
export function render(
  options: RenderOptions,
  ...styles: [Style, ...Style[]]
): string;
/**
 * Renders multiple Style objects to a CSS string with standard formatting.
 *
 * @param styles - One or more Style objects to render
 * @returns A complete CSS string with all rules
 *
 * @since 0.0.4
 */
export function render(...styles: [Style, ...Style[]]): string;
export function render(...styles: [unknown, Style, ...Style[]]): string {
  const [options, ..._styles] =
    (isStyle(styles[0]) ? [STANDARD_RENDER_OPTIONS, ...styles] : styles) as [
      RenderOptions,
      ...[Style, ...Style[]],
    ];
  return _styles.map((s) => renderStyle(s, 0, options)).join(options.newline);
}
