# @baetheus/css [![JSR](https://jsr.io/badges/@baetheus/css)](https://jsr.io/@baetheus/css)

A type-safe CSS-in-TypeScript library for Deno with scoped styles, theming, and
a complete CSS at-rule system.

This project was vibe coded with Claude.

## Features

- Scoped class name generation with content-based hashing
- Full CSS at-rule support (@media, @supports, @container, @keyframes,
  @font-face, @layer, @property, and more)
- CSS variable contracts with type-safe theming
- Built-in variant support for component styles
- Style composition with children
- Selector builders (compound and complex selectors)
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
const css = render([button]);
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

// Create theme implementations
const lightTheme = vars(theme, {
  colors: {
    primary: "blue",
    secondary: "green",
    brand: { light: "#eef", dark: "#335" },
  },
  spacing: "8px",
});

const darkTheme = vars(theme, {
  colors: {
    primary: "white",
    secondary: "#ccc",
    brand: { light: "#335", dark: "#eef" },
  },
  spacing: "8px",
});

// Apply theme
document.body.className = lightTheme.toString();

console.log(render([lightTheme, card]));
```

### Variants

```ts
import { render, style } from "@baetheus/css";

const button = style(
  {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "4px",
  },
  {
    variants: {
      small: { padding: "4px 8px", fontSize: "12px" },
      large: { padding: "12px 24px", fontSize: "16px" },
      primary: { backgroundColor: "blue", color: "white" },
      ghost: { backgroundColor: "transparent", color: "blue" },
    },
  },
);

// Use base styles
element.className = button.toString();

// Use with variants
element.className = button.with("large", "primary");
```

### Media Queries

```ts
import { media, render, style } from "@baetheus/css";

const responsive = style({ fontSize: "14px" });
const query = media("(min-width: 768px)", responsive);

console.log(render([responsive, query]));
```

### Keyframes

```ts
import { keyframes, render, style } from "@baetheus/css";

const fadeIn = keyframes("fadeIn", [
  { offset: "from", properties: { opacity: "0" } },
  { offset: "to", properties: { opacity: "1" } },
]);

const animated = style({
  animation: "fadeIn 0.3s ease-out",
});

console.log(render([fadeIn, animated]));
```

### Element and ID Selectors

```ts
import { element, id, render } from "@baetheus/css";

const body = element("body", { margin: "0", fontFamily: "sans-serif" });
const header = id("header", { position: "fixed", top: "0" });

console.log(render([body, header]));
```

### Render Options

```ts
import { MINIMAL_RENDER, render, STANDARD_RENDER, style } from "@baetheus/css";

const button = style({ color: "blue" });

// Human-readable output
console.log(render([button], STANDARD_RENDER));

// Minified output
console.log(render([button], MINIMAL_RENDER));
```

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
deno check css.ts

# Format
deno fmt
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
