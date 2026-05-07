import type { LayerRule, LayerStatementRule } from "../ast/types.ts";
import {
  createStyleRegistry,
  getRegistry,
  setRegistry,
  type StyleRegistry,
} from "./registry.ts";

export function layer(name: string): string;
export function layer(name: string, fn: () => void): string;
export function layer(name: string, fn?: () => void): string {
  if (fn) {
    // Wrap styles in layer
    const tempRegistry = createStyleRegistry();
    const prevRegistry = getRegistry();
    setRegistry(tempRegistry);

    fn();

    setRegistry(prevRegistry);
    const layerRules: LayerRule = {
      type: "layer",
      name,
      rules: tempRegistry.rules,
    };
    getRegistry().addLayer(layerRules);
  } else {
    // Just declare the layer
    const statement: LayerStatementRule = {
      type: "layer-statement",
      names: [name],
    };
    getRegistry().addLayer(statement);
  }
  return name;
}

export function globalLayer(...names: string[]): void {
  const statement: LayerStatementRule = {
    type: "layer-statement",
    names,
  };
  getRegistry().addLayer(statement);
}
