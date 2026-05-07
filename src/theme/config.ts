// Breakpoints (mobile-first, min-width)
export const BREAKPOINTS = {
  sm: "50em", // ~800px
  md: "75em", // ~1200px
  lg: "90em", // ~1440px
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Spacing scale multipliers (exponential: 0, 1, 2, 4, 8, 16, 32, 64)
export const SPACING_SCALE = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 4,
  "4": 8,
  "5": 16,
  "6": 32,
  "7": 64,
} as const;

export type SpacingKey = keyof typeof SPACING_SCALE;

// Font size scale (bidirectional logarithmic)
export const FONT_SIZE_SCALE = {
  u5: "2em",
  u4: "1.7511em",
  u3: "1.5157em",
  u2: "1.3195em",
  u1: "1.1487em",
  "0": "1em",
  d1: "0.8706em",
  d2: "0.7579em",
  d3: "0.6599em",
  d4: "0.5745em",
  d5: "0.5em",
} as const;

// Font weight scale
export const FONT_WEIGHT_SCALE = {
  u3: 700,
  u2: 600,
  u1: 500,
  "0": 400,
  d1: 300,
  d2: 200,
  d3: 100,
} as const;

// Theme colors
export interface ThemeColor {
  label: string;
  foreground: string;
  background: string;
  edge: string;
  pseudoClasses?: string[];
}

export const THEME_COLORS: ThemeColor[] = [
  {
    label: "base",
    foreground: "#111111",
    background: "#ffffff",
    edge: "#111111",
  },
  {
    label: "primary",
    foreground: "#ffffff",
    background: "#357edd",
    edge: "#ffffff",
  },
  {
    label: "secondary",
    foreground: "#555555",
    background: "#96ccff",
    edge: "#555555",
  },
  {
    label: "link",
    foreground: "#357edd",
    background: "#ffffff",
    edge: "#357edd",
  },
  {
    label: "visited",
    foreground: "#a463f2",
    background: "#ffffff",
    edge: "#a463f2",
    pseudoClasses: ["visited"],
  },
  {
    label: "focus",
    foreground: "#555555",
    background: "#ffb700",
    edge: "#555555",
    pseudoClasses: ["focus", "focus-within"],
  },
  {
    label: "required",
    foreground: "#357edd",
    background: "#ffffff",
    edge: "#357edd",
    pseudoClasses: ["required"],
  },
  {
    label: "error",
    foreground: "#ff4136",
    background: "#ffdfdf",
    edge: "#ff4136",
    pseudoClasses: ["invalid"],
  },
  {
    label: "disabled",
    foreground: "#777777",
    background: "#eeeeee",
    edge: "#777777",
    pseudoClasses: ["disabled"],
  },
];

// Directions for spacing utilities
export type Direction = "a" | "x" | "y" | "t" | "r" | "b" | "l";

export const DIRECTION_MAP: Record<Direction, string[]> = {
  a: ["top", "right", "bottom", "left"],
  x: ["left", "right"],
  y: ["top", "bottom"],
  t: ["top"],
  r: ["right"],
  b: ["bottom"],
  l: ["left"],
};
