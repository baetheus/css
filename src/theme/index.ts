import { getRegistry } from "../vanilla/index.ts";

// Spacing
export { margin, padding } from "./spacing.ts";

// Typography
export { fontSize, fontWeight } from "./typography.ts";
export { textAlign, textDecoration, textTransform } from "./text.ts";

// Flexbox
export {
  alignItems,
  alignSelf,
  flexBasis,
  flexDirection,
  flexGap,
  flexSize,
  flexWrap,
  justifyContent,
} from "./flexbox.ts";

// Layout
export { display } from "./display.ts";
export { overflow } from "./overflow.ts";
export { height, maxWidth, minHeight, width } from "./dimensions.ts";

// Visual
export { color } from "./colors.ts";
export { borderRadius, borderStyle, borderWidth } from "./border.ts";
export { shadow } from "./shadow.ts";

// Interaction
export { cursor } from "./cursor.ts";

// Configuration
export * from "./config.ts";
export { generateCustomProperties } from "./variables.ts";
export { atBreakpoint, withResponsive } from "./responsive.ts";

// Import all utilities to register them
import { margin, padding } from "./spacing.ts";
import { fontSize, fontWeight } from "./typography.ts";
import { textAlign, textDecoration, textTransform } from "./text.ts";
import {
  alignItems,
  alignSelf,
  flexBasis,
  flexDirection,
  flexGap,
  flexSize,
  flexWrap,
  justifyContent,
} from "./flexbox.ts";
import { display } from "./display.ts";
import { overflow } from "./overflow.ts";
import { height, maxWidth, minHeight, width } from "./dimensions.ts";
import { color } from "./colors.ts";
import { borderRadius, borderStyle, borderWidth } from "./border.ts";
import { shadow } from "./shadow.ts";
import { cursor } from "./cursor.ts";
import { generateCustomProperties } from "./variables.ts";

// All classes combined
export const theme = {
  padding,
  margin,
  fontSize,
  fontWeight,
  textAlign,
  textDecoration,
  textTransform,
  flexDirection,
  justifyContent,
  alignItems,
  alignSelf,
  flexWrap,
  flexSize,
  flexBasis,
  flexGap,
  display,
  overflow,
  width,
  maxWidth,
  height,
  minHeight,
  color,
  borderWidth,
  borderRadius,
  borderStyle,
  shadow,
  cursor,
};

// Generate full CSS
export function generateThemeCss(): string {
  generateCustomProperties();
  // All style() calls have already registered with the registry
  return getRegistry().render();
}
