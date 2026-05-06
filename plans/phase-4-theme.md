# Phase 4: Nullpub CSS Theme

## Objective

Implement all nullpub utility classes using the vanilla-extract overlay. This creates a complete utility-first CSS library with responsive variants.

## Dependencies

- Phases 1-3 complete

## Configuration

### `src/theme/config.ts`

Core configuration matching nullpub:

```typescript
// Breakpoints (mobile-first, min-width)
export const BREAKPOINTS = {
  sm: '50em',   // ~800px
  md: '75em',   // ~1200px
  lg: '90em',   // ~1440px
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Spacing scale multipliers (exponential: 0, 1, 2, 4, 8, 16, 32, 64)
export const SPACING_SCALE = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 4,
  '4': 8,
  '5': 16,
  '6': 32,
  '7': 64,
} as const;

export type SpacingKey = keyof typeof SPACING_SCALE;

// Font size scale (bidirectional logarithmic)
export const FONT_SIZE_SCALE = {
  'u5': '2em',
  'u4': '1.7511em',
  'u3': '1.5157em',
  'u2': '1.3195em',
  'u1': '1.1487em',
  '0': '1em',
  'd1': '0.8706em',
  'd2': '0.7579em',
  'd3': '0.6599em',
  'd4': '0.5745em',
  'd5': '0.5em',
} as const;

// Font weight scale
export const FONT_WEIGHT_SCALE = {
  'u3': 700,
  'u2': 600,
  'u1': 500,
  '0': 400,
  'd1': 300,
  'd2': 200,
  'd3': 100,
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
  { label: 'base', foreground: '#111111', background: '#ffffff', edge: '#111111' },
  { label: 'primary', foreground: '#ffffff', background: '#357edd', edge: '#ffffff' },
  { label: 'secondary', foreground: '#555555', background: '#96ccff', edge: '#555555' },
  { label: 'link', foreground: '#357edd', background: '#ffffff', edge: '#357edd' },
  { label: 'visited', foreground: '#a463f2', background: '#ffffff', edge: '#a463f2', pseudoClasses: ['visited'] },
  { label: 'focus', foreground: '#555555', background: '#ffb700', edge: '#555555', pseudoClasses: ['focus', 'focus-within'] },
  { label: 'required', foreground: '#357edd', background: '#ffffff', edge: '#357edd', pseudoClasses: ['required'] },
  { label: 'error', foreground: '#ff4136', background: '#ffdfdf', edge: '#ff4136', pseudoClasses: ['invalid'] },
  { label: 'disabled', foreground: '#777777', background: '#eeeeee', edge: '#777777', pseudoClasses: ['disabled'] },
];

// Directions for spacing utilities
export type Direction = 'a' | 'x' | 'y' | 't' | 'r' | 'b' | 'l';

export const DIRECTION_MAP: Record<Direction, string[]> = {
  a: ['top', 'right', 'bottom', 'left'],
  x: ['left', 'right'],
  y: ['top', 'bottom'],
  t: ['top'],
  r: ['right'],
  b: ['bottom'],
  l: ['left'],
};
```

### `src/theme/responsive.ts`

Helper for responsive variants:

```typescript
import { BREAKPOINTS, type Breakpoint } from './config.js';
import type { StyleObject } from '../combinators/types.js';

// Wrap styles in media query
function atBreakpoint(bp: Breakpoint, styles: StyleObject): StyleObject {
  return {
    '@media': {
      [`(min-width: ${BREAKPOINTS[bp]})`]: styles,
    },
  };
}

// Generate responsive variants of a style map
function withResponsive<T extends Record<string, StyleObject>>(
  base: T
): T & Record<`${keyof T & string}-${Breakpoint}`, StyleObject> {
  const result = { ...base } as T & Record<string, StyleObject>;

  for (const bp of Object.keys(BREAKPOINTS) as Breakpoint[]) {
    for (const [key, styles] of Object.entries(base)) {
      result[`${key}-${bp}`] = atBreakpoint(bp, styles);
    }
  }

  return result as T & Record<`${keyof T & string}-${Breakpoint}`, StyleObject>;
}
```

## Utility Generators

### `src/theme/spacing.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { SPACING_SCALE, DIRECTION_MAP, type Direction, type SpacingKey } from './config.js';
import { withResponsive } from './responsive.js';

function createSpacingStyles(property: 'padding' | 'margin') {
  const styles: Record<string, StyleObject> = {};

  for (const [dir, props] of Object.entries(DIRECTION_MAP) as [Direction, string[]][]) {
    for (const [scale, value] of Object.entries(SPACING_SCALE)) {
      const key = `${dir}-${scale}`;  // e.g., 'a-0', 'x-4'
      const style: StyleObject = {};

      for (const prop of props) {
        style[`${property}${prop.charAt(0).toUpperCase()}${prop.slice(1)}` as keyof StyleObject] = value;
      }

      styles[key] = style;
    }
  }

  return withResponsive(styles);
}

// pa-0, px-1, py-sm-2, etc.
export const padding = styleVariants(createSpacingStyles('padding'), 'p');

// ma-0, mx-1, my-sm-2, etc.
export const margin = styleVariants(createSpacingStyles('margin'), 'm');
```

### `src/theme/typography.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { FONT_SIZE_SCALE, FONT_WEIGHT_SCALE } from './config.js';
import { withResponsive } from './responsive.js';

// fs-u5, fs-0, fs-d3, fs-sm-u2, etc.
export const fontSize = styleVariants(
  withResponsive(
    Object.fromEntries(
      Object.entries(FONT_SIZE_SCALE).map(([key, value]) => [key, { fontSize: value }])
    )
  ),
  'fs'
);

// fw-u3, fw-0, fw-d1, etc.
export const fontWeight = styleVariants(
  Object.fromEntries(
    Object.entries(FONT_WEIGHT_SCALE).map(([key, value]) => [key, { fontWeight: value }])
  ),
  'fw'
);
```

### `src/theme/flexbox.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { withResponsive } from './responsive.js';

// fld-row, fld-col, fld-rowr, fld-colr
export const flexDirection = styleVariants({
  row: { display: 'flex', flexDirection: 'row' },
  col: { display: 'flex', flexDirection: 'column' },
  rowr: { display: 'flex', flexDirection: 'row-reverse' },
  colr: { display: 'flex', flexDirection: 'column-reverse' },
}, 'fld');

// jc-start, jc-end, jc-ctr, jc-spb, jc-spa, jc-spe
export const justifyContent = styleVariants({
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-end' },
  ctr: { justifyContent: 'center' },
  spb: { justifyContent: 'space-between' },
  spa: { justifyContent: 'space-around' },
  spe: { justifyContent: 'space-evenly' },
}, 'jc');

// ai-start, ai-end, ai-ctr, ai-str, ai-base
export const alignItems = styleVariants({
  start: { alignItems: 'flex-start' },
  end: { alignItems: 'flex-end' },
  ctr: { alignItems: 'center' },
  str: { alignItems: 'stretch' },
  base: { alignItems: 'baseline' },
}, 'ai');

// as-start, as-end, as-ctr, as-str
export const alignSelf = styleVariants({
  start: { alignSelf: 'flex-start' },
  end: { alignSelf: 'flex-end' },
  ctr: { alignSelf: 'center' },
  str: { alignSelf: 'stretch' },
}, 'as');

// flw-nowrap, flw-wrap, flw-wrapr
export const flexWrap = styleVariants({
  nowrap: { flexWrap: 'nowrap' },
  wrap: { flexWrap: 'wrap' },
  wrapr: { flexWrap: 'wrap-reverse' },
}, 'flw');

// fls-0 through fls-4 (flex-grow values)
export const flexSize = styleVariants({
  '0': { flexGrow: 0, flexShrink: 0 },
  '1': { flexGrow: 1, flexShrink: 1 },
  '2': { flexGrow: 2, flexShrink: 0 },
  '3': { flexGrow: 3, flexShrink: 0 },
  '4': { flexGrow: 4, flexShrink: 0 },
}, 'fls');

// flb-auto, flb-fill, flb-p25, flb-p50, flb-p75, flb-p100
export const flexBasis = styleVariants({
  auto: { flexBasis: 'auto' },
  fill: { flexBasis: '100%' },
  p25: { flexBasis: '25%' },
  p50: { flexBasis: '50%' },
  p75: { flexBasis: '75%' },
  p100: { flexBasis: '100%' },
}, 'flb');

// flg-0 through flg-7 (gap using spacing scale)
export const flexGap = styleVariants(
  withResponsive(
    Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, value]) => [key, { gap: value }])
    )
  ),
  'flg'
);
```

### `src/theme/display.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';

// ds-in, ds-ib, ds-bl, ds-fl, ds-gr, ds-no
export const display = styleVariants({
  in: { display: 'inline' },
  ib: { display: 'inline-block' },
  bl: { display: 'block' },
  fl: { display: 'flex' },
  gr: { display: 'grid' },
  no: { display: 'none' },
}, 'ds');
```

### `src/theme/overflow.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { DIRECTION_MAP, type Direction } from './config.js';

type OverflowValue = 'visible' | 'hidden' | 'scroll' | 'auto';

function createOverflowStyles() {
  const styles: Record<string, StyleObject> = {};
  const values: Record<string, OverflowValue> = {
    vi: 'visible',
    hi: 'hidden',
    sc: 'scroll',
    au: 'auto',
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

export const overflow = styleVariants(createOverflowStyles(), 'ov');
```

### `src/theme/colors.ts`

```typescript
import { style, globalStyle } from '../vanilla/index.js';
import { THEME_COLORS, type ThemeColor } from './config.js';

function createColorClasses() {
  const classes: Record<string, string> = {};

  for (const theme of THEME_COLORS) {
    // ct-{theme} - full theme (foreground + background + border)
    classes[`ct-${theme.label}`] = style({
      color: theme.foreground,
      backgroundColor: theme.background,
      borderColor: theme.edge,
    }, `ct-${theme.label}`);

    // cf-{theme} - foreground only
    classes[`cf-${theme.label}`] = style({ color: theme.foreground }, `cf-${theme.label}`);

    // cb-{theme} - background only
    classes[`cb-${theme.label}`] = style({ backgroundColor: theme.background }, `cb-${theme.label}`);

    // ce-{theme} - edge (border-color) only
    classes[`ce-${theme.label}`] = style({ borderColor: theme.edge }, `ce-${theme.label}`);

    // Pseudo-class variants (e.g., ct-focus-on-focus, ct-error-on-invalid)
    if (theme.pseudoClasses) {
      for (const pseudo of theme.pseudoClasses) {
        classes[`ct-${theme.label}-on-${pseudo}`] = style({
          selectors: {
            [`&:${pseudo}`]: {
              color: theme.foreground,
              backgroundColor: theme.background,
              borderColor: theme.edge,
            },
          },
        }, `ct-${theme.label}-on-${pseudo}`);
      }
    }
  }

  return classes;
}

export const color = createColorClasses();
```

### `src/theme/border.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { SPACING_SCALE, DIRECTION_MAP, type Direction } from './config.js';

// Border width: bwa-0 through bwa-7, bwt-0, bwx-2, etc.
function createBorderWidthStyles() {
  const styles: Record<string, StyleObject> = {};

  for (const [dir, props] of Object.entries(DIRECTION_MAP) as [Direction, string[]][]) {
    for (const [scale, value] of Object.entries(SPACING_SCALE)) {
      const key = `${dir}-${scale}`;
      const style: StyleObject = {};

      for (const prop of props) {
        style[`border${prop.charAt(0).toUpperCase()}${prop.slice(1)}Width` as keyof StyleObject] = value;
      }

      styles[key] = style;
    }
  }

  return styles;
}

export const borderWidth = styleVariants(createBorderWidthStyles(), 'bw');

// Border radius: bra-0 through bra-4, bra-c (circular)
export const borderRadius = styleVariants({
  '0': { borderRadius: 0 },
  '1': { borderRadius: 2 },
  '2': { borderRadius: 4 },
  '3': { borderRadius: 8 },
  '4': { borderRadius: 16 },
  c: { borderRadius: '50%' },
}, 'br');

// Border style: bs-none, bs-solid, bs-dashed, bs-dotted
export const borderStyle = styleVariants({
  none: { borderStyle: 'none' },
  solid: { borderStyle: 'solid' },
  dashed: { borderStyle: 'dashed' },
  dotted: { borderStyle: 'dotted' },
}, 'bs');
```

### `src/theme/shadow.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { SPACING_SCALE } from './config.js';

// sh-blk-0 through sh-blk-7
export const shadow = styleVariants(
  Object.fromEntries(
    Object.entries(SPACING_SCALE).map(([key, value]) => [
      `blk-${key}`,
      { boxShadow: value === 0 ? 'none' : `0 ${value}px ${value * 2}px rgba(0,0,0,0.2)` },
    ])
  ),
  'sh'
);
```

### `src/theme/dimensions.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';
import { withResponsive } from './responsive.js';

// Width percentages: w-p10, w-p25, w-p50, w-p75, w-p100
const widthPercentages = Object.fromEntries(
  [10, 20, 25, 30, 33, 40, 50, 60, 66, 70, 75, 80, 90, 100].map(p => [
    `p${p}`, { width: `${p}%` }
  ])
);

// Width auto and viewport
const widthSpecial = {
  auto: { width: 'auto' },
  vw100: { width: '100vw' },
  full: { width: '100%' },
  min: { width: 'min-content' },
  max: { width: 'max-content' },
  fit: { width: 'fit-content' },
};

export const width = styleVariants(
  withResponsive({ ...widthPercentages, ...widthSpecial }),
  'w'
);

// Max-width
export const maxWidth = styleVariants(
  withResponsive({ ...widthPercentages, none: { maxWidth: 'none' } }),
  'mxw'
);

// Height
const heightStyles = {
  auto: { height: 'auto' },
  full: { height: '100%' },
  screen: { height: '100vh' },
  min: { height: 'min-content' },
  max: { height: 'max-content' },
  fit: { height: 'fit-content' },
  p25: { height: '25%' },
  p50: { height: '50%' },
  p75: { height: '75%' },
  p100: { height: '100%' },
  vh25: { height: '25vh' },
  vh50: { height: '50vh' },
  vh75: { height: '75vh' },
  vh100: { height: '100vh' },
};

export const height = styleVariants(withResponsive(heightStyles), 'h');

// Min-height
export const minHeight = styleVariants(
  withResponsive({
    '0': { minHeight: 0 },
    full: { minHeight: '100%' },
    screen: { minHeight: '100vh' }
  }),
  'mnh'
);
```

### `src/theme/cursor.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';

export const cursor = styleVariants({
  auto: { cursor: 'auto' },
  default: { cursor: 'default' },
  pointer: { cursor: 'pointer' },
  wait: { cursor: 'wait' },
  text: { cursor: 'text' },
  move: { cursor: 'move' },
  help: { cursor: 'help' },
  notAllowed: { cursor: 'not-allowed' },
  grab: { cursor: 'grab' },
  grabbing: { cursor: 'grabbing' },
}, 'crsr');
```

### `src/theme/text.ts`

```typescript
import { styleVariants } from '../vanilla/index.js';

// Text alignment: ta-l, ta-r, ta-c, ta-j
export const textAlign = styleVariants({
  l: { textAlign: 'left' },
  r: { textAlign: 'right' },
  c: { textAlign: 'center' },
  j: { textAlign: 'justify' },
}, 'ta');

// Text decoration
export const textDecoration = styleVariants({
  none: { textDecoration: 'none' },
  underline: { textDecoration: 'underline' },
  lineThrough: { textDecoration: 'line-through' },
}, 'td');

// Text transform
export const textTransform = styleVariants({
  upper: { textTransform: 'uppercase' },
  lower: { textTransform: 'lowercase' },
  cap: { textTransform: 'capitalize' },
  none: { textTransform: 'none' },
}, 'tt');
```

### `src/theme/variables.ts`

CSS custom properties for runtime theming:

```typescript
import { createGlobalTheme } from '../vanilla/index.js';
import { BREAKPOINTS, SPACING_SCALE, FONT_SIZE_SCALE, THEME_COLORS } from './config.js';

// Generate all CSS custom properties
export function generateCustomProperties(): void {
  createGlobalTheme(':root', {
    // Base sizes
    baseSize: '16px',
    fontSize: 'calc(var(--baseSize) / 1)',
    fillSize: 'calc(var(--baseSize) / 16)',
    radiusSize: 'calc(var(--baseSize) / 4)',

    // Breakpoints
    breakpoint: Object.fromEntries(
      Object.entries(BREAKPOINTS).map(([key, value]) => [key, value])
    ),

    // Spacing
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, value]) => [key, `${value}px`])
    ),

    // Font sizes
    fontSize: Object.fromEntries(
      Object.entries(FONT_SIZE_SCALE).map(([key, value]) => [key, value])
    ),

    // Theme colors
    color: Object.fromEntries(
      THEME_COLORS.map(theme => [
        theme.label,
        {
          foreground: theme.foreground,
          background: theme.background,
          edge: theme.edge,
        },
      ])
    ),
  });
}
```

### `src/theme/index.ts`

Main exports:

```typescript
// Spacing
export { padding, margin } from './spacing.js';

// Typography
export { fontSize, fontWeight } from './typography.js';
export { textAlign, textDecoration, textTransform } from './text.js';

// Flexbox
export {
  flexDirection, justifyContent, alignItems, alignSelf,
  flexWrap, flexSize, flexBasis, flexGap
} from './flexbox.js';

// Layout
export { display } from './display.js';
export { overflow } from './overflow.js';
export { width, maxWidth, height, minHeight } from './dimensions.js';

// Visual
export { color } from './colors.js';
export { borderWidth, borderRadius, borderStyle } from './border.js';
export { shadow } from './shadow.js';

// Interaction
export { cursor } from './cursor.js';

// Configuration
export * from './config.js';
export { generateCustomProperties } from './variables.js';
export { withResponsive, atBreakpoint } from './responsive.js';

// All classes combined
export const theme = {
  padding, margin,
  fontSize, fontWeight, textAlign, textDecoration, textTransform,
  flexDirection, justifyContent, alignItems, alignSelf, flexWrap, flexSize, flexBasis, flexGap,
  display, overflow,
  width, maxWidth, height, minHeight,
  color,
  borderWidth, borderRadius, borderStyle,
  shadow,
  cursor,
};

// Generate full CSS
export function generateThemeCss(): string {
  generateCustomProperties();
  // All style() calls have already registered with the registry
  return getRegistry().render();
}
```

## Tests

### `tests/theme/spacing.test.ts`

1. Padding classes generate correct CSS
2. Margin classes generate correct CSS
3. Responsive variants work (e.g., `px-sm-2`)
4. All direction variants present (a, x, y, t, r, b, l)

### `tests/theme/colors.test.ts`

1. All 10 themes generate classes
2. Foreground/background/edge variants work
3. Pseudo-class variants generate correct selectors

## Verification

```bash
deno check src/theme/
deno test tests/theme/

# Generate full CSS
deno eval "
import { generateThemeCss, theme } from './src/theme/index.ts';

// Show available classes
console.log('Padding classes:', Object.keys(theme.padding).slice(0, 10), '...');
console.log('Flex direction:', Object.keys(theme.flexDirection));
console.log('Color classes:', Object.keys(theme.color).slice(0, 10), '...');

// Generate and save CSS
const css = generateThemeCss();
console.log('\\nGenerated CSS length:', css.length, 'bytes');
console.log('\\nFirst 2000 chars:\\n', css.slice(0, 2000));
"
```

## Final Output

After all phases complete:
1. Run `deno eval "import { generateThemeCss } from './src/theme/index.ts'; Deno.writeTextFileSync('dist/theme.css', generateThemeCss());"` to generate the full CSS
2. Compare output with original nullpub CSS for coverage
3. Test responsive variants at each breakpoint in browser
