import type * as CSS from "npm:csstype";
import type { CssRule } from "../ast/types.ts";

// Base style properties from csstype
export type StyleProperties = CSS.Properties<string | number>;

// Extended style object with nesting
export interface StyleObject extends StyleProperties {
  // Set CSS variables
  vars?: Record<string, string | number>;

  // Nested selectors (must include & to reference element)
  selectors?: Record<string, StyleProperties>;

  // At-rules with nested styles
  "@media"?: Record<string, StyleObject>;
  "@supports"?: Record<string, StyleObject>;
  "@container"?: Record<string, StyleObject>;
  "@layer"?: Record<string, StyleObject>;
}

// Array form for composition (later styles win)
export type StyleInput = StyleObject | readonly StyleInput[];

// Compiled output
export interface CompiledStyles {
  className: string; // The generated class name
  rules: readonly CssRule[]; // AST rules to render
}
