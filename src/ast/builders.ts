import type {
  ComplexSelector,
  CompoundSelector,
  ContainerRule,
  CssFallback,
  CssProperty,
  CssRule,
  CssValue,
  CssVariable,
  FontFaceRule,
  KeyframeFrame,
  KeyframesRule,
  LayerRule,
  LayerStatementRule,
  MediaRule,
  PropertyRule,
  PseudoSelector,
  Selector,
  SimpleSelector,
  StyleRule,
  SupportsRule,
} from "./types.ts";

// Rule builders

export function styleRule(
  selectors: Selector | Selector[],
  properties: CssProperty[],
): StyleRule {
  return {
    type: "style",
    selectors: Array.isArray(selectors) ? selectors : [selectors],
    properties,
  };
}

export function mediaRule(query: string, rules: CssRule[]): MediaRule {
  return {
    type: "media",
    query,
    rules,
  };
}

export function supportsRule(query: string, rules: CssRule[]): SupportsRule {
  return {
    type: "supports",
    query,
    rules,
  };
}

export function containerRule(
  query: string,
  rules: CssRule[],
  name?: string,
): ContainerRule {
  return {
    type: "container",
    query,
    rules,
    name,
  };
}

export function keyframesRule(
  name: string,
  frames: Record<string, CssProperty[]>,
): KeyframesRule {
  const frameList: KeyframeFrame[] = Object.entries(frames).map(
    ([offset, properties]) => ({
      offset,
      properties,
    }),
  );
  return {
    type: "keyframes",
    name,
    frames: frameList,
  };
}

export function fontFaceRule(properties: CssProperty[]): FontFaceRule {
  return {
    type: "font-face",
    properties,
  };
}

export function layerRule(name: string, rules: CssRule[]): LayerRule {
  return {
    type: "layer",
    name,
    rules,
  };
}

export function layerStatement(...names: string[]): LayerStatementRule {
  return {
    type: "layer-statement",
    names,
  };
}

export function propertyRule(
  name: string,
  syntax: string,
  inherits: boolean,
  initialValue?: string,
): PropertyRule {
  return {
    type: "property",
    name,
    syntax,
    inherits,
    ...(initialValue !== undefined && { initialValue }),
  };
}

// Property/value builders

export function prop(
  name: string,
  value: CssValue,
  important?: boolean,
): CssProperty {
  return {
    name,
    value,
    ...(important && { important }),
  };
}

export function cssVar(name: string, fallback?: CssValue): CssVariable {
  return {
    type: "var",
    name,
    ...(fallback !== undefined && { fallback }),
  };
}

export function fallback(...values: CssValue[]): CssFallback {
  return {
    type: "fallback",
    values,
  };
}

// Selector builders

export function cls(name: string): SimpleSelector {
  return {
    type: "simple",
    value: `.${name}`,
  };
}

export function id(name: string): SimpleSelector {
  return {
    type: "simple",
    value: `#${name}`,
  };
}

export function tag(name: string): SimpleSelector {
  return {
    type: "simple",
    value: name,
  };
}

export function attr(selector: string): SimpleSelector {
  return {
    type: "simple",
    value: selector,
  };
}

export function universal(): SimpleSelector {
  return {
    type: "simple",
    value: "*",
  };
}

export function compound(...selectors: SimpleSelector[]): CompoundSelector {
  return {
    type: "compound",
    selectors,
  };
}

export function descendant(
  ancestor: Selector,
  desc: Selector,
): ComplexSelector {
  return {
    type: "complex",
    left: ancestor,
    combinator: " ",
    right: desc,
  };
}

export function child(parent: Selector, ch: Selector): ComplexSelector {
  return {
    type: "complex",
    left: parent,
    combinator: ">",
    right: ch,
  };
}

export function adjacent(left: Selector, right: Selector): ComplexSelector {
  return {
    type: "complex",
    left,
    combinator: "+",
    right,
  };
}

export function sibling(left: Selector, right: Selector): ComplexSelector {
  return {
    type: "complex",
    left,
    combinator: "~",
    right,
  };
}

export function pseudo(base: Selector, p: string): PseudoSelector {
  return {
    type: "pseudo",
    base,
    pseudo: p,
    isElement: false,
  };
}

export function pseudoElement(base: Selector, p: string): PseudoSelector {
  return {
    type: "pseudo",
    base,
    pseudo: p,
    isElement: true,
  };
}
