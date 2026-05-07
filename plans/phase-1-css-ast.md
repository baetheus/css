# Phase 1: CSS AST

## Objective

Create core data structures representing CSS documents and a `renderCss()`
function to serialize them to strings.

## Files to Create

### `src/ast/types.ts`

Core discriminated union types:

```typescript
// Values
type CssValue = string | number | CssVariable | CssFallback;
interface CssVariable {
  type: "var";
  name: string;
  fallback?: CssValue;
}
interface CssFallback {
  type: "fallback";
  values: readonly CssValue[];
}
interface CssProperty {
  name: string;
  value: CssValue;
  important?: boolean;
}

// Selectors
type Selector =
  | SimpleSelector
  | CompoundSelector
  | ComplexSelector
  | PseudoSelector;
interface SimpleSelector {
  type: "simple";
  value: string;
}
interface CompoundSelector {
  type: "compound";
  selectors: readonly SimpleSelector[];
}
interface ComplexSelector {
  type: "complex";
  left: Selector;
  combinator: " " | ">" | "+" | "~";
  right: Selector;
}
interface PseudoSelector {
  type: "pseudo";
  base: Selector;
  pseudo: string;
  isElement: boolean;
}

// Rules (discriminated union)
type CssRule =
  | StyleRule
  | FontFaceRule
  | KeyframesRule
  | LayerRule
  | LayerStatementRule
  | MediaRule
  | SupportsRule
  | ContainerRule
  | PropertyRule;

interface StyleRule {
  type: "style";
  selectors: readonly Selector[];
  properties: readonly CssProperty[];
}
interface FontFaceRule {
  type: "font-face";
  properties: readonly CssProperty[];
}
interface KeyframesRule {
  type: "keyframes";
  name: string;
  frames: readonly KeyframeFrame[];
}
interface KeyframeFrame {
  offset: string;
  properties: readonly CssProperty[];
}
interface LayerRule {
  type: "layer";
  name: string;
  rules: readonly CssRule[];
}
interface LayerStatementRule {
  type: "layer-statement";
  names: readonly string[];
}
interface MediaRule {
  type: "media";
  query: string;
  rules: readonly CssRule[];
}
interface SupportsRule {
  type: "supports";
  query: string;
  rules: readonly CssRule[];
}
interface ContainerRule {
  type: "container";
  name?: string;
  query: string;
  rules: readonly CssRule[];
}
interface PropertyRule {
  type: "property";
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue?: string;
}

interface CssDocument {
  rules: readonly CssRule[];
}
```

### `src/ast/builders.ts`

Builder functions for ergonomic construction:

```typescript
// Rule builders
function styleRule(
  selectors: Selector | Selector[],
  properties: CssProperty[],
): StyleRule;
function mediaRule(query: string, rules: CssRule[]): MediaRule;
function supportsRule(query: string, rules: CssRule[]): SupportsRule;
function containerRule(
  query: string,
  rules: CssRule[],
  name?: string,
): ContainerRule;
function keyframesRule(
  name: string,
  frames: Record<string, CssProperty[]>,
): KeyframesRule;
function fontFaceRule(properties: CssProperty[]): FontFaceRule;
function layerRule(name: string, rules: CssRule[]): LayerRule;
function layerStatement(...names: string[]): LayerStatementRule;
function propertyRule(
  name: string,
  syntax: string,
  inherits: boolean,
  initialValue?: string,
): PropertyRule;

// Property/value builders
function prop(name: string, value: CssValue, important?: boolean): CssProperty;
function cssVar(name: string, fallback?: CssValue): CssVariable;
function fallback(...values: CssValue[]): CssFallback;

// Selector builders
function cls(name: string): SimpleSelector; // .className
function id(name: string): SimpleSelector; // #id
function tag(name: string): SimpleSelector; // div
function attr(selector: string): SimpleSelector; // [attr="value"]
function universal(): SimpleSelector; // *
function compound(...selectors: SimpleSelector[]): CompoundSelector;
function descendant(ancestor: Selector, desc: Selector): ComplexSelector;
function child(parent: Selector, ch: Selector): ComplexSelector;
function adjacent(left: Selector, right: Selector): ComplexSelector;
function sibling(left: Selector, right: Selector): ComplexSelector;
function pseudo(base: Selector, p: string): PseudoSelector; // :hover, :focus
function pseudoElement(base: Selector, p: string): PseudoSelector; // ::before, ::after
```

### `src/ast/render.ts`

CSS serialization:

```typescript
interface RenderOptions {
  minify?: boolean;
  indent?: string; // default '  '
  newline?: string; // default '\n'
}

function renderCss(document: CssDocument, options?: RenderOptions): string;
function renderRule(
  rule: CssRule,
  options?: RenderOptions,
  depth?: number,
): string;
function renderSelector(selector: Selector): string;
function renderProperty(property: CssProperty): string;
function renderValue(value: CssValue): string;
```

Key implementation details:

- `renderSelector`: Recursively builds selector string from AST
- `renderValue`: Handles var() syntax, fallback arrays
- `renderRule`: Switch on `rule.type` for each rule kind
- Proper indentation for nested rules (media, layer, etc.)

### `src/ast/index.ts`

Public exports:

```typescript
export * from "./types.js";
export * from "./builders.js";
export {
  renderCss,
  renderProperty,
  renderRule,
  renderSelector,
  renderValue,
} from "./render.js";
```

## Tests

### `tests/ast/render.test.ts`

Test cases:

1. Simple style rule with one selector, one property
2. Style rule with multiple selectors
3. Properties with CSS variables
4. Properties with fallback values
5. Media rule with nested style rules
6. Keyframes with multiple frames
7. Layer rules (nested and statement)
8. Complex selectors (descendant, child, sibling)
9. Pseudo-classes and pseudo-elements
10. Minified vs pretty output
11. `!important` properties

### `tests/ast/builders.test.ts`

Test cases:

1. Each builder produces correct AST structure
2. Compound selectors combine correctly
3. Complex selectors nest properly
4. CSS variable builder with/without fallback

## Verification

```bash
# Type check
deno check src/ast/

# Run tests
deno test tests/ast/

# Manual verification - generate sample CSS
deno eval "
import { styleRule, cls, prop, mediaRule, renderCss } from './src/ast/index.ts';

const doc = {
  rules: [
    styleRule(cls('button'), [
      prop('padding', '8px 16px'),
      prop('backgroundColor', 'blue'),
    ]),
    mediaRule('(min-width: 768px)', [
      styleRule(cls('button'), [
        prop('padding', '12px 24px'),
      ])
    ])
  ]
};

console.log(renderCss(doc));
"
```

Expected output:

```css
.button {
  padding: 8px 16px;
  background-color: blue;
}
@media (min-width: 768px) {
  .button {
    padding: 12px 24px;
  }
}
```
