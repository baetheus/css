import type { StyleObject, StyleInput, StyleProperties } from "./types.ts";
import type { CssRule } from "../ast/types.ts";
import {
  cls,
  containerRule,
  layerRule,
  mediaRule,
  styleRule,
  supportsRule,
} from "../ast/builders.ts";
import { transformProperties } from "./transform.ts";
import { validateMediaQuery, validateSelector } from "./validate.ts";
import { createVarAssignments } from "./variables.ts";

// Flatten nested arrays of style inputs
function flattenInputs(input: StyleInput): StyleObject[] {
  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenInputs(item as StyleInput));
  }
  return [input as StyleObject];
}

// Deep merge style objects (later wins)
export function mergeStyles(...inputs: StyleInput[]): StyleObject {
  const result: StyleObject = {};
  const flattened = inputs.flatMap((input) => flattenInputs(input));

  for (const input of flattened) {
    // Save nested objects before Object.assign overwrites them
    const prevVars = result.vars;
    const prevSelectors = result.selectors;
    const prevMedia = result["@media"];
    const prevSupports = result["@supports"];
    const prevContainer = result["@container"];
    const prevLayer = result["@layer"];

    Object.assign(result, input);

    // Deep merge nested objects
    if (prevVars || input.vars)
      result.vars = { ...prevVars, ...input.vars };
    if (prevSelectors || input.selectors)
      result.selectors = { ...prevSelectors, ...input.selectors };
    if (prevMedia || input["@media"])
      result["@media"] = { ...prevMedia, ...input["@media"] };
    if (prevSupports || input["@supports"])
      result["@supports"] = { ...prevSupports, ...input["@supports"] };
    if (prevContainer || input["@container"])
      result["@container"] = { ...prevContainer, ...input["@container"] };
    if (prevLayer || input["@layer"])
      result["@layer"] = { ...prevLayer, ...input["@layer"] };
  }
  return result;
}

// Compile a style object to CSS rules for a given class name
export function compileStyle(className: string, input: StyleInput): CssRule[] {
  const style: StyleObject = Array.isArray(input) ? mergeStyles(...input) : input as StyleObject;
  const rules: CssRule[] = [];
  const selector = cls(className);

  // Base properties + vars
  const properties = [
    ...createVarAssignments(style.vars ?? {}),
    ...transformProperties(style as StyleProperties),
  ];
  if (properties.length > 0) {
    rules.push(styleRule(selector, properties));
  }

  // Nested selectors
  if (style.selectors) {
    for (const [sel, props] of Object.entries(style.selectors)) {
      validateSelector(sel);
      const resolvedSelector = sel.replace(/&/g, `.${className}`);
      rules.push(
        styleRule(
          { type: "simple", value: resolvedSelector },
          transformProperties(props)
        )
      );
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
