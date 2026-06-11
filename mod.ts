/**
 * Type-safe CSS-in-TypeScript library with automatic class generation.
 *
 * This library provides utilities for creating CSS styles with full type safety,
 * automatic class name generation, nested selectors, CSS variables with themes,
 * and at-rule support.
 *
 * @example Basic styles
 * ```ts
 * import { style, render, use } from "@baetheus/css";
 *
 * // Create styles with auto-generated class names
 * const button = style({
 *   backgroundColor: "blue",
 *   color: "white",
 *   padding: "8px 16px",
 *   borderRadius: "4px",
 * });
 *
 * // Use in HTML/JSX
 * console.log(button.toString()); // ".a1b2c3d4"
 *
 * // Render to CSS string
 * console.log(render(button));
 * // .a1b2c3d4 {
 * //   background-color: blue;
 * //   color: white;
 * //   padding: 8px 16px;
 * //   border-radius: 4px;
 * // }
 * ```
 *
 * @example Nested selectors and pseudo-classes
 * ```ts
 * import { style, render } from "@baetheus/css";
 *
 * const card = style({
 *   padding: "16px",
 *   transition: "transform 0.2s",
 *   select: {
 *     "&:hover": { transform: "scale(1.02)" },
 *     "& > h2": { marginTop: 0 },
 *     "@media (min-width: 768px)": { padding: "24px" },
 *   },
 * });
 * ```
 *
 * @example Combining multiple styles
 * ```ts
 * import { style, use } from "@baetheus/css";
 *
 * const base = style({ padding: "8px" });
 * const primary = style({ backgroundColor: "blue", color: "white" });
 * const large = style({ fontSize: "1.25rem" });
 *
 * // Combine into a single class string for use in HTML
 * const className = use(base, primary, large);
 * // ".abc123 .def456 .ghi789"
 *
 * // Or use the join method to combine styles for rendering
 * const combined = base.join(primary, large);
 * console.log(render(combined));
 * ```
 *
 * @example CSS variable themes
 * ```ts
 * import { theme, style, render, fallback } from "@baetheus/css";
 *
 * // Define a type-safe theme with values
 * const colors = theme({
 *   primary: "blue",
 *   background: "white",
 *   spacing: {
 *     small: "4px",
 *     medium: "16px",
 *   },
 * });
 *
 * // Use theme references in styles (type-checked)
 * const card = style({
 *   backgroundColor: colors.background,
 *   padding: colors.spacing.medium,
 *   color: colors.primary,
 *   // Use fallback() to add fallback values
 *   borderColor: fallback(colors.primary, "gray"),
 * });
 *
 * // Create CSS custom properties by passing theme to style()
 * const lightTheme = style(":root", colors);
 *
 * // Create a dark variant with same variable names using create()
 * const darkColors = colors.create({
 *   primary: "lightblue",
 *   background: "#1a1a1a",
 * });
 * const darkTheme = style(".dark", darkColors);
 *
 * // Use join() or Style.join() method to combine styles for rendering
 * console.log(render(lightTheme.join(darkTheme, card)));
 * ```
 *
 * @example At-rules (font-face, keyframes, etc.)
 * ```ts
 * import { at, render } from "@baetheus/css";
 *
 * const roboto = at("@font-face", {
 *   fontFamily: "Roboto",
 *   src: "url('/fonts/roboto.woff2') format('woff2')",
 *   fontWeight: "400",
 *   fontDisplay: "swap",
 * });
 *
 * const themeColor = at("@property --theme-color", {
 *   syntax: '"<color>"',
 *   inherits: "true",
 *   initialValue: "blue",
 * });
 *
 * console.log(render(roboto.join(themeColor)));
 * ```
 *
 * @example Minified output
 * ```ts
 * import { style, render, MINIMAL_RENDER_OPTIONS } from "@baetheus/css";
 *
 * const button = style({ color: "white", backgroundColor: "blue" });
 *
 * // Minified for production
 * console.log(render(button, MINIMAL_RENDER_OPTIONS));
 * // .a1b2c3d4{color:white;background-color:blue;}
 * ```
 *
 * @module
 * @since 0.0.4
 */

export type { RenderOptions, Style, StyleBlock } from "./style.ts";
export type {
  DeepPartial,
  MapShape,
  Theme,
  ThemeShape,
  VariableKey,
  Variables,
  VariableValue,
} from "./theme.ts";
export type { CSSAtRule } from "./atrules.ts";

export {
  isStyle,
  join,
  MINIMAL_RENDER_OPTIONS,
  properties,
  render,
  STANDARD_RENDER_OPTIONS,
  style,
  use,
} from "./style.ts";
export { fallback, isTheme, theme } from "./theme.ts";
export { at } from "./atrules.ts";
