# Phase 3: Vanilla Extract Overlay

## Objective

Implement a vanilla-extract compatible API layer on top of the combinators. This
provides `style()`, `globalStyle()`, `createTheme()`, `keyframes()`, and the
`recipe()` API.

## Dependencies

- Phase 1 & 2 complete
- No external runtime dependencies

## Files to Create

### `src/vanilla/types.ts`

Theme and variant types:

```typescript
// Theme contract types
type ThemeVars<T> = T extends Record<string, infer V>
  ? V extends string | null ? Record<keyof T, string> // var() references
  : { [K in keyof T]: ThemeVars<T[K]> }
  : never;

type ThemeValues<T> = T extends Record<string, infer V>
  ? V extends string ? Record<keyof T, string> // actual values
  : { [K in keyof T]: ThemeValues<T[K]> }
  : never;

// Recipe variant types
type VariantDefinitions = Record<string, Record<string, StyleInput>>;

type VariantSelection<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

type DefaultVariants<V extends VariantDefinitions> = {
  [K in keyof V]?: keyof V[K];
};

interface CompoundVariant<V extends VariantDefinitions> {
  variants: Partial<VariantSelection<V>>;
  style: StyleInput;
}

interface RecipeOptions<V extends VariantDefinitions> {
  base?: StyleInput;
  variants?: V;
  compoundVariants?: CompoundVariant<V>[];
  defaultVariants?: DefaultVariants<V>;
}
```

### `src/vanilla/hash.ts`

Content-addressable class name generation:

```typescript
// DJB2 hash - fast, simple, good distribution
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// Hash a style object to a stable string
function hashStyle(style: StyleInput): string {
  const content = JSON.stringify(style);
  const hash = djb2(content);
  return hash.toString(36).padStart(7, "0"); // 7 chars, zero-padded
}

// Configuration
interface ClassNameConfig {
  prefix?: string; // e.g., 'css_'
  debug?: boolean; // Include readable name
  hashFn?: (content: string) => string; // Custom hash
}

let config: ClassNameConfig = {};

function setClassNameConfig(c: ClassNameConfig): void {
  config = c;
}

// Generate class name
function generateClassName(style: StyleInput, debugName?: string): string {
  const hash = (config.hashFn ?? hashStyle)(style);
  const prefix = config.prefix ?? "";

  if (config.debug && debugName) {
    return `${prefix}${debugName}_${hash}`;
  }
  return `${prefix}${hash}`;
}
```

### `src/vanilla/registry.ts`

Accumulates CSS during generation:

```typescript
import type { CssDocument, CssRule } from "../ast/types.js";
import { renderCss, type RenderOptions } from "../ast/render.js";

interface StyleRegistry {
  readonly rules: CssRule[];
  addClass(className: string, rules: CssRule[]): void;
  addGlobal(rules: CssRule[]): void;
  addKeyframes(name: string, rule: KeyframesRule): void;
  addFontFace(rule: FontFaceRule): void;
  addLayer(rule: LayerRule | LayerStatementRule): void;
  render(options?: RenderOptions): string;
  clear(): void;
}

function createStyleRegistry(): StyleRegistry {
  const rules: CssRule[] = [];

  return {
    get rules() {
      return rules;
    },
    addClass(className, newRules) {
      rules.push(...newRules);
    },
    addGlobal(newRules) {
      rules.push(...newRules);
    },
    addKeyframes(name, rule) {
      rules.push(rule);
    },
    addFontFace(rule) {
      rules.push(rule);
    },
    addLayer(rule) {
      rules.push(rule);
    },
    render(options) {
      return renderCss({ rules }, options);
    },
    clear() {
      rules.length = 0;
    },
  };
}

// Global registry (lazily initialized)
let globalRegistry: StyleRegistry | null = null;

function getRegistry(): StyleRegistry {
  if (!globalRegistry) {
    globalRegistry = createStyleRegistry();
  }
  return globalRegistry;
}

function setRegistry(registry: StyleRegistry): void {
  globalRegistry = registry;
}
```

### `src/vanilla/style.ts`

The core `style()` and `styleVariants()` functions:

```typescript
import type { StyleInput } from "../combinators/types.js";
import { compileStyle } from "../combinators/compile.js";
import { generateClassName } from "./hash.js";
import { getRegistry } from "./registry.js";

// Create a scoped style, returns class name
function style(input: StyleInput, debugName?: string): string {
  const className = generateClassName(input, debugName);
  const rules = compileStyle(className, input);
  getRegistry().addClass(className, rules);
  return className;
}

// Create variants from a record
function styleVariants<T extends string | number | symbol>(
  variants: Record<T, StyleInput>,
  debugName?: string,
): Record<T, string> {
  const result = {} as Record<T, string>;
  for (const [key, input] of Object.entries(variants) as [T, StyleInput][]) {
    result[key] = style(
      input,
      debugName ? `${debugName}_${String(key)}` : undefined,
    );
  }
  return result;
}

// Overload: map data to styles
function styleVariants<Data extends Record<string, unknown>>(
  data: Data,
  mapFn: (value: Data[keyof Data], key: keyof Data) => StyleInput,
  debugName?: string,
): Record<keyof Data, string> {
  const result = {} as Record<keyof Data, string>;
  for (const [key, value] of Object.entries(data)) {
    const input = mapFn(value as Data[keyof Data], key as keyof Data);
    result[key as keyof Data] = style(
      input,
      debugName ? `${debugName}_${key}` : undefined,
    );
  }
  return result;
}
```

### `src/vanilla/global.ts`

Global styles:

```typescript
import type { StyleInput } from "../combinators/types.js";
import {
  createVarAssignments,
  transformProperties,
} from "../combinators/index.js";
import { styleRule } from "../ast/builders.js";
import { getRegistry } from "./registry.js";

function globalStyle(selector: string, input: StyleInput): void {
  const style = Array.isArray(input) ? mergeStyles(...input) : input;
  const properties = [
    ...createVarAssignments(style.vars ?? {}),
    ...transformProperties(style),
  ];

  const rule = styleRule(
    { type: "simple", value: selector },
    properties,
  );

  getRegistry().addGlobal([rule]);

  // Handle nested at-rules for global styles
  if (style["@media"]) {
    for (const [query, nested] of Object.entries(style["@media"])) {
      globalStyle(selector, nested); // Recursively handle, wrapped in media
    }
  }
}
```

### `src/vanilla/variables.ts`

Theme and CSS variable APIs:

```typescript
import { generateClassName, hashStyle } from "./hash.js";
import { getRegistry } from "./registry.js";
import { globalStyle } from "./global.js";

// Create a single CSS variable
function createVar(debugName?: string): string {
  const name = debugName
    ? `--${debugName}-${hashStyle(debugName)}`
    : `--${hashStyle(Math.random().toString())}`;
  return `var(${name})`;
}

// Walk an object tree, replacing values with var() references
function walkContract<T>(
  obj: T,
  path: string[] = [],
): ThemeVars<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = [...path, key];
    if (value === null || typeof value === "string") {
      // Leaf node - create var reference
      const varName = `--${currentPath.join("-")}`;
      result[key] = `var(${varName})`;
    } else if (typeof value === "object") {
      // Recurse into nested object
      result[key] = walkContract(value, currentPath);
    }
  }

  return result as ThemeVars<T>;
}

// Create theme contract (shape only, no values)
function createThemeContract<T extends Record<string, unknown>>(
  contract: T,
): ThemeVars<T> {
  return walkContract(contract);
}

// Walk and extract var assignments
function walkValues<T>(
  contract: ThemeVars<T>,
  values: ThemeValues<T>,
  path: string[] = [],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (
    const [key, varRef] of Object.entries(contract as Record<string, unknown>)
  ) {
    const value = (values as Record<string, unknown>)[key];
    const currentPath = [...path, key];

    if (typeof varRef === "string" && varRef.startsWith("var(")) {
      // Leaf - extract var name and map to value
      const varName = varRef.slice(4, -1); // Remove var( and )
      result[varName] = String(value);
    } else if (typeof varRef === "object" && typeof value === "object") {
      Object.assign(
        result,
        walkValues(
          varRef as ThemeVars<unknown>,
          value as ThemeValues<unknown>,
          currentPath,
        ),
      );
    }
  }

  return result;
}

// Create theme with values matching a contract
function createTheme<T extends Record<string, unknown>>(
  contract: ThemeVars<T>,
  values: ThemeValues<T>,
  debugName?: string,
): string {
  const vars = walkValues(contract, values);
  const className = generateClassName(vars, debugName);

  globalStyle(`.${className}`, { vars });

  return className;
}

// Create global theme (applies to selector, not class)
function createGlobalTheme<T extends Record<string, unknown>>(
  selector: string,
  tokens: T,
): ThemeVars<T> {
  const contract = walkContract(tokens);
  const vars = walkValues(contract, tokens as ThemeValues<T>);

  globalStyle(selector, { vars });

  return contract;
}

// Assign vars at runtime (returns style object for inline use)
function assignInlineVars(
  contract: ThemeVars<unknown>,
  values: ThemeValues<unknown>,
): Record<string, string> {
  return walkValues(contract, values);
}
```

### `src/vanilla/keyframes.ts`

```typescript
import { type KeyframeFrame, keyframesRule } from "../ast/builders.js";
import { transformProperties } from "../combinators/transform.js";
import { hashStyle } from "./hash.js";
import { getRegistry } from "./registry.js";

function keyframes(
  frames: Record<string, StyleInput>,
  debugName?: string,
): string {
  const name = debugName
    ? `${debugName}_${hashStyle(frames)}`
    : hashStyle(frames);

  const keyframeFrames: KeyframeFrame[] = Object.entries(frames).map(
    ([offset, style]) => ({
      offset,
      properties: transformProperties(
        Array.isArray(style) ? mergeStyles(...style) : style,
      ),
    }),
  );

  const rule = keyframesRule(name, keyframeFrames);
  getRegistry().addKeyframes(name, rule);

  return name;
}
```

### `src/vanilla/fontface.ts`

```typescript
interface FontFaceOptions {
  src: string | string[];
  fontFamily?: string;
  fontWeight?: string | number | [number, number];
  fontStyle?: string;
  fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  fontStretch?: string;
  unicodeRange?: string;
}

function fontFace(options: FontFaceOptions, debugName?: string): string {
  const family = options.fontFamily ?? debugName ?? hashStyle(options);

  const properties: CssProperty[] = [
    prop("font-family", `"${family}"`),
    prop(
      "src",
      Array.isArray(options.src) ? options.src.join(", ") : options.src,
    ),
  ];

  if (options.fontWeight !== undefined) {
    const weight = Array.isArray(options.fontWeight)
      ? options.fontWeight.join(" ")
      : String(options.fontWeight);
    properties.push(prop("font-weight", weight));
  }
  if (options.fontStyle) properties.push(prop("font-style", options.fontStyle));
  if (options.fontDisplay) {
    properties.push(prop("font-display", options.fontDisplay));
  }
  if (options.fontStretch) {
    properties.push(prop("font-stretch", options.fontStretch));
  }
  if (options.unicodeRange) {
    properties.push(prop("unicode-range", options.unicodeRange));
  }

  const rule = fontFaceRule(properties);
  getRegistry().addFontFace(rule);

  return family;
}
```

### `src/vanilla/layer.ts`

```typescript
function layer(name: string): string;
function layer(name: string, fn: () => void): string;
function layer(name: string, fn?: () => void): string {
  if (fn) {
    // Wrap styles in layer
    const tempRegistry = createStyleRegistry();
    const prevRegistry = getRegistry();
    setRegistry(tempRegistry);

    fn();

    setRegistry(prevRegistry);
    const layerRules = layerRule(name, tempRegistry.rules);
    getRegistry().addLayer(layerRules);
  } else {
    // Just declare the layer
    getRegistry().addLayer(layerStatement(name));
  }
  return name;
}

function globalLayer(...names: string[]): void {
  getRegistry().addLayer(layerStatement(...names));
}
```

### `src/vanilla/recipe.ts`

The recipe API for variants:

```typescript
interface RecipeFunction<V extends VariantDefinitions> {
  (options?: VariantSelection<V>): string;
  variants(): (keyof V)[];
  classNames: {
    base: string;
    variants: { [K in keyof V]: Record<keyof V[K], string> };
  };
}

function recipe<V extends VariantDefinitions>(
  options: RecipeOptions<V>,
  debugName?: string,
): RecipeFunction<V> {
  // Generate base class
  const baseClassName = options.base
    ? style(options.base, debugName ? `${debugName}_base` : undefined)
    : "";

  // Generate variant classes
  const variantClassNames = {} as {
    [K in keyof V]: Record<keyof V[K], string>;
  };

  if (options.variants) {
    for (
      const [variantName, variantOptions] of Object.entries(options.variants)
    ) {
      variantClassNames[variantName as keyof V] = {} as Record<
        keyof V[keyof V],
        string
      >;

      for (const [optionName, optionStyle] of Object.entries(variantOptions)) {
        const className = style(
          optionStyle,
          debugName ? `${debugName}_${variantName}_${optionName}` : undefined,
        );
        (variantClassNames[variantName as keyof V] as Record<string, string>)[
          optionName
        ] = className;
      }
    }
  }

  // Generate compound variant classes
  const compoundClassNames: Array<
    { condition: Partial<VariantSelection<V>>; className: string }
  > = [];

  if (options.compoundVariants) {
    for (const compound of options.compoundVariants) {
      const className = style(
        compound.style,
        debugName ? `${debugName}_compound` : undefined,
      );
      compoundClassNames.push({ condition: compound.variants, className });
    }
  }

  // The recipe function
  const recipeFn = (selection?: VariantSelection<V>): string => {
    const classes: string[] = [];

    if (baseClassName) classes.push(baseClassName);

    // Apply defaults then selection
    const resolved = {
      ...options.defaultVariants,
      ...selection,
    } as VariantSelection<V>;

    // Add variant classes
    for (const [variantName, optionName] of Object.entries(resolved)) {
      if (
        optionName !== undefined && variantClassNames[variantName as keyof V]
      ) {
        const className =
          (variantClassNames[variantName as keyof V] as Record<string, string>)[
            optionName as string
          ];
        if (className) classes.push(className);
      }
    }

    // Check compound variants
    for (const { condition, className } of compoundClassNames) {
      const matches = Object.entries(condition).every(
        ([k, v]) => resolved[k as keyof V] === v,
      );
      if (matches) classes.push(className);
    }

    return classes.join(" ");
  };

  recipeFn.variants = () => Object.keys(options.variants ?? {}) as (keyof V)[];
  recipeFn.classNames = { base: baseClassName, variants: variantClassNames };

  return recipeFn as RecipeFunction<V>;
}
```

### `src/vanilla/index.ts`

```typescript
// Core
export { style, styleVariants } from "./style.js";
export { globalStyle } from "./global.js";

// Variables & Theming
export {
  assignInlineVars,
  createGlobalTheme,
  createTheme,
  createThemeContract,
  createVar,
} from "./variables.js";

// Animations & Fonts
export { keyframes } from "./keyframes.js";
export { fontFace, type FontFaceOptions } from "./fontface.js";

// Layers
export { globalLayer, layer } from "./layer.js";

// Recipes
export { recipe, type RecipeOptions } from "./recipe.js";

// Registry
export { createStyleRegistry, getRegistry, setRegistry } from "./registry.js";

// Configuration
export { type ClassNameConfig, setClassNameConfig } from "./hash.js";

// Types
export * from "./types.js";
```

## Tests

### `tests/vanilla/style.test.ts`

1. `style()` returns unique class name
2. Same styles return same class name (content-addressable)
3. Different styles return different class names
4. `styleVariants()` creates correct variant map
5. Debug names appear in class names when configured

### `tests/vanilla/recipe.test.ts`

1. Base styles applied when no variants selected
2. Default variants applied automatically
3. Explicit variant selection overrides defaults
4. Compound variants apply when conditions match
5. `variants()` returns list of variant names
6. `classNames` exposes all generated classes

### `tests/vanilla/variables.test.ts`

1. `createVar()` returns valid var() reference
2. `createThemeContract()` creates var references for all paths
3. `createTheme()` generates class with variable assignments
4. Nested theme contracts work correctly

## Verification

```bash
deno check src/vanilla/
deno test tests/vanilla/

# Full example
deno eval "
import {
  style, styleVariants, globalStyle,
  createTheme, createThemeContract,
  recipe, keyframes, getRegistry
} from './src/vanilla/index.ts';

// Theme
const vars = createThemeContract({ color: { primary: null, secondary: null } });
const lightTheme = createTheme(vars, { color: { primary: '#007bff', secondary: '#6c757d' } });

// Animation
const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

// Recipe
const button = recipe({
  base: { padding: 8, borderRadius: 4, animation: fadeIn + ' 0.3s' },
  variants: {
    size: {
      small: { padding: 4, fontSize: 12 },
      large: { padding: 16, fontSize: 18 },
    },
    color: {
      primary: { backgroundColor: vars.color.primary },
      secondary: { backgroundColor: vars.color.secondary },
    },
  },
  defaultVariants: { size: 'small', color: 'primary' },
});

// Global reset
globalStyle('*', { boxSizing: 'border-box' });

// Usage
console.log('Theme class:', lightTheme);
console.log('Button (default):', button());
console.log('Button (large primary):', button({ size: 'large' }));
console.log('\\n--- Generated CSS ---\\n');
console.log(getRegistry().render());
"
```
