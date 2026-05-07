import { styleVariants } from "../vanilla/index.ts";

// Text alignment: ta-l, ta-r, ta-c, ta-j
export const textAlign = styleVariants(
  {
    l: { textAlign: "left" },
    r: { textAlign: "right" },
    c: { textAlign: "center" },
    j: { textAlign: "justify" },
  },
  "ta",
);

// Text decoration
export const textDecoration = styleVariants(
  {
    none: { textDecoration: "none" },
    underline: { textDecoration: "underline" },
    lineThrough: { textDecoration: "line-through" },
  },
  "td",
);

// Text transform
export const textTransform = styleVariants(
  {
    upper: { textTransform: "uppercase" },
    lower: { textTransform: "lowercase" },
    cap: { textTransform: "capitalize" },
    none: { textTransform: "none" },
  },
  "tt",
);
