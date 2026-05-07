import { styleVariants } from "../vanilla/index.ts";
import { withResponsive } from "./responsive.ts";

// Width percentages: w-p10, w-p25, w-p50, w-p75, w-p100
const widthPercentages = Object.fromEntries(
  [10, 20, 25, 30, 33, 40, 50, 60, 66, 70, 75, 80, 90, 100].map((p) => [
    `p${p}`,
    { width: `${p}%` },
  ]),
);

// Width auto and viewport
const widthSpecial = {
  auto: { width: "auto" },
  vw100: { width: "100vw" },
  full: { width: "100%" },
  min: { width: "min-content" },
  max: { width: "max-content" },
  fit: { width: "fit-content" },
};

export const width = styleVariants(
  withResponsive({ ...widthPercentages, ...widthSpecial }),
  "w",
);

// Max-width
export const maxWidth = styleVariants(
  withResponsive({ ...widthPercentages, none: { maxWidth: "none" } }),
  "mxw",
);

// Height
const heightStyles = {
  auto: { height: "auto" },
  full: { height: "100%" },
  screen: { height: "100vh" },
  min: { height: "min-content" },
  max: { height: "max-content" },
  fit: { height: "fit-content" },
  p25: { height: "25%" },
  p50: { height: "50%" },
  p75: { height: "75%" },
  p100: { height: "100%" },
  vh25: { height: "25vh" },
  vh50: { height: "50vh" },
  vh75: { height: "75vh" },
  vh100: { height: "100vh" },
};

export const height = styleVariants(withResponsive(heightStyles), "h");

// Min-height
export const minHeight = styleVariants(
  withResponsive({
    "0": { minHeight: 0 },
    full: { minHeight: "100%" },
    screen: { minHeight: "100vh" },
  }),
  "mnh",
);
