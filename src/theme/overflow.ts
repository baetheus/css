import { styleVariants } from "../vanilla/index.ts";
import type { StyleObject } from "../combinators/types.ts";

type OverflowValue = "visible" | "hidden" | "scroll" | "auto";

function createOverflowStyles(): Record<string, StyleObject> {
  const styles: Record<string, StyleObject> = {};
  const values: Record<string, OverflowValue> = {
    vi: "visible",
    hi: "hidden",
    sc: "scroll",
    au: "auto",
  };

  for (const [valKey, valValue] of Object.entries(values)) {
    // ova-vi, ova-hi, etc.
    styles[`a-${valKey}`] = { overflow: valValue };
    // ovx-vi, ovx-hi, etc.
    styles[`x-${valKey}`] = { overflowX: valValue };
    // ovy-vi, ovy-hi, etc.
    styles[`y-${valKey}`] = { overflowY: valValue };
  }

  return styles;
}

export const overflow = styleVariants(createOverflowStyles(), "ov");
