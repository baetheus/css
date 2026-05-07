import { createGlobalTheme } from "../vanilla/index.ts";
import {
  BREAKPOINTS,
  FONT_SIZE_SCALE,
  SPACING_SCALE,
  THEME_COLORS,
} from "./config.ts";

// Generate all CSS custom properties
export function generateCustomProperties(): void {
  createGlobalTheme(":root", {
    // Base sizes
    baseSize: "16px",
    fontSize: "calc(var(--baseSize) / 1)",
    fillSize: "calc(var(--baseSize) / 16)",
    radiusSize: "calc(var(--baseSize) / 4)",

    // Breakpoints
    breakpoint: Object.fromEntries(
      Object.entries(BREAKPOINTS).map(([key, value]) => [key, value]),
    ),

    // Spacing
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, value]) => [key, `${value}px`]),
    ),

    // Font sizes
    fontSizes: Object.fromEntries(
      Object.entries(FONT_SIZE_SCALE).map(([key, value]) => [key, value]),
    ),

    // Theme colors
    color: Object.fromEntries(
      THEME_COLORS.map((theme) => [
        theme.label,
        {
          foreground: theme.foreground,
          background: theme.background,
          edge: theme.edge,
        },
      ]),
    ),
  });
}
