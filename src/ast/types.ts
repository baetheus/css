// CSS Values
export type CssValue = string | number | CssVariable | CssFallback;

export interface CssVariable {
  type: "var";
  name: string;
  fallback?: CssValue;
}

export interface CssFallback {
  type: "fallback";
  values: readonly CssValue[];
}

export interface CssProperty {
  name: string;
  value: CssValue;
  important?: boolean;
}

// Selectors
export type Selector =
  | SimpleSelector
  | CompoundSelector
  | ComplexSelector
  | PseudoSelector;

export interface SimpleSelector {
  type: "simple";
  value: string;
}

export interface CompoundSelector {
  type: "compound";
  selectors: readonly SimpleSelector[];
}

export interface ComplexSelector {
  type: "complex";
  left: Selector;
  combinator: " " | ">" | "+" | "~";
  right: Selector;
}

export interface PseudoSelector {
  type: "pseudo";
  base: Selector;
  pseudo: string;
  isElement: boolean;
}

// Rules (discriminated union)
export interface StyleRule {
  type: "style";
  selectors: readonly Selector[];
  properties: readonly CssProperty[];
}

export interface FontFaceRule {
  type: "font-face";
  properties: readonly CssProperty[];
}

export interface KeyframeFrame {
  offset: string;
  properties: readonly CssProperty[];
}

export interface KeyframesRule {
  type: "keyframes";
  name: string;
  frames: readonly KeyframeFrame[];
}

export interface LayerRule {
  type: "layer";
  name: string;
  rules: readonly CssRule[];
}

export interface LayerStatementRule {
  type: "layer-statement";
  names: readonly string[];
}

export interface MediaRule {
  type: "media";
  query: string;
  rules: readonly CssRule[];
}

export interface SupportsRule {
  type: "supports";
  query: string;
  rules: readonly CssRule[];
}

export interface ContainerRule {
  type: "container";
  name: string | undefined;
  query: string;
  rules: readonly CssRule[];
}

export interface PropertyRule {
  type: "property";
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue?: string;
}

export interface CssDocument {
  rules: readonly CssRule[];
}

export type CssRule =
  | StyleRule
  | FontFaceRule
  | KeyframesRule
  | LayerRule
  | LayerStatementRule
  | MediaRule
  | SupportsRule
  | ContainerRule
  | PropertyRule;
