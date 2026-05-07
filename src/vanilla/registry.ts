import type {
  CssRule,
  FontFaceRule,
  KeyframesRule,
  LayerRule,
  LayerStatementRule,
} from "../ast/types.ts";
import { renderCss, type RenderOptions } from "../ast/render.ts";

export interface StyleRegistry {
  readonly rules: CssRule[];
  addClass(className: string, rules: CssRule[]): void;
  addGlobal(rules: CssRule[]): void;
  addKeyframes(name: string, rule: KeyframesRule): void;
  addFontFace(rule: FontFaceRule): void;
  addLayer(rule: LayerRule | LayerStatementRule): void;
  render(options?: RenderOptions): string;
  clear(): void;
}

export function createStyleRegistry(): StyleRegistry {
  const rules: CssRule[] = [];

  return {
    get rules() {
      return rules;
    },
    addClass(_className, newRules) {
      rules.push(...newRules);
    },
    addGlobal(newRules) {
      rules.push(...newRules);
    },
    addKeyframes(_name, rule) {
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

export function getRegistry(): StyleRegistry {
  if (!globalRegistry) {
    globalRegistry = createStyleRegistry();
  }
  return globalRegistry;
}

export function setRegistry(registry: StyleRegistry): void {
  globalRegistry = registry;
}
