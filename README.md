# @baetheus/css [![Coverage Status](https://coveralls.io/repos/github/baetheus/css/badge.svg?branch=main)](https://coveralls.io/github/baetheus/css?branch=main) [![JSR](https://jsr.io/badges/@baetheus/css)](https://jsr.io/@baetheus/css)

A type-safe CSS-in-TypeScript library for Deno with scoped styles, theming, and
a complete CSS at-rule system.

This project was vibe coded with Claude.

## Features

- Scoped class name generation with content-based hashing
- Full CSS at-rule support (@font-face, @property, @page, @counter-style,
  @color-profile)
- CSS variable contracts with type-safe theming
- Nested selectors and pseudo-classes
- Style composition with `use()`
- Zero runtime in production (all CSS is generated at build time)

## Installation

```bash
deno add jsr:@baetheus/css
```

## Usage

### Basic Styles

```ts
import { render, style } from "@baetheus/css";

const button = style({
  backgroundColor: "blue",
  color: "white",
  padding: "8px 16px",
  borderRadius: "4px",
});

// Use in DOM
element.className = button.toString();

// Render CSS
const css = render(button);
```

### Nested Selectors

```ts
import { render, style } from "@baetheus/css";

const card = style({
  padding: "16px",
  transition: "transform 0.2s",
  select: {
    "&:hover": { transform: "scale(1.02)" },
    "& > h2": { marginTop: "0" },
    "@media (min-width: 768px)": { padding: "24px" },
  },
});

console.log(render(card));
```

### Custom Selectors

```ts
import { join, render, style } from "@baetheus/css";

// Style an HTML element directly
const body = style("body", { margin: "0", fontFamily: "sans-serif" });

// Style by ID
const header = style("#header", { position: "fixed", top: "0" });

// Use the join function to combine styles for rendering
console.log(render(join(body, header)));
```

### CSS Variables / Theming

```ts
import { fallback, join, render, style, theme } from "@baetheus/css";

// Define a theme with values (nested structure becomes CSS variables)
const colors = theme({
  colors: {
    primary: "blue",
    secondary: "green",
    brand: { light: "#eef", dark: "#335" },
  },
  spacing: "8px",
});

// Use var references in styles (type-checked)
const card = style({
  color: colors.colors.primary,
  backgroundColor: colors.colors.brand.light,
  padding: colors.spacing,
});

// Use fallback() to add fallback values to variable references
const button = style({
  color: colors.colors.primary,
  // If --hash-colors-secondary is undefined, falls back to "gray"
  borderColor: fallback(colors.colors.secondary, "gray"),
});

// Create CSS custom properties by passing theme to style()
const lightTheme = style(":root", colors);

// Create a dark variant with same variable names using create()
const darkColors = colors.create({
  colors: {
    primary: "white",
    secondary: "#ccc",
    brand: { light: "#335", dark: "#eef" },
  },
});
const darkTheme = style(".dark", darkColors);

// Apply theme by adding .dark class to switch themes
// Use join() to combine styles for rendering
console.log(render(join(lightTheme, darkTheme, card)));
```

### Combining Styles

```ts
import { render, style, use } from "@baetheus/css";

const base = style({ padding: "8px" });
const primary = style({ backgroundColor: "blue", color: "white" });
const large = style({ fontSize: "1.25rem" });

// Combine into a single class string
const className = use(base, primary, large);
// ".abc123 .def456 .ghi789"
```

### At-Rules

```ts
import { at, join, render } from "@baetheus/css";

// @font-face
const roboto = at("@font-face", {
  fontFamily: "Roboto",
  src: "url('/fonts/roboto.woff2') format('woff2')",
  fontWeight: "400",
  fontDisplay: "swap",
});

// @property (CSS Houdini)
const themeColor = at("@property --theme-color", {
  syntax: '"<color>"',
  inherits: "true",
  initialValue: "blue",
});

// @counter-style
const thumbs = at("@counter-style thumbs", {
  system: "cyclic",
  symbols: "👍",
  suffix: " ",
});

// @page
const firstPage = at("@page :first", {
  marginTop: "2in",
});

// Use join function to combine styles
console.log(render(join(roboto, themeColor, thumbs, firstPage)));
```

### Render Options

```ts
import {
  MINIMAL_RENDER_OPTIONS,
  render,
  STANDARD_RENDER_OPTIONS,
  style,
} from "@baetheus/css";

const button = style({ color: "blue" });

// Human-readable output (default)
console.log(render(button));
console.log(render(button, STANDARD_RENDER_OPTIONS));

// Minified output
console.log(render(button, MINIMAL_RENDER_OPTIONS));
```

### Reusable Properties

```ts
import { properties, style } from "@baetheus/css";

// Define reusable style properties with type checking
const flexCenter = properties({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const card = style({
  ...flexCenter,
  padding: "16px",
});
```

### Variants

```ts
import { render, style, variant } from "@baetheus/css";

// Create a variant tree to organize related styles
const v = variant({
  button: {
    primary: style({ backgroundColor: "blue", color: "white" }),
    secondary: style({ backgroundColor: "gray", color: "black" }),
  },
  text: {
    heading: style({ fontSize: "2rem", fontWeight: "bold" }),
    body: style({ fontSize: "1rem" }),
  },
});

// Access individual styles via dot notation
element.className = v.button.primary.toString();

// Render all styles at once
console.log(render(v));
```

## API Reference

### Core Functions

- `style(input)` - Creates a Style with auto-generated class name
- `style(selector, input)` - Creates a Style with a custom selector
- `render(style, options?)` - Renders a HasStyles object (Style, Variant, or
  joined) to CSS string
- `join(...styles)` - Combines multiple HasStyles objects into one for rendering
- `use(...styles)` - Combines multiple styles into a class name string
- `properties(input)` - Identity function for type-checked style objects
- `variant(shape)` - Creates a Variant from a tree of styles
- `hasStyles(value)` - Type guard for HasStyles objects (Style or Variant)

### Style Object

A Style object has the following method:

- `toString()` - Returns the selector for the style block

### Theming

- `theme(values)` - Creates a type-safe CSS variable theme with var() references
- `Theme.create(partial)` - Instance method that creates a variant with merged
  values (same variable names)
- `fallback(ref, ...values)` - Adds fallback values to a CSS variable reference
- `isTheme(value)` - Type guard for Theme objects
- Pass a theme directly to `style()` to generate CSS custom properties

### Variants

- `variant(shape)` - Creates a Variant from a tree of styles (nested object of
  styles)
- Variant objects implement HasStyles, so they can be passed directly to
  `render()`
- Access individual styles via dot notation (e.g., `v.button.primary`)

### At-Rules

- `at(rule, properties)` - Creates styles for unnestable at-rules

### Render Options

- `STANDARD_RENDER_OPTIONS` - Pretty-printed CSS with newlines and indentation
- `MINIMAL_RENDER_OPTIONS` - Minified CSS with no whitespace

## Inspirations

- [vanilla-extract](https://vanilla-extract.style/) - The primary inspiration
  for the API design, particularly the `style`, `contract`, and theming patterns
- [Sass](https://sass-lang.com/) - Influence on nesting and selector composition
- [fp-ts](https://gcanti.github.io/fp-ts/) - Functional programming patterns and
  type-safe design

## Contributing

Contributions are welcome! This is an experimental project that was vibe coded,
so there's plenty of room for improvement.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development

```bash
# Run tests
deno test

# Type check
deno check mod.ts

# Format
deno fmt
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
