import { styleVariants } from "../vanilla/index.ts";
import type { StyleObject } from "../combinators/types.ts";
import { type Direction, DIRECTION_MAP, SPACING_SCALE } from "./config.ts";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Border width: bwa-0 through bwa-7, bwt-0, bwx-2, etc.
function createBorderWidthStyles(): Record<string, StyleObject> {
  const styles: Record<string, StyleObject> = {};

  for (
    const [dir, props] of Object.entries(DIRECTION_MAP) as [
      Direction,
      string[],
    ][]
  ) {
    for (const [scale, value] of Object.entries(SPACING_SCALE)) {
      const key = `${dir}-${scale}`;
      const style: Record<string, number> = {};

      for (const prop of props) {
        style[`border${capitalize(prop)}Width`] = value;
      }

      styles[key] = style as StyleObject;
    }
  }

  return styles;
}

export const borderWidth = styleVariants(createBorderWidthStyles(), "bw");

// Border radius: bra-0 through bra-4, bra-c (circular)
export const borderRadius = styleVariants(
  {
    "0": { borderRadius: 0 },
    "1": { borderRadius: 2 },
    "2": { borderRadius: 4 },
    "3": { borderRadius: 8 },
    "4": { borderRadius: 16 },
    c: { borderRadius: "50%" },
  },
  "br",
);

// Border style: bs-none, bs-solid, bs-dashed, bs-dotted
export const borderStyle = styleVariants(
  {
    none: { borderStyle: "none" },
    solid: { borderStyle: "solid" },
    dashed: { borderStyle: "dashed" },
    dotted: { borderStyle: "dotted" },
  },
  "bs",
);

const a = borderStyle.none;
