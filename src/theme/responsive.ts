import { type Breakpoint, BREAKPOINTS } from "./config.ts";
import type { StyleObject } from "../combinators/types.ts";

// Wrap styles in media query
export function atBreakpoint(bp: Breakpoint, styles: StyleObject): StyleObject {
  return {
    "@media": {
      [`(min-width: ${BREAKPOINTS[bp]})`]: styles,
    },
  };
}

// Generate responsive variants of a style map
export function withResponsive<T extends Record<string, StyleObject>>(
  base: T,
): T & Record<`${string}-${Breakpoint}`, StyleObject> {
  const result: Record<string, StyleObject> = { ...base };

  for (const bp of Object.keys(BREAKPOINTS) as Breakpoint[]) {
    for (const [key, styles] of Object.entries(base)) {
      result[`${key}-${bp}`] = atBreakpoint(bp, styles);
    }
  }

  return result as T & Record<`${string}-${Breakpoint}`, StyleObject>;
}
