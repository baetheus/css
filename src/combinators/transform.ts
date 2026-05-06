import type { CssProperty } from "../ast/types.ts";
import { prop } from "../ast/builders.ts";
import { UNITLESS_PROPERTIES } from "./unitless.ts";
import type { StyleProperties } from "./types.ts";

// camelCase to kebab-case
export function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

// Add 'px' to numbers for properties that need units
export function pixelify(property: string, value: string | number): string {
  if (
    typeof value === "number" &&
    value !== 0 &&
    !UNITLESS_PROPERTIES.has(property)
  ) {
    return `${value}px`;
  }
  return String(value);
}

// Transform a style object's properties to CssProperty[]
export function transformProperties(obj: StyleProperties): CssProperty[] {
  return Object.entries(obj)
    .filter(
      ([key]) => !key.startsWith("@") && key !== "vars" && key !== "selectors"
    )
    .map(([key, value]) => prop(toKebabCase(key), pixelify(key, value!)));
}
