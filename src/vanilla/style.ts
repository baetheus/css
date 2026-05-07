import type { StyleInput } from "../combinators/types.ts";
import { compileStyle } from "../combinators/compile.ts";
import { generateClassName } from "./hash.ts";
import { getRegistry } from "./registry.ts";

// Create a scoped style, returns class name
export function style(input: StyleInput, debugName?: string): string {
  const className = generateClassName(input, debugName);
  const rules = compileStyle(className, input);
  getRegistry().addClass(className, rules);
  return className;
}

// Create variants from a record of styles
export function styleVariants<T extends string | number | symbol>(
  variants: Record<T, StyleInput>,
  debugName?: string,
): Record<T, string>;

// Overload: map data to styles
export function styleVariants<Data extends Record<string, unknown>>(
  data: Data,
  mapFn: (value: Data[keyof Data], key: keyof Data) => StyleInput,
  debugName?: string,
): Record<keyof Data, string>;

export function styleVariants<T extends string | number | symbol>(
  variantsOrData: Record<T, StyleInput | unknown>,
  mapFnOrDebugName?:
    | string
    | ((value: unknown, key: string) => StyleInput),
  debugName?: string,
): Record<T, string> {
  const result = {} as Record<T, string>;

  if (typeof mapFnOrDebugName === "function") {
    // Second overload: data + mapFn
    const mapFn = mapFnOrDebugName;
    for (const [key, value] of Object.entries(variantsOrData)) {
      const input = mapFn(value, key);
      result[key as T] = style(
        input,
        debugName ? `${debugName}_${key}` : undefined,
      );
    }
  } else {
    // First overload: direct styles
    const variants = variantsOrData as Record<T, StyleInput>;
    const name = mapFnOrDebugName;
    for (const [key, input] of Object.entries(variants) as [T, StyleInput][]) {
      result[key] = style(input, name ? `${name}_${String(key)}` : undefined);
    }
  }

  return result;
}
