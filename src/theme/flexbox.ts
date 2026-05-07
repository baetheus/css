import { styleVariants } from "../vanilla/index.ts";
import { SPACING_SCALE } from "./config.ts";
import { withResponsive } from "./responsive.ts";

// fld-row, fld-col, fld-rowr, fld-colr
export const flexDirection = styleVariants(
  {
    row: { display: "flex", flexDirection: "row" },
    col: { display: "flex", flexDirection: "column" },
    rowr: { display: "flex", flexDirection: "row-reverse" },
    colr: { display: "flex", flexDirection: "column-reverse" },
  },
  "fld",
);

// jc-start, jc-end, jc-ctr, jc-spb, jc-spa, jc-spe
export const justifyContent = styleVariants(
  {
    start: { justifyContent: "flex-start" },
    end: { justifyContent: "flex-end" },
    ctr: { justifyContent: "center" },
    spb: { justifyContent: "space-between" },
    spa: { justifyContent: "space-around" },
    spe: { justifyContent: "space-evenly" },
  },
  "jc",
);

// ai-start, ai-end, ai-ctr, ai-str, ai-base
export const alignItems = styleVariants(
  {
    start: { alignItems: "flex-start" },
    end: { alignItems: "flex-end" },
    ctr: { alignItems: "center" },
    str: { alignItems: "stretch" },
    base: { alignItems: "baseline" },
  },
  "ai",
);

// as-start, as-end, as-ctr, as-str
export const alignSelf = styleVariants(
  {
    start: { alignSelf: "flex-start" },
    end: { alignSelf: "flex-end" },
    ctr: { alignSelf: "center" },
    str: { alignSelf: "stretch" },
  },
  "as",
);

// flw-nowrap, flw-wrap, flw-wrapr
export const flexWrap = styleVariants(
  {
    nowrap: { flexWrap: "nowrap" },
    wrap: { flexWrap: "wrap" },
    wrapr: { flexWrap: "wrap-reverse" },
  },
  "flw",
);

// fls-0 through fls-4 (flex-grow values)
export const flexSize = styleVariants(
  {
    "0": { flexGrow: 0, flexShrink: 0 },
    "1": { flexGrow: 1, flexShrink: 1 },
    "2": { flexGrow: 2, flexShrink: 0 },
    "3": { flexGrow: 3, flexShrink: 0 },
    "4": { flexGrow: 4, flexShrink: 0 },
  },
  "fls",
);

// flb-auto, flb-fill, flb-p25, flb-p50, flb-p75, flb-p100
export const flexBasis = styleVariants(
  {
    auto: { flexBasis: "auto" },
    fill: { flexBasis: "100%" },
    p25: { flexBasis: "25%" },
    p50: { flexBasis: "50%" },
    p75: { flexBasis: "75%" },
    p100: { flexBasis: "100%" },
  },
  "flb",
);

// flg-0 through flg-7 (gap using spacing scale)
export const flexGap = styleVariants(
  withResponsive(
    Object.fromEntries(
      Object.entries(SPACING_SCALE).map((
        [key, value],
      ) => [key, { gap: value }]),
    ),
  ),
  "flg",
);
