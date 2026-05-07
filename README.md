# @baetheus/css

A type-safe CSS-in-JS library for Deno with scoped styles, theming, and a complete CSS AST.

This project was vibe coded with Claude.

## Description

`@baetheus/css` provides a complete CSS Abstract Syntax Tree and a high-level API for creating scoped styles, CSS variables, keyframe animations, font faces, layers, and recipes (variant-based component styles). All styles are compiled to CSS AST rules that can be rendered to strings.

### Features

- Scoped class name generation with content-based hashing
- Full CSS AST representation for all major at-rules (@media, @supports, @container, @keyframes, @font-face, @layer, @property)
- CSS variable theming with type-safe contracts
- Recipe pattern for variant-based component styles
- Style composition and merging
- Selector builders (class, id, tag, attribute, pseudo-class, pseudo-element, combinators)
- Zero runtime in production (all CSS is generated at build time)

## Usage

### Installation

```bash
deno add jsr:@baetheus/css
```

### Basic Styles

```ts
import { style, render } from "@baetheus/css/core";

const button = style({
  backgroundColor: "blue",
  color: "white",
  padding: "8px 16px",
  borderRadius: 4,
  selectors: {
    "&:hover": { backgroundColor: "darkblue" },
  },
});

// Use in DOM
element.className = button.toString();

// Render CSS
const css = render([button]);
```

### CSS Variables / Theming

```ts
import { createVars, vars, style, render } from "@baetheus/css/core";

const theme = createVars({
  colors: {
    primary: null,
    secondary: null,
  },
});

const lightTheme = vars(theme, {
  colors: { primary: "#0066cc", secondary: "#666666" },
});

const darkTheme = vars(theme, {
  colors: { primary: "#66b3ff", secondary: "#cccccc" },
});

const card = style({
  backgroundColor: theme.colors.primary,
  color: theme.colors.secondary,
});

// Apply theme
document.body.className = lightTheme.toString();
```

### Recipes (Variants)

```ts
import { recipe, render } from "@baetheus/css/core";

const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 4,
  },
  variants: {
    size: {
      small: { padding: "4px 8px", fontSize: 12 },
      large: { padding: "12px 24px", fontSize: 16 },
    },
    variant: {
      primary: { backgroundColor: "blue", color: "white" },
      ghost: { backgroundColor: "transparent", color: "blue" },
    },
  },
  defaultVariants: {
    size: "small",
    variant: "primary",
  },
});

// Use with defaults
element.className = button.toString();

// Use with specific variants
element.className = button.with({ size: "large", variant: "ghost" });
```

### Keyframes

```ts
import { keyframes, style, render } from "@baetheus/css/core";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const animated = style({
  animation: `${fadeIn} 0.3s ease-out`,
});
```

### Low-Level AST

```ts
import { cls, prop, styleRule, mediaRule, renderRule } from "@baetheus/css/ast";

const rule = styleRule(cls("button"), [
  prop("display", "inline-flex"),
  prop("padding", "8px 16px"),
]);

const responsive = mediaRule("(min-width: 768px)", [
  styleRule(cls("container"), [prop("width", "750px")]),
]);

console.log(renderRule(rule));
console.log(renderRule(responsive));
```

## Inspirations

- [vanilla-extract](https://vanilla-extract.style/) - The primary inspiration for the API design, particularly the `style`, `recipe`, `createVar`, and theming patterns
- [Sass](https://sass-lang.com/) - Influence on nesting and selector composition
- [fp-ts](https://gcanti.github.io/fp-ts/) - Functional programming patterns and type-safe design

## Contributing

Contributions are welcome! This is an experimental project that was vibe coded, so there's plenty of room for improvement.

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
deno check ast.ts core.ts

# Format
deno fmt
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
