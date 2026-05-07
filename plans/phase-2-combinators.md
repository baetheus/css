# Phase 2: Constrained CSS Combinators

## Objective

Build higher-level combinators that compile type-safe style objects to the CSS
AST from Phase 1. These handle property transformation, validation, and CSS
variable helpers.

## Dependencies

- Phase 1 complete (CSS AST types and render)
- `csstype` (dev dependency for TypeScript types only, no runtime)

## Files to Create

### `src/combinators/types.ts`

Type-safe style objects using csstype:

```typescript
import type * as CSS from "csstype";

// Base style properties from csstype
type StyleProperties = CSS.Properties<string | number>;

// Extended style object with nesting
interface StyleObject extends StyleProperties {
  // Set CSS variables
  vars?: Record<string, string | number>;

  // Nested selectors (must include & to reference element)
  selectors?: Record<string, StyleProperties>;

  // At-rules with nested styles
  "@media"?: Record<string, StyleObject>;
  "@supports"?: Record<string, StyleObject>;
  "@container"?: Record<string, StyleObject>;
  "@layer"?: Record<string, StyleObject>;
}

// Array form for composition (later styles win)
type StyleInput = StyleObject | readonly StyleInput[];

// Compiled output
interface CompiledStyles {
  className: string; // The generated class name
  rules: readonly CssRule[]; // AST rules to render
}
```

### `src/combinators/unitless.ts`

Properties that don't get 'px' suffix:

```typescript
export const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  "animationIterationCount",
  "borderImageSlice",
  "columnCount",
  "columns",
  "fillOpacity",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnStart",
  "gridRow",
  "gridRowEnd",
  "gridRowStart",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "strokeOpacity",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
]);
```

### `src/combinators/transform.ts`

Property transformations:

```typescript
import { UNITLESS_PROPERTIES } from "./unitless.js";

// camelCase to kebab-case
function toKebabCase(prop: string): string {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

// Add 'px' to numbers for properties that need units
function pixelify(prop: string, value: string | number): string {
  if (
    typeof value === "number" && value !== 0 && !UNITLESS_PROPERTIES.has(prop)
  ) {
    return `${value}px`;
  }
  return String(value);
}

// Transform a style object's properties to CssProperty[]
function transformProperties(obj: StyleProperties): CssProperty[] {
  return Object.entries(obj)
    .filter(([key]) =>
      !key.startsWith("@") && key !== "vars" && key !== "selectors"
    )
    .map(([key, value]) => prop(toKebabCase(key), pixelify(key, value)));
}
```

### `src/combinators/validate.ts`

Selector and query validation:

```typescript
// Validate selector references the element with &
function validateSelector(selector: string): void {
  if (!selector.includes("&")) {
    throw new Error(
      `Invalid selector "${selector}": must reference the element with &`,
    );
  }
}

// Basic media query validation
function validateMediaQuery(query: string): void {
  if (!query.trim()) {
    throw new Error("Media query cannot be empty");
  }
  // Basic syntax check - must have parentheses or valid keywords
  if (
    !query.includes("(") &&
    !["all", "print", "screen"].some((k) => query.includes(k))
  ) {
    throw new Error(`Invalid media query: ${query}`);
  }
}
```

### `src/combinators/variables.ts`

CSS variable helpers:

```typescript
// Create a var() reference
function cssVarRef(name: string, fallback?: string): string {
  const varName = name.startsWith("--") ? name : `--${name}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}

// Create a CSS variable name (for use in vars object)
function cssVarName(name: string): string {
  return name.startsWith("--") ? name : `--${name}`;
}

// Create variable assignments from vars object
function createVarAssignments(
  vars: Record<string, string | number>,
): CssProperty[] {
  return Object.entries(vars).map(([name, value]) =>
    prop(cssVarName(name), String(value))
  );
}
```

### `src/combinators/compile.ts`

Compile StyleObject to AST:

```typescript
import type { StyleInput, StyleObject } from "./types.js";
import type { CssRule, Selector } from "../ast/types.js";

// Deep merge style objects (later wins)
function mergeStyles(...inputs: StyleInput[]): StyleObject {
  const result: StyleObject = {};
  for (const input of inputs.flat(Infinity) as StyleObject[]) {
    Object.assign(result, input);
    // Deep merge nested objects
    if (input.vars) result.vars = { ...result.vars, ...input.vars };
    if (input.selectors) {
      result.selectors = { ...result.selectors, ...input.selectors };
    }
    if (input["@media"]) {
      result["@media"] = { ...result["@media"], ...input["@media"] };
    }
    if (input["@supports"]) {
      result["@supports"] = { ...result["@supports"], ...input["@supports"] };
    }
    if (input["@container"]) {
      result["@container"] = {
        ...result["@container"],
        ...input["@container"],
      };
    }
    if (input["@layer"]) {
      result["@layer"] = { ...result["@layer"], ...input["@layer"] };
    }
  }
  return result;
}

// Compile a style object to CSS rules for a given class name
function compileStyle(className: string, input: StyleInput): CssRule[] {
  const style = Array.isArray(input) ? mergeStyles(...input) : input;
  const rules: CssRule[] = [];
  const selector = cls(className);

  // Base properties + vars
  const properties = [
    ...createVarAssignments(style.vars ?? {}),
    ...transformProperties(style),
  ];
  if (properties.length > 0) {
    rules.push(styleRule(selector, properties));
  }

  // Nested selectors
  if (style.selectors) {
    for (const [sel, props] of Object.entries(style.selectors)) {
      validateSelector(sel);
      const resolvedSelector = sel.replace(/&/g, `.${className}`);
      rules.push(styleRule(
        { type: "simple", value: resolvedSelector },
        transformProperties(props),
      ));
    }
  }

  // Media queries
  if (style["@media"]) {
    for (const [query, nested] of Object.entries(style["@media"])) {
      validateMediaQuery(query);
      const nestedRules = compileStyle(className, nested);
      rules.push(mediaRule(query, nestedRules));
    }
  }

  // Supports queries
  if (style["@supports"]) {
    for (const [query, nested] of Object.entries(style["@supports"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(supportsRule(query, nestedRules));
    }
  }

  // Container queries
  if (style["@container"]) {
    for (const [query, nested] of Object.entries(style["@container"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(containerRule(query, nestedRules));
    }
  }

  // Layers
  if (style["@layer"]) {
    for (const [name, nested] of Object.entries(style["@layer"])) {
      const nestedRules = compileStyle(className, nested);
      rules.push(layerRule(name, nestedRules));
    }
  }

  return rules;
}
```

### `src/combinators/index.ts`

```typescript
export * from "./types.js";
export { UNITLESS_PROPERTIES } from "./unitless.js";
export { pixelify, toKebabCase, transformProperties } from "./transform.js";
export { validateMediaQuery, validateSelector } from "./validate.js";
export { createVarAssignments, cssVarName, cssVarRef } from "./variables.js";
export { compileStyle, mergeStyles } from "./compile.js";
```

## Tests

### `tests/combinators/transform.test.ts`

1. `toKebabCase`: backgroundColor → background-color
2. `pixelify`: padding: 10 → "10px", opacity: 0.5 → "0.5"
3. `transformProperties`: converts full style object

### `tests/combinators/compile.test.ts`

1. Simple style object compiles to StyleRule
2. Nested selectors resolve & correctly
3. Media queries wrap rules correctly
4. Multiple at-rules compile in order
5. Style composition merges correctly (later wins)
6. CSS variables in vars object become custom properties
7. Invalid selectors (missing &) throw errors

## Verification

```bash
deno check src/combinators/
deno test tests/combinators/

# Manual test
deno eval "
import { compileStyle } from './src/combinators/index.ts';
import { renderCss } from './src/ast/index.ts';

const rules = compileStyle('button', {
  padding: 8,
  backgroundColor: 'blue',
  vars: { primaryColor: '#007bff' },
  selectors: {
    '&:hover': { backgroundColor: 'darkblue' },
  },
  '@media': {
    '(min-width: 768px)': { padding: 16 },
  },
});

console.log(renderCss({ rules }));
"
```

Expected output:

```css
.button {
  --primaryColor: #007bff;
  padding: 8px;
  background-color: blue;
}
.button:hover {
  background-color: darkblue;
}
@media (min-width: 768px) {
  .button {
    padding: 16px;
  }
}
```
