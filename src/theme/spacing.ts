import { styleVariants } from "../vanilla/index.ts";
import type { StyleObject } from "../combinators/types.ts";
import { type Direction, DIRECTION_MAP, SPACING_SCALE } from "./config.ts";
import { withResponsive } from "./responsive.ts";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createSpacingStyles(
  property: "padding" | "margin",
): Record<string, StyleObject> {
  const styles: Record<string, StyleObject> = {};

  for (
    const [dir, props] of Object.entries(DIRECTION_MAP) as [
      Direction,
      string[],
    ][]
  ) {
    for (const [scale, value] of Object.entries(SPACING_SCALE)) {
      const key = `${dir}-${scale}`; // e.g., 'a-0', 'x-4'
      const style: Record<string, number> = {};

      for (const prop of props) {
        const propName = `${property}${capitalize(prop)}`;
        style[propName] = value;
      }

      styles[key] = style as StyleObject;
    }
  }

  return withResponsive(styles);
}

// pa-0, px-1, py-sm-2, etc.
export const padding = styleVariants(createSpacingStyles("padding"), "p");

// ma-0, mx-1, my-sm-2, etc.
export const margin = styleVariants(createSpacingStyles("margin"), "m");
