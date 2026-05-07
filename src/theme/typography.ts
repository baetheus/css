import { styleVariants } from "../vanilla/index.ts";
import { FONT_SIZE_SCALE, FONT_WEIGHT_SCALE } from "./config.ts";
import { withResponsive } from "./responsive.ts";

// fs-u5, fs-0, fs-d3, fs-sm-u2, etc.
export const fontSize = styleVariants(
  withResponsive(
    Object.fromEntries(
      Object.entries(FONT_SIZE_SCALE).map(([key, value]) => [
        key,
        { fontSize: value },
      ]),
    ),
  ),
  "fs",
);

// fw-u3, fw-0, fw-d1, etc.
export const fontWeight = styleVariants(
  Object.fromEntries(
    Object.entries(FONT_WEIGHT_SCALE).map(([key, value]) => [
      key,
      { fontWeight: value },
    ]),
  ),
  "fw",
);
