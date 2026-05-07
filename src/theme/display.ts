import { styleVariants } from "../vanilla/index.ts";

// ds-in, ds-ib, ds-bl, ds-fl, ds-gr, ds-no
export const display = styleVariants(
  {
    in: { display: "inline" },
    ib: { display: "inline-block" },
    bl: { display: "block" },
    fl: { display: "flex" },
    gr: { display: "grid" },
    no: { display: "none" },
  },
  "ds",
);
