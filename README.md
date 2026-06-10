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
import { render, style } from "@baetheus/css";

// Style an HTML element directly
const body = style("body", { margin: "0", fontFamily: "sans-serif" });

// Style by ID
const header = style("#header", { position: "fixed", top: "0" });

// Use the join method to combine styles for rendering
console.log(render(body.join(header)));
```

### CSS Variables / Theming

```ts
import { contract, render, style, vars } from "@baetheus/css";

// Define the contract with arbitrary nesting (null marks each variable)
const theme = contract({
  colors: {
    primary: null,
    secondary: null,
    brand: { light: null, dark: null },
  },
  spacing: null,
});

// Use var references in styles
const card = style({
  color: theme.colors.primary,
  backgroundColor: theme.colors.brand.light,
  padding: theme.spacing,
});

// Create theme implementations with any selector
const lightTheme = style(
  ":root",
  vars(theme, {
    colors: {
      primary: "blue",
      secondary: "green",
      brand: { light: "#eef", dark: "#335" },
    },
    spacing: "8px",
  }),
);

const darkTheme = style(
  ".dark",
  vars(theme, {
    colors: {
      primary: "white",
      secondary: "#ccc",
      brand: { light: "#335", dark: "#eef" },
    },
    spacing: "8px",
  }),
);

// Apply theme by adding .dark class to switch themes
// Use join() or Style.join() to combine styles for rendering
console.log(render(lightTheme.join(darkTheme, card)));
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
import { at, render } from "@baetheus/css";

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

// Use join method to combine styles
console.log(render(roboto.join(themeColor, thumbs, firstPage)));
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

## API Reference

### Core Functions

- `style(input)` - Creates a Style with auto-generated class name
- `style(selector, input)` - Creates a Style with a custom selector
- `render(style, options?)` - Renders a Style to CSS string
- `join(...styles)` - Combines multiple styles into a single Style for rendering
- `use(...styles)` - Combines multiple styles into a class name string
- `properties(input)` - Identity function for type-checked style objects
- `isStyle(value)` - Type guard for Style objects

### Style Class

The `Style` class is iterable and has the following methods:

- `toString()` - Returns space-separated selectors for all style blocks
- `join(...styles)` - Combines this style with others into a single Style for
  rendering

### Variables

- `contract(shape)` - Creates a type-safe CSS variable contract
- `vars(contract, values)` - Creates CSS custom properties from a contract
  (returns Variables to inject into a Style)
- `isContract(value)` - Type guard for Contract objects

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
