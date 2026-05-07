import { styleVariants } from "../vanilla/index.ts";
import { SPACING_SCALE } from "./config.ts";

// sh-blk-0 through sh-blk-7
export const shadow = styleVariants(
  Object.fromEntries(
    Object.entries(SPACING_SCALE).map(([key, value]) => [
      `blk-${key}`,
      {
        boxShadow: value === 0
          ? "none"
          : `0 ${value}px ${value * 2}px rgba(0,0,0,0.2)`,
      },
    ]),
  ),
  "sh",
);
