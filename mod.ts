/**
 * Type-safe CSS-in-TypeScript library with automatic class generation.
 *
 * This library provides utilities for creating CSS styles with full type safety,
 * automatic class name generation, nested selectors, CSS variables with contracts,
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
 * // Combine into a single class string
 * const className = use(base, primary, large);
 * // ".abc123 .def456 .ghi789"
 * ```
 *
 * @example CSS variable contracts
 * ```ts
 * import { contract, vars, style, render } from "@baetheus/css";
 *
 * // Define a type-safe variable contract
 * const theme = contract({
 *   colors: {
 *     primary: null,
 *     background: null,
 *   },
 *   spacing: {
 *     small: null,
 *     medium: null,
 *   },
 * });
 *
 * // Use contract references in styles (type-checked)
 * const card = style({
 *   backgroundColor: theme.colors.background,
 *   padding: theme.spacing.medium,
 *   color: theme.colors.primary,
 * });
 *
 * // Create theme implementations
 * const lightTheme = vars(theme, {
 *   colors: { primary: "#0066cc", background: "#ffffff" },
 *   spacing: { small: "4px", medium: "16px" },
 * });
 *
 * const darkTheme = vars(theme, {
 *   colors: { primary: "#66b3ff", background: "#1a1a1a" },
 *   spacing: { small: "4px", medium: "16px" },
 * });
 *
 * console.log(render(lightTheme, card));
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
 * console.log(render(roboto, themeColor));
 * ```
 *
 * @example Minified output
 * ```ts
 * import { style, render, MINIMAL_RENDER_OPTIONS } from "@baetheus/css";
 *
 * const button = style({ color: "white", backgroundColor: "blue" });
 *
 * // Minified for production
 * console.log(render(MINIMAL_RENDER_OPTIONS, button));
 * // .a1b2c3d4{color:white;background-color:blue;}
 * ```
 *
 * @module
 * @since 0.0.4
 */

export type { RenderOptions, Style } from "./style.ts";
export type { Contract } from "./variables.ts";
export type { CSSAtRule } from "./atrules.ts";

export {
  isStyle,
  MINIMAL_RENDER_OPTIONS,
  properties,
  render,
  STANDARD_RENDER_OPTIONS,
  style,
  use,
} from "./style.ts";
export { contract, isContract, vars } from "./variables.ts";
export { at } from "./atrules.ts";
