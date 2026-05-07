import { styleVariants } from "../vanilla/index.ts";

export const cursor = styleVariants(
  {
    auto: { cursor: "auto" },
    default: { cursor: "default" },
    pointer: { cursor: "pointer" },
    wait: { cursor: "wait" },
    text: { cursor: "text" },
    move: { cursor: "move" },
    help: { cursor: "help" },
    notAllowed: { cursor: "not-allowed" },
    grab: { cursor: "grab" },
    grabbing: { cursor: "grabbing" },
  },
  "crsr",
);
