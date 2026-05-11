/**
 * Pico CSS replication using @baetheus/css
 *
 * A minimalist CSS framework that styles semantic HTML elements by default.
 * Features automatic dark mode, responsive typography, and CSS custom properties.
 *
 * @see https://picocss.com/docs
 * @module
 */

import { createVars, CSSRef, globalStyle, render, style } from "../core.ts";

// =============================================================================
// CSS Variable Contract
// =============================================================================

export const picoVars = createVars({
  // Typography
  fontFamily: null,
  fontFamilySans: null,
  fontFamilyMono: null,
  fontFamilyEmoji: null,
  fontSize: null,
  fontWeight: null,
  lineHeight: null,
  textUnderlineOffset: null,

  // Spacing
  spacing: null,
  typographySpacingVertical: null,
  blockSpacingVertical: null,
  blockSpacingHorizontal: null,
  gridColumnGap: null,
  gridRowGap: null,
  formElementSpacingVertical: null,
  formElementSpacingHorizontal: null,
  navElementSpacingVertical: null,
  navElementSpacingHorizontal: null,

  // Borders
  borderRadius: null,
  borderWidth: null,
  outlineWidth: null,

  // Transitions
  transition: null,

  // Colors
  backgroundColor: null,
  color: null,
  h1Color: null,
  h2Color: null,
  h3Color: null,
  h4Color: null,
  h5Color: null,
  h6Color: null,
  mutedColor: null,
  mutedBorderColor: null,

  // Primary
  primary: null,
  primaryBackground: null,
  primaryHover: null,
  primaryHoverBackground: null,
  primaryFocus: null,
  primaryInverse: null,

  // Secondary
  secondary: null,
  secondaryBackground: null,
  secondaryHover: null,
  secondaryHoverBackground: null,
  secondaryFocus: null,
  secondaryInverse: null,

  // Contrast
  contrast: null,
  contrastBackground: null,
  contrastHover: null,
  contrastHoverBackground: null,
  contrastFocus: null,
  contrastInverse: null,

  // Form
  formElementBackground: null,
  formElementBorderColor: null,
  formElementColor: null,
  formElementPlaceholder: null,
  formElementActiveBackground: null,
  formElementActiveBorderColor: null,
  formElementFocusColor: null,
  formElementDisabledBackground: null,
  formElementDisabledBorderColor: null,
  formElementDisabledOpacity: null,
  formElementValidBorderColor: null,
  formElementInvalidBorderColor: null,

  // Switch
  switchBackground: null,
  switchColor: null,
  switchCheckedBackground: null,

  // Range
  rangeBackground: null,
  rangeThumbBackground: null,
  rangeThumbBorderColor: null,

  // Table
  tableHeaderBackground: null,
  tableBorderColor: null,
  tableRowStripeBackground: null,

  // Code
  codeBackground: null,
  codeColor: null,

  // Blockquote
  blockquoteBorderColor: null,
  blockquoteFooterColor: null,

  // Modal
  modalOverlayBackground: null,

  // Card
  cardBackground: null,
  cardBorderColor: null,
  cardSectioningBackground: null,

  // Accordion
  accordionBorderColor: null,
  accordionActiveBackground: null,
  accordionOpenSummaryColor: null,

  // Progress
  progressBackground: null,
  progressColor: null,

  // Loading
  loadingSpinner: null,

  // Tooltip
  tooltipBackground: null,
  tooltipColor: null,

  // Mark
  markBackground: null,
  markColor: null,

  // Insertion/Deletion
  insColor: null,
  delColor: null,

  // Selection
  selectionBackground: null,
  selectionColor: null,

  // Focus
  focusColor: null,

  // Icons (data URIs)
  iconCheckbox: null,
  iconChevron: null,
  iconClose: null,
  iconDate: null,
  iconInvalid: null,
  iconMinus: null,
  iconSearch: null,
  iconTime: null,
  iconValid: null,
});

// =============================================================================
// Light Theme Values
// =============================================================================

const lightThemeVars: Record<string, string> = {
  // Typography
  "--fontFamily":
    'system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif, var(--fontFamilyEmoji)',
  "--fontFamilySans":
    'system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  "--fontFamilyMono":
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  "--fontFamilyEmoji":
    '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  "--fontSize": "100%",
  "--fontWeight": "400",
  "--lineHeight": "1.5",
  "--textUnderlineOffset": "0.1rem",

  // Spacing
  "--spacing": "1rem",
  "--typographySpacingVertical": "1rem",
  "--blockSpacingVertical": "1rem",
  "--blockSpacingHorizontal": "1rem",
  "--gridColumnGap": "1rem",
  "--gridRowGap": "1rem",
  "--formElementSpacingVertical": "0.75rem",
  "--formElementSpacingHorizontal": "1rem",
  "--navElementSpacingVertical": "1rem",
  "--navElementSpacingHorizontal": "0.5rem",

  // Borders
  "--borderRadius": "0.25rem",
  "--borderWidth": "0.0625rem",
  "--outlineWidth": "0.1875rem",

  // Transitions
  "--transition": "0.2s ease-in-out",

  // Colors - Light theme
  "--backgroundColor": "#fff",
  "--color": "#373c44",
  "--h1Color": "#1b1f24",
  "--h2Color": "#24292e",
  "--h3Color": "#2d3339",
  "--h4Color": "#373c44",
  "--h5Color": "#40464f",
  "--h6Color": "#4a505a",
  "--mutedColor": "#646b79",
  "--mutedBorderColor": "#d5d9e0",

  // Primary
  "--primary": "#0172ad",
  "--primaryBackground": "#0172ad",
  "--primaryHover": "#015d8d",
  "--primaryHoverBackground": "#015d8d",
  "--primaryFocus": "rgba(1, 114, 173, 0.25)",
  "--primaryInverse": "#fff",

  // Secondary
  "--secondary": "#5d6b89",
  "--secondaryBackground": "#5d6b89",
  "--secondaryHover": "#4a566d",
  "--secondaryHoverBackground": "#4a566d",
  "--secondaryFocus": "rgba(93, 107, 137, 0.25)",
  "--secondaryInverse": "#fff",

  // Contrast
  "--contrast": "#181c25",
  "--contrastBackground": "#181c25",
  "--contrastHover": "#000",
  "--contrastHoverBackground": "#000",
  "--contrastFocus": "rgba(24, 28, 37, 0.25)",
  "--contrastInverse": "#fff",

  // Form
  "--formElementBackground": "#fff",
  "--formElementBorderColor": "#a4acbb",
  "--formElementColor": "#373c44",
  "--formElementPlaceholder": "#646b79",
  "--formElementActiveBackground": "#fff",
  "--formElementActiveBorderColor": "#0172ad",
  "--formElementFocusColor": "#0172ad",
  "--formElementDisabledBackground": "#d5d9e0",
  "--formElementDisabledBorderColor": "#a4acbb",
  "--formElementDisabledOpacity": "0.5",
  "--formElementValidBorderColor": "#298339",
  "--formElementInvalidBorderColor": "#c62828",

  // Switch
  "--switchBackground": "#bfc6d3",
  "--switchColor": "#fff",
  "--switchCheckedBackground": "#0172ad",

  // Range
  "--rangeBackground": "#d5d9e0",
  "--rangeThumbBackground": "#0172ad",
  "--rangeThumbBorderColor": "#0172ad",

  // Table
  "--tableHeaderBackground": "#f7f8f9",
  "--tableBorderColor": "#e1e4e8",
  "--tableRowStripeBackground": "#f7f8f9",

  // Code
  "--codeBackground": "#f0f2f5",
  "--codeColor": "#373c44",

  // Blockquote
  "--blockquoteBorderColor": "#d5d9e0",
  "--blockquoteFooterColor": "#646b79",

  // Modal
  "--modalOverlayBackground": "rgba(24, 28, 37, 0.75)",

  // Card
  "--cardBackground": "#fff",
  "--cardBorderColor": "#e1e4e8",
  "--cardSectioningBackground": "#f7f8f9",

  // Accordion
  "--accordionBorderColor": "#d5d9e0",
  "--accordionActiveBackground": "#f0f2f5",
  "--accordionOpenSummaryColor": "#0172ad",

  // Progress
  "--progressBackground": "#d5d9e0",
  "--progressColor": "#0172ad",

  // Loading
  "--loadingSpinner":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%230172ad' stroke-linecap='round' stroke-width='2' d='M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83'/%3E%3C/svg%3E\")",

  // Tooltip
  "--tooltipBackground": "#181c25",
  "--tooltipColor": "#fff",

  // Mark
  "--markBackground": "#fff2ca",
  "--markColor": "#373c44",

  // Insertion/Deletion
  "--insColor": "#298339",
  "--delColor": "#c62828",

  // Selection
  "--selectionBackground": "rgba(1, 114, 173, 0.25)",
  "--selectionColor": "inherit",

  // Focus
  "--focusColor": "rgba(1, 114, 173, 0.25)",

  // Icons
  "--iconCheckbox":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")",
  "--iconChevron":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23646b79' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  "--iconClose":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23646b79' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconDate":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23646b79' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconInvalid":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23c62828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconMinus":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconSearch":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23646b79' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconTime":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23646b79' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E\")",
  "--iconValid":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23298339' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")",
};

// =============================================================================
// Dark Theme Values
// =============================================================================

const darkThemeVars: Record<string, string> = {
  // Colors - Dark theme
  "--backgroundColor": "rgb(19, 22, 31)",
  "--color": "#c2c7d0",
  "--h1Color": "#e9eaec",
  "--h2Color": "#d5d8dd",
  "--h3Color": "#c2c7d0",
  "--h4Color": "#afb5c0",
  "--h5Color": "#9ca4b1",
  "--h6Color": "#8993a1",
  "--mutedColor": "#7b8495",
  "--mutedBorderColor": "#3f4552",

  // Primary
  "--primary": "#01aaff",
  "--primaryBackground": "#01aaff",
  "--primaryHover": "#33bbff",
  "--primaryHoverBackground": "#33bbff",
  "--primaryFocus": "rgba(1, 170, 255, 0.25)",
  "--primaryInverse": "#000",

  // Secondary
  "--secondary": "#969eaf",
  "--secondaryBackground": "#969eaf",
  "--secondaryHover": "#b5bbc7",
  "--secondaryHoverBackground": "#b5bbc7",
  "--secondaryFocus": "rgba(150, 158, 175, 0.25)",
  "--secondaryInverse": "#000",

  // Contrast
  "--contrast": "#dfe3eb",
  "--contrastBackground": "#dfe3eb",
  "--contrastHover": "#fff",
  "--contrastHoverBackground": "#fff",
  "--contrastFocus": "rgba(223, 227, 235, 0.25)",
  "--contrastInverse": "#000",

  // Form
  "--formElementBackground": "rgb(26, 30, 40)",
  "--formElementBorderColor": "#4a5568",
  "--formElementColor": "#c2c7d0",
  "--formElementPlaceholder": "#7b8495",
  "--formElementActiveBackground": "rgb(26, 30, 40)",
  "--formElementActiveBorderColor": "#01aaff",
  "--formElementFocusColor": "#01aaff",
  "--formElementDisabledBackground": "rgb(35, 40, 52)",
  "--formElementDisabledBorderColor": "#3f4552",
  "--formElementValidBorderColor": "#4caf50",
  "--formElementInvalidBorderColor": "#ef5350",

  // Switch
  "--switchBackground": "#4a5568",
  "--switchColor": "#c2c7d0",
  "--switchCheckedBackground": "#01aaff",

  // Range
  "--rangeBackground": "#3f4552",
  "--rangeThumbBackground": "#01aaff",
  "--rangeThumbBorderColor": "#01aaff",

  // Table
  "--tableHeaderBackground": "rgb(26, 30, 40)",
  "--tableBorderColor": "#3f4552",
  "--tableRowStripeBackground": "rgb(26, 30, 40)",

  // Code
  "--codeBackground": "rgb(26, 30, 40)",
  "--codeColor": "#c2c7d0",

  // Blockquote
  "--blockquoteBorderColor": "#3f4552",
  "--blockquoteFooterColor": "#7b8495",

  // Modal
  "--modalOverlayBackground": "rgba(0, 0, 0, 0.8)",

  // Card
  "--cardBackground": "rgb(26, 30, 40)",
  "--cardBorderColor": "#3f4552",
  "--cardSectioningBackground": "rgb(35, 40, 52)",

  // Accordion
  "--accordionBorderColor": "#3f4552",
  "--accordionActiveBackground": "rgb(35, 40, 52)",
  "--accordionOpenSummaryColor": "#01aaff",

  // Progress
  "--progressBackground": "#3f4552",
  "--progressColor": "#01aaff",

  // Loading
  "--loadingSpinner":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%2301aaff' stroke-linecap='round' stroke-width='2' d='M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83'/%3E%3C/svg%3E\")",

  // Tooltip
  "--tooltipBackground": "#e9eaec",
  "--tooltipColor": "#181c25",

  // Mark
  "--markBackground": "#5c4d00",
  "--markColor": "#e9eaec",

  // Insertion/Deletion
  "--insColor": "#4caf50",
  "--delColor": "#ef5350",

  // Selection
  "--selectionBackground": "rgba(1, 170, 255, 0.25)",

  // Focus
  "--focusColor": "rgba(1, 170, 255, 0.25)",

  // Icons (updated colors for dark mode)
  "--iconChevron":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%237b8495' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  "--iconClose":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%237b8495' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconDate":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%237b8495' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconInvalid":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef5350' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconSearch":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%237b8495' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E\")",
  "--iconTime":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%237b8495' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E\")",
  "--iconValid":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234caf50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")",
};

// =============================================================================
// Root Styles with Theme Variables
// =============================================================================

const rootLightTheme = globalStyle(":root", {
  vars: lightThemeVars,
});

const rootDarkTheme = globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: darkThemeVars,
    },
  },
});

// =============================================================================
// Reset
// =============================================================================

const resetAll = globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
  backgroundRepeat: "no-repeat",
});

const resetBeforeAfter = globalStyle("::before, ::after", {
  textDecoration: "inherit",
  verticalAlign: "inherit",
});

const resetHidden = globalStyle(":where([hidden])", {
  display: "none",
});

// =============================================================================
// Document
// =============================================================================

const htmlStyle = globalStyle("html", {
  lineHeight: picoVars.lineHeight,
  fontSize: picoVars.fontSize,
  WebkitTextSizeAdjust: "100%",
  WebkitTapHighlightColor: "transparent",
  textSizeAdjust: "100%",
  "@media": {
    "(min-width: 576px)": { fontSize: "106.25%" },
    "(min-width: 768px)": { fontSize: "112.5%" },
    "(min-width: 992px)": { fontSize: "118.75%" },
    "(min-width: 1200px)": { fontSize: "125%" },
    "(min-width: 1400px)": { fontSize: "131.25%" },
  },
});

const bodyStyle = globalStyle("body", {
  margin: 0,
  padding: 0,
  width: "100%",
  minHeight: "100vh",
  fontFamily: picoVars.fontFamily,
  fontWeight: picoVars.fontWeight,
  fontSize: "1rem",
  lineHeight: picoVars.lineHeight,
  backgroundColor: picoVars.backgroundColor,
  color: picoVars.color,
  textRendering: "optimizeLegibility",
});

// =============================================================================
// Container
// =============================================================================

const containerStyle = globalStyle(".container, .container-fluid", {
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: picoVars.spacing,
  paddingRight: picoVars.spacing,
});

const containerBreakpoints = globalStyle(".container", {
  "@media": {
    "(min-width: 576px)": { maxWidth: "510px" },
    "(min-width: 768px)": { maxWidth: "700px" },
    "(min-width: 992px)": { maxWidth: "920px" },
    "(min-width: 1200px)": { maxWidth: "1130px" },
    "(min-width: 1400px)": { maxWidth: "1320px" },
  },
});

// =============================================================================
// Selection
// =============================================================================

const selectionStyle = globalStyle("::selection", {
  backgroundColor: picoVars.selectionBackground,
  color: picoVars.selectionColor,
});

// =============================================================================
// Typography - Headings
// =============================================================================

const headingsStyle = globalStyle("h1, h2, h3, h4, h5, h6", {
  marginTop: 0,
  marginBottom: picoVars.typographySpacingVertical,
  fontWeight: 700,
  lineHeight: 1.25,
});

const h1Style = globalStyle("h1", {
  fontSize: "2rem",
  color: picoVars.h1Color,
});

const h2Style = globalStyle("h2", {
  fontSize: "1.75rem",
  color: picoVars.h2Color,
});

const h3Style = globalStyle("h3", {
  fontSize: "1.5rem",
  color: picoVars.h3Color,
});

const h4Style = globalStyle("h4", {
  fontSize: "1.25rem",
  color: picoVars.h4Color,
});

const h5Style = globalStyle("h5", {
  fontSize: "1.125rem",
  color: picoVars.h5Color,
});

const h6Style = globalStyle("h6", {
  fontSize: "1rem",
  color: picoVars.h6Color,
});

// =============================================================================
// Typography - Text Elements
// =============================================================================

const pStyle = globalStyle("p", {
  marginTop: 0,
  marginBottom: picoVars.typographySpacingVertical,
});

const aStyle = globalStyle("a, [role='link']", {
  color: picoVars.primary,
  textDecoration: "underline",
  textUnderlineOffset: picoVars.textUnderlineOffset,
  transition: `color ${picoVars.transition}`,
  selectors: {
    "&:hover": {
      color: picoVars.primaryHover,
    },
    "&:focus-visible": {
      outline: `${picoVars.outlineWidth} solid ${picoVars.focusColor}`,
      outlineOffset: picoVars.outlineWidth,
    },
  },
});

const smallStyle = globalStyle("small", {
  fontSize: "0.875em",
});

const strongStyle = globalStyle("strong, b", {
  fontWeight: 700,
});

const emStyle = globalStyle("em, i", {
  fontStyle: "italic",
});

const markStyle = globalStyle("mark", {
  backgroundColor: picoVars.markBackground,
  color: picoVars.markColor,
  padding: "0.125rem 0.25rem",
  borderRadius: picoVars.borderRadius,
});

const abbrStyle = globalStyle("abbr[title]", {
  textDecoration: "underline dotted",
  cursor: "help",
  borderBottom: "none",
});

const insStyle = globalStyle("ins", {
  color: picoVars.insColor,
  textDecoration: "underline",
});

const delStyle = globalStyle("del", {
  color: picoVars.delColor,
  textDecoration: "line-through",
});

const subSupStyle = globalStyle("sub, sup", {
  fontSize: "0.75em",
  lineHeight: 0,
  position: "relative",
  verticalAlign: "baseline",
});

const supStyle = globalStyle("sup", {
  top: "-0.5em",
});

const subStyle = globalStyle("sub", {
  bottom: "-0.25em",
});

// =============================================================================
// Inline Semantics - Code
// =============================================================================

const codeKbdSampStyle = globalStyle("code, kbd, samp, pre", {
  fontFamily: picoVars.fontFamilyMono,
  fontSize: "0.875em",
});

const codeInlineStyle = globalStyle(
  ":where(:not(pre) > code, :not(pre) > samp)",
  {
    backgroundColor: picoVars.codeBackground,
    color: picoVars.codeColor,
    padding: "0.125rem 0.375rem",
    borderRadius: picoVars.borderRadius,
    whiteSpace: "nowrap",
  },
);

const kbdStyle = globalStyle("kbd", {
  backgroundColor: picoVars.contrast,
  color: picoVars.contrastInverse,
  padding: "0.125rem 0.375rem",
  borderRadius: picoVars.borderRadius,
  fontWeight: 700,
});

const preStyle = globalStyle("pre", {
  marginTop: 0,
  marginBottom: picoVars.typographySpacingVertical,
  padding: picoVars.spacing,
  backgroundColor: picoVars.codeBackground,
  borderRadius: picoVars.borderRadius,
  overflow: "auto",
  WebkitOverflowScrolling: "touch",
  selectors: {
    "& code": {
      display: "block",
      padding: 0,
      backgroundColor: "transparent",
      whiteSpace: "pre",
    },
  },
});

// =============================================================================
// Lists
// =============================================================================

const listStyle = globalStyle("ul, ol", {
  marginTop: 0,
  marginBottom: picoVars.typographySpacingVertical,
  paddingLeft: "1.5rem",
  selectors: {
    "& ul, & ol": {
      marginBottom: 0,
    },
  },
});

const liStyle = globalStyle("li", {
  marginBottom: "0.25rem",
});

const dlStyle = globalStyle("dl", {
  marginTop: 0,
  marginBottom: picoVars.typographySpacingVertical,
});

const dtStyle = globalStyle("dt", {
  fontWeight: 700,
});

const ddStyle = globalStyle("dd", {
  marginLeft: 0,
  marginBottom: "0.5rem",
});

// =============================================================================
// Blockquote, HR, Figure
// =============================================================================

const blockquoteStyle = globalStyle("blockquote", {
  margin: `0 0 ${picoVars.typographySpacingVertical} 0`,
  padding: `${picoVars.spacing} ${picoVars.spacing}`,
  borderLeft: `0.25rem solid ${picoVars.blockquoteBorderColor}`,
  fontStyle: "italic",
  selectors: {
    "& footer": {
      marginTop: "0.5rem",
      color: picoVars.blockquoteFooterColor,
      fontSize: "0.875em",
    },
    "& footer::before": {
      content: '"— "',
    },
  },
});

const hrStyle = globalStyle("hr", {
  margin: `${picoVars.typographySpacingVertical} 0`,
  border: 0,
  borderTop: `${picoVars.borderWidth} solid ${picoVars.mutedBorderColor}`,
  height: 0,
  color: "inherit",
});

const figureStyle = globalStyle("figure", {
  margin: `0 0 ${picoVars.typographySpacingVertical} 0`,
  padding: 0,
});

const figcaptionStyle = globalStyle("figcaption", {
  marginTop: "0.5rem",
  color: picoVars.mutedColor,
  fontSize: "0.875em",
});

// =============================================================================
// Embedded Content
// =============================================================================

const imgStyle = globalStyle("img", {
  maxWidth: "100%",
  height: "auto",
  borderStyle: "none",
  verticalAlign: "middle",
});

const iframeStyle = globalStyle("iframe", {
  border: 0,
});

const videoAudioStyle = globalStyle("video, audio, canvas, svg", {
  maxWidth: "100%",
  height: "auto",
});

const svgNotRootStyle = globalStyle("svg:not(:root)", {
  overflow: "hidden",
});

// =============================================================================
// Tables
// =============================================================================

const tableStyle = globalStyle("table", {
  width: "100%",
  marginBottom: picoVars.typographySpacingVertical,
  borderCollapse: "collapse",
  borderSpacing: 0,
});

const thTdStyle = globalStyle("th, td", {
  padding: `calc(${picoVars.spacing} / 2) ${picoVars.spacing}`,
  borderBottom: `${picoVars.borderWidth} solid ${picoVars.tableBorderColor}`,
  textAlign: "left",
  verticalAlign: "top",
});

const thStyle = globalStyle("th", {
  fontWeight: 700,
  backgroundColor: picoVars.tableHeaderBackground,
});

const theadThStyle = globalStyle("thead th", {
  borderBottomWidth: "0.125rem",
});

const tfootStyle = globalStyle("tfoot th, tfoot td", {
  borderBottom: "none",
  borderTop: `${picoVars.borderWidth} solid ${picoVars.tableBorderColor}`,
});

const tableStriped = globalStyle(
  "table:where(.striped) tbody tr:nth-child(odd)",
  {
    backgroundColor: picoVars.tableRowStripeBackground,
  },
);

// =============================================================================
// Forms - Containers
// =============================================================================

const formStyle = globalStyle("form", {
  margin: 0,
});

const fieldsetStyle = globalStyle("fieldset", {
  margin: `0 0 ${picoVars.typographySpacingVertical} 0`,
  padding: picoVars.spacing,
  border: `${picoVars.borderWidth} solid ${picoVars.formElementBorderColor}`,
  borderRadius: picoVars.borderRadius,
});

const legendStyle = globalStyle("legend", {
  padding: `0 0.5rem`,
  fontSize: "1.125em",
  fontWeight: 700,
});

const labelStyle = globalStyle("label", {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: picoVars.fontWeight,
});

// =============================================================================
// Forms - Input Elements
// =============================================================================

const inputSelectors = [
  "input:not([type='checkbox']):not([type='radio']):not([type='range'])",
  "textarea",
  "select",
].join(", ");

const inputStyle = globalStyle(inputSelectors, {
  appearance: "none",
  width: "100%",
  margin: 0,
  padding:
    `${picoVars.formElementSpacingVertical} ${picoVars.formElementSpacingHorizontal}`,
  fontFamily: "inherit",
  fontSize: "1rem",
  fontWeight: picoVars.fontWeight,
  lineHeight: picoVars.lineHeight,
  color: picoVars.formElementColor,
  backgroundColor: picoVars.formElementBackground,
  border: `${picoVars.borderWidth} solid ${picoVars.formElementBorderColor}`,
  borderRadius: picoVars.borderRadius,
  outline: "none",
  transition:
    `border-color ${picoVars.transition}, box-shadow ${picoVars.transition}`,
  selectors: {
    "&::placeholder": {
      color: picoVars.formElementPlaceholder,
      opacity: 1,
    },
    "&:focus": {
      borderColor: picoVars.formElementActiveBorderColor,
      boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.focusColor}`,
    },
    "&:disabled, &[readonly]": {
      backgroundColor: picoVars.formElementDisabledBackground,
      borderColor: picoVars.formElementDisabledBorderColor,
      opacity: picoVars.formElementDisabledOpacity,
      cursor: "not-allowed",
    },
    "&[aria-invalid='true']": {
      borderColor: picoVars.formElementInvalidBorderColor,
    },
    "&[aria-invalid='false']": {
      borderColor: picoVars.formElementValidBorderColor,
    },
  },
});

const textareaStyle = globalStyle("textarea", {
  resize: "vertical",
  minHeight: "8rem",
});

const selectStyle = globalStyle("select", {
  backgroundImage: picoVars.iconChevron,
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem 1rem",
  paddingRight: "2.5rem",
  selectors: {
    "&:not([multiple]):not([size])": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "&[multiple]": {
      paddingRight: picoVars.formElementSpacingHorizontal,
      backgroundImage: "none",
    },
  },
});

const optgroupStyle = globalStyle("optgroup", {
  fontWeight: 700,
  fontStyle: "normal",
});

// =============================================================================
// Forms - Date/Time Inputs
// =============================================================================

const dateInputStyle = globalStyle(
  'input[type="date"], input[type="datetime-local"], input[type="month"], input[type="week"]',
  {
    backgroundImage: picoVars.iconDate,
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1rem 1rem",
    paddingRight: "2.5rem",
  },
);

const timeInputStyle = globalStyle('input[type="time"]', {
  backgroundImage: picoVars.iconTime,
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem 1rem",
  paddingRight: "2.5rem",
});

const searchInputStyle = globalStyle('input[type="search"]', {
  backgroundImage: picoVars.iconSearch,
  backgroundPosition: "left 0.75rem center",
  backgroundSize: "1rem 1rem",
  paddingLeft: "2.5rem",
  borderRadius: "5rem",
  selectors: {
    "&::-webkit-search-cancel-button": {
      WebkitAppearance: "none",
      display: "none",
    },
  },
});

// =============================================================================
// Forms - Checkboxes & Radios
// =============================================================================

const checkboxRadioStyle = globalStyle(
  'input[type="checkbox"], input[type="radio"]',
  {
    appearance: "none",
    width: "1.25rem",
    height: "1.25rem",
    margin: 0,
    marginRight: "0.5rem",
    marginTop: "0.125rem",
    padding: 0,
    border: `${picoVars.borderWidth} solid ${picoVars.formElementBorderColor}`,
    backgroundColor: picoVars.formElementBackground,
    verticalAlign: "top",
    cursor: "pointer",
    transition:
      `background-color ${picoVars.transition}, border-color ${picoVars.transition}`,
    selectors: {
      "&:checked": {
        backgroundColor: picoVars.primary,
        borderColor: picoVars.primary,
        backgroundImage: picoVars.iconCheckbox,
        backgroundPosition: "center",
        backgroundSize: "0.75rem 0.75rem",
      },
      "&:focus": {
        boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.focusColor}`,
      },
      "&:disabled": {
        opacity: picoVars.formElementDisabledOpacity,
        cursor: "not-allowed",
      },
      "&:indeterminate": {
        backgroundColor: picoVars.primary,
        borderColor: picoVars.primary,
        backgroundImage: picoVars.iconMinus,
        backgroundPosition: "center",
        backgroundSize: "0.75rem 0.75rem",
      },
    },
  },
);

const checkboxStyle = globalStyle('input[type="checkbox"]', {
  borderRadius: "0.25rem",
});

const radioStyle = globalStyle('input[type="radio"]', {
  borderRadius: "50%",
  selectors: {
    "&:checked": {
      backgroundImage: "none",
      backgroundSize: "0",
    },
    "&:checked::after": {
      content: '""',
      display: "block",
      width: "0.5rem",
      height: "0.5rem",
      margin: "0.3125rem",
      backgroundColor: picoVars.primaryInverse,
      borderRadius: "50%",
    },
  },
});

// =============================================================================
// Forms - Switch (role="switch")
// =============================================================================

const switchStyle = globalStyle('input[type="checkbox"][role="switch"]', {
  width: "2.5rem",
  height: "1.5rem",
  borderRadius: "1rem",
  backgroundColor: picoVars.switchBackground,
  borderColor: picoVars.switchBackground,
  transition: `background-color ${picoVars.transition}`,
  selectors: {
    "&::before": {
      content: '""',
      display: "block",
      width: "1rem",
      height: "1rem",
      margin: "0.1875rem",
      backgroundColor: picoVars.switchColor,
      borderRadius: "50%",
      transition: `transform ${picoVars.transition}`,
    },
    "&:checked": {
      backgroundColor: picoVars.switchCheckedBackground,
      borderColor: picoVars.switchCheckedBackground,
      backgroundImage: "none",
    },
    "&:checked::before": {
      transform: "translateX(1rem)",
    },
  },
});

// =============================================================================
// Forms - Range
// =============================================================================

const rangeStyle = globalStyle('input[type="range"]', {
  appearance: "none",
  width: "100%",
  height: "0.375rem",
  padding: 0,
  margin: "0.5rem 0",
  backgroundColor: picoVars.rangeBackground,
  borderRadius: "1rem",
  border: "none",
  cursor: "pointer",
  selectors: {
    "&::-webkit-slider-thumb": {
      WebkitAppearance: "none",
      appearance: "none",
      width: "1.25rem",
      height: "1.25rem",
      backgroundColor: picoVars.rangeThumbBackground,
      borderRadius: "50%",
      border: `2px solid ${picoVars.rangeThumbBorderColor}`,
      cursor: "pointer",
      transition: `background-color ${picoVars.transition}`,
    },
    "&::-moz-range-thumb": {
      width: "1.25rem",
      height: "1.25rem",
      backgroundColor: picoVars.rangeThumbBackground,
      borderRadius: "50%",
      border: `2px solid ${picoVars.rangeThumbBorderColor}`,
      cursor: "pointer",
      transition: `background-color ${picoVars.transition}`,
    },
    "&:focus::-webkit-slider-thumb": {
      boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.focusColor}`,
    },
    "&:focus::-moz-range-thumb": {
      boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.focusColor}`,
    },
  },
});

// =============================================================================
// Buttons
// =============================================================================

const buttonSelectors = [
  "button",
  '[type="submit"]',
  '[type="button"]',
  '[type="reset"]',
  '[role="button"]',
].join(", ");

const buttonStyle = globalStyle(buttonSelectors, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "auto",
  margin: 0,
  padding:
    `${picoVars.formElementSpacingVertical} ${picoVars.formElementSpacingHorizontal}`,
  fontFamily: "inherit",
  fontSize: "1rem",
  fontWeight: 700,
  lineHeight: picoVars.lineHeight,
  textAlign: "center",
  textDecoration: "none",
  color: picoVars.primaryInverse,
  backgroundColor: picoVars.primaryBackground,
  border: `${picoVars.borderWidth} solid ${picoVars.primary}`,
  borderRadius: picoVars.borderRadius,
  cursor: "pointer",
  outline: "none",
  transition:
    `background-color ${picoVars.transition}, border-color ${picoVars.transition}, color ${picoVars.transition}`,
  selectors: {
    "&:hover": {
      backgroundColor: picoVars.primaryHoverBackground,
      borderColor: picoVars.primaryHover,
    },
    "&:focus": {
      boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.primaryFocus}`,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none",
    },
  },
});

const buttonResetStyle = globalStyle('[type="reset"]', {
  backgroundColor: picoVars.secondaryBackground,
  borderColor: picoVars.secondary,
  selectors: {
    "&:hover": {
      backgroundColor: picoVars.secondaryHoverBackground,
      borderColor: picoVars.secondaryHover,
    },
    "&:focus": {
      boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.secondaryFocus}`,
    },
  },
});

const formButtonStyle = globalStyle(
  "form button:not([type]), form [type='submit']",
  {
    width: "100%",
  },
);

// Button Variants (scoped classes)
export const secondary = style(
  {
    backgroundColor: picoVars.secondaryBackground,
    borderColor: picoVars.secondary,
    color: picoVars.secondaryInverse,
    selectors: {
      "&:hover": {
        backgroundColor: picoVars.secondaryHoverBackground,
        borderColor: picoVars.secondaryHover,
      },
      "&:focus": {
        boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.secondaryFocus}`,
      },
    },
  },
  "secondary",
);

export const contrast = style(
  {
    backgroundColor: picoVars.contrastBackground,
    borderColor: picoVars.contrast,
    color: picoVars.contrastInverse,
    selectors: {
      "&:hover": {
        backgroundColor: picoVars.contrastHoverBackground,
        borderColor: picoVars.contrastHover,
      },
      "&:focus": {
        boxShadow: `0 0 0 ${picoVars.outlineWidth} ${picoVars.contrastFocus}`,
      },
    },
  },
  "contrast",
);

export const outline = style(
  {
    backgroundColor: "transparent",
    color: picoVars.primary,
    selectors: {
      "&:hover": {
        backgroundColor: picoVars.primaryBackground,
        color: picoVars.primaryInverse,
      },
    },
  },
  "outline",
);

export const outlineSecondary = style(
  {
    backgroundColor: "transparent",
    borderColor: picoVars.secondary,
    color: picoVars.secondary,
    selectors: {
      "&:hover": {
        backgroundColor: picoVars.secondaryBackground,
        borderColor: picoVars.secondary,
        color: picoVars.secondaryInverse,
      },
    },
  },
  "outline-secondary",
);

export const outlineContrast = style(
  {
    backgroundColor: "transparent",
    borderColor: picoVars.contrast,
    color: picoVars.contrast,
    selectors: {
      "&:hover": {
        backgroundColor: picoVars.contrastBackground,
        borderColor: picoVars.contrast,
        color: picoVars.contrastInverse,
      },
    },
  },
  "outline-contrast",
);

// =============================================================================
// Progress & Meter
// =============================================================================

const progressStyle = globalStyle("progress", {
  appearance: "none",
  width: "100%",
  height: "0.5rem",
  marginBottom: picoVars.typographySpacingVertical,
  border: 0,
  borderRadius: picoVars.borderRadius,
  backgroundColor: picoVars.progressBackground,
  color: picoVars.progressColor,
  selectors: {
    "&::-webkit-progress-bar": {
      backgroundColor: picoVars.progressBackground,
      borderRadius: picoVars.borderRadius,
    },
    "&::-webkit-progress-value": {
      backgroundColor: picoVars.progressColor,
      borderRadius: picoVars.borderRadius,
    },
    "&::-moz-progress-bar": {
      backgroundColor: picoVars.progressColor,
      borderRadius: picoVars.borderRadius,
    },
    "&:indeterminate": {
      backgroundImage:
        `linear-gradient(90deg, ${picoVars.progressColor} 30%, ${picoVars.progressBackground} 30%)`,
      backgroundSize: "200% 100%",
      animation: "progress-indeterminate 1.5s linear infinite",
    },
  },
});

const meterStyle = globalStyle("meter", {
  appearance: "none",
  width: "100%",
  height: "0.5rem",
  marginBottom: picoVars.typographySpacingVertical,
  border: 0,
  borderRadius: picoVars.borderRadius,
  backgroundColor: picoVars.progressBackground,
});

// =============================================================================
// Details / Summary (Accordion)
// =============================================================================

const detailsStyle = globalStyle("details", {
  marginBottom: picoVars.typographySpacingVertical,
  paddingBottom: picoVars.spacing,
  borderBottom:
    `${picoVars.borderWidth} solid ${picoVars.accordionBorderColor}`,
});

const summaryStyle = globalStyle("summary", {
  display: "list-item",
  padding: `${picoVars.spacing} 0`,
  cursor: "pointer",
  fontWeight: 700,
  transition: `color ${picoVars.transition}`,
  listStyle: "none",
  selectors: {
    "&::marker, &::-webkit-details-marker": {
      display: "none",
    },
    "&::after": {
      content: '""',
      display: "inline-block",
      width: "1rem",
      height: "1rem",
      marginLeft: "auto",
      float: "right",
      backgroundImage: picoVars.iconChevron,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "1rem 1rem",
      transition: `transform ${picoVars.transition}`,
    },
    "&:focus": {
      outline: "none",
    },
    "&:focus-visible": {
      outline: `${picoVars.outlineWidth} solid ${picoVars.focusColor}`,
      outlineOffset: picoVars.outlineWidth,
    },
  },
});

const detailsOpenStyle = globalStyle("details[open]", {
  selectors: {
    "& > summary": {
      color: picoVars.accordionOpenSummaryColor,
    },
    "& > summary::after": {
      transform: "rotate(180deg)",
    },
  },
});

// =============================================================================
// Dialog (Modal)
// =============================================================================

const dialogStyle = globalStyle("dialog", {
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  zIndex: 999,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "100%",
  margin: 0,
  padding: picoVars.spacing,
  border: 0,
  backgroundColor: picoVars.backgroundColor,
  color: picoVars.color,
  overflow: "auto",
  selectors: {
    "&::backdrop": {
      backgroundColor: picoVars.modalOverlayBackground,
      backdropFilter: "blur(0.25rem)",
    },
    "&:not([open])": {
      display: "none",
    },
  },
  "@media": {
    "(min-width: 576px)": {
      top: "50%",
      right: "auto",
      bottom: "auto",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "fit-content",
      minWidth: "320px",
      maxWidth: "calc(100vw - 2rem)",
      height: "fit-content",
      maxHeight: "calc(100vh - 2rem)",
      borderRadius: picoVars.borderRadius,
      boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.2)",
    },
  },
});

const articleInDialogStyle = globalStyle("dialog article", {
  maxHeight: "100%",
  overflow: "auto",
  selectors: {
    "& > header": {
      position: "sticky",
      top: 0,
      backgroundColor: picoVars.cardBackground,
      zIndex: 1,
    },
    "& > footer": {
      position: "sticky",
      bottom: 0,
      backgroundColor: picoVars.cardBackground,
      zIndex: 1,
    },
  },
});

// =============================================================================
// Sectioning - Nav, Header, Main, Footer, Section, Article, Aside
// =============================================================================

const mainStyle = globalStyle("main", {
  display: "block",
});

const sectionStyle = globalStyle("section", {
  marginBottom: picoVars.blockSpacingVertical,
});

const articleStyle = globalStyle("article", {
  marginBottom: picoVars.blockSpacingVertical,
  padding: picoVars.blockSpacingVertical,
  backgroundColor: picoVars.cardBackground,
  border: `${picoVars.borderWidth} solid ${picoVars.cardBorderColor}`,
  borderRadius: picoVars.borderRadius,
  selectors: {
    "& > header, & > footer": {
      marginLeft: `calc(-1 * ${picoVars.blockSpacingVertical})`,
      marginRight: `calc(-1 * ${picoVars.blockSpacingVertical})`,
      padding:
        `calc(${picoVars.blockSpacingVertical} / 2) ${picoVars.blockSpacingVertical}`,
      backgroundColor: picoVars.cardSectioningBackground,
    },
    "& > header": {
      marginTop: `calc(-1 * ${picoVars.blockSpacingVertical})`,
      marginBottom: picoVars.blockSpacingVertical,
      borderBottom: `${picoVars.borderWidth} solid ${picoVars.cardBorderColor}`,
      borderTopLeftRadius: picoVars.borderRadius,
      borderTopRightRadius: picoVars.borderRadius,
    },
    "& > footer": {
      marginTop: picoVars.blockSpacingVertical,
      marginBottom: `calc(-1 * ${picoVars.blockSpacingVertical})`,
      borderTop: `${picoVars.borderWidth} solid ${picoVars.cardBorderColor}`,
      borderBottomLeftRadius: picoVars.borderRadius,
      borderBottomRightRadius: picoVars.borderRadius,
    },
  },
});

const asideStyle = globalStyle("aside", {
  display: "block",
});

const navStyle = globalStyle("nav", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  selectors: {
    "& ul": {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
    "& ul li": {
      margin: 0,
      padding:
        `${picoVars.navElementSpacingVertical} ${picoVars.navElementSpacingHorizontal}`,
    },
    "& a, & [role='link']": {
      display: "inline-block",
      textDecoration: "none",
    },
    "& a:hover, & [role='link']:hover": {
      textDecoration: "underline",
    },
  },
});

const headerFooterStyle = globalStyle("header, footer", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${picoVars.blockSpacingVertical} 0`,
});

// =============================================================================
// Loading Indicator
// =============================================================================

const ariaBusyStyle = globalStyle("[aria-busy='true']", {
  cursor: "progress",
  selectors: {
    "&:not(input, select, textarea, html)::before": {
      content: '""',
      display: "inline-block",
      width: "1em",
      height: "1em",
      marginRight: "0.5em",
      backgroundImage: picoVars.loadingSpinner,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "1em 1em",
      verticalAlign: "text-bottom",
      animation: "spinner 0.75s linear infinite",
    },
  },
});

const ariaBusyFormStyle = globalStyle(
  "input[aria-busy='true'], select[aria-busy='true'], textarea[aria-busy='true']",
  {
    backgroundImage: picoVars.loadingSpinner,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1rem 1rem",
  },
);

// =============================================================================
// Tooltip
// =============================================================================

const tooltipStyle = globalStyle("[data-tooltip]", {
  position: "relative",
  cursor: "help",
  selectors: {
    "&::after": {
      content: "attr(data-tooltip)",
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "0.25rem 0.5rem",
      marginBottom: "0.25rem",
      backgroundColor: picoVars.tooltipBackground,
      color: picoVars.tooltipColor,
      fontSize: "0.875rem",
      borderRadius: picoVars.borderRadius,
      whiteSpace: "nowrap",
      opacity: 0,
      visibility: "hidden",
      transition:
        `opacity ${picoVars.transition}, visibility ${picoVars.transition}`,
      zIndex: 100,
    },
    "&:hover::after, &:focus::after": {
      opacity: 1,
      visibility: "visible",
    },
  },
});

// =============================================================================
// Group (role="group")
// =============================================================================

const groupStyle = globalStyle('[role="group"]', {
  display: "inline-flex",
  selectors: {
    "& > *": {
      borderRadius: 0,
    },
    "& > *:first-child": {
      borderTopLeftRadius: picoVars.borderRadius,
      borderBottomLeftRadius: picoVars.borderRadius,
    },
    "& > *:last-child": {
      borderTopRightRadius: picoVars.borderRadius,
      borderBottomRightRadius: picoVars.borderRadius,
    },
    "& > *:not(:first-child)": {
      marginLeft: `calc(-1 * ${picoVars.borderWidth})`,
    },
  },
});

// =============================================================================
// Grid
// =============================================================================

const gridStyle = globalStyle(".grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
  gap: `${picoVars.gridRowGap} ${picoVars.gridColumnGap}`,
});

const gridChildrenStyle = globalStyle(".grid > *", {
  minWidth: 0,
});

// =============================================================================
// Focus Visible
// =============================================================================

const focusVisibleStyle = globalStyle(
  ":where(a, button, input, select, textarea, details, summary):focus-visible",
  {
    outline: `${picoVars.outlineWidth} solid ${picoVars.focusColor}`,
    outlineOffset: picoVars.outlineWidth,
  },
);

// =============================================================================
// Accessibility - Reduced Motion
// =============================================================================

const reducedMotionStyle = globalStyle(
  "@media (prefers-reduced-motion: reduce)",
  {
    selectors: {
      "*, *::before, *::after": {
        animationDuration: "0.01ms !important",
        animationIterationCount: "1 !important",
        transitionDuration: "0.01ms !important",
        scrollBehavior: "auto !important",
      },
    },
  },
);

// =============================================================================
// Export
// =============================================================================

/**
 * All Pico CSS global styles in order
 */
export const picoStyles: CSSRef[] = [
  // Root & Themes
  rootLightTheme,
  rootDarkTheme,
  // Reset
  resetAll,
  resetBeforeAfter,
  resetHidden,
  // Document
  htmlStyle,
  bodyStyle,
  // Container
  containerStyle,
  containerBreakpoints,
  // Selection
  selectionStyle,
  // Typography
  headingsStyle,
  h1Style,
  h2Style,
  h3Style,
  h4Style,
  h5Style,
  h6Style,
  pStyle,
  aStyle,
  smallStyle,
  strongStyle,
  emStyle,
  markStyle,
  abbrStyle,
  insStyle,
  delStyle,
  subSupStyle,
  supStyle,
  subStyle,
  // Code
  codeKbdSampStyle,
  codeInlineStyle,
  kbdStyle,
  preStyle,
  // Lists
  listStyle,
  liStyle,
  dlStyle,
  dtStyle,
  ddStyle,
  // Blockquote, HR, Figure
  blockquoteStyle,
  hrStyle,
  figureStyle,
  figcaptionStyle,
  // Embedded
  imgStyle,
  iframeStyle,
  videoAudioStyle,
  svgNotRootStyle,
  // Tables
  tableStyle,
  thTdStyle,
  thStyle,
  theadThStyle,
  tfootStyle,
  tableStriped,
  // Forms
  formStyle,
  fieldsetStyle,
  legendStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  selectStyle,
  optgroupStyle,
  dateInputStyle,
  timeInputStyle,
  searchInputStyle,
  checkboxRadioStyle,
  checkboxStyle,
  radioStyle,
  switchStyle,
  rangeStyle,
  // Buttons
  buttonStyle,
  buttonResetStyle,
  formButtonStyle,
  // Progress
  progressStyle,
  meterStyle,
  // Details/Summary
  detailsStyle,
  summaryStyle,
  detailsOpenStyle,
  // Dialog
  dialogStyle,
  articleInDialogStyle,
  // Sectioning
  mainStyle,
  sectionStyle,
  articleStyle,
  asideStyle,
  navStyle,
  headerFooterStyle,
  // Loading
  ariaBusyStyle,
  ariaBusyFormStyle,
  // Tooltip
  tooltipStyle,
  // Group
  groupStyle,
  // Grid
  gridStyle,
  gridChildrenStyle,
  // Focus
  focusVisibleStyle,
  // Reduced Motion
  reducedMotionStyle,
];

/**
 * Button variant classes for use in markup
 */
export const variants = {
  secondary,
  contrast,
  outline,
  outlineSecondary,
  outlineContrast,
};

/**
 * Render all Pico CSS to a string
 */
export function renderPicoCSS(): string {
  return render([...picoStyles, ...Object.values(variants)]);
}

/**
 * Default export - the complete array of Pico CSS refs
 */
export default picoStyles;

// =============================================================================
// Main - Output CSS when run directly
// =============================================================================

if (import.meta.main) {
  console.log(renderPicoCSS());
}
