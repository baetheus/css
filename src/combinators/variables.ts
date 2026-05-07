import type { CssProperty } from "../ast/types.ts";
import { prop } from "../ast/builders.ts";

// Create a var() reference
export function cssVarRef(name: string, fallback?: string): string {
  const varName = name.startsWith("--") ? name : `--${name}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}

// Create a CSS variable name (for use in vars object)
export function cssVarName(name: string): string {
  return name.startsWith("--") ? name : `--${name}`;
}

// Create variable assignments from vars object
export function createVarAssignments(
  vars: Record<string, string | number>,
): CssProperty[] {
  return Object.entries(vars).map(([name, value]) =>
    prop(cssVarName(name), String(value))
  );
}
