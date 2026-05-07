import type { CssProperty, FontFaceRule } from "../ast/types.ts";
import { prop } from "../ast/builders.ts";
import { hashStyle } from "./hash.ts";
import { getRegistry } from "./registry.ts";

export interface FontFaceOptions {
  src: string | string[];
  fontFamily?: string;
  fontWeight?: string | number | [number, number];
  fontStyle?: string;
  fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  fontStretch?: string;
  unicodeRange?: string;
}

export function fontFace(
  options: FontFaceOptions,
  debugName?: string,
): string {
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
  if (options.fontStyle) {
    properties.push(prop("font-style", options.fontStyle));
  }
  if (options.fontDisplay) {
    properties.push(prop("font-display", options.fontDisplay));
  }
  if (options.fontStretch) {
    properties.push(prop("font-stretch", options.fontStretch));
  }
  if (options.unicodeRange) {
    properties.push(prop("unicode-range", options.unicodeRange));
  }

  const rule: FontFaceRule = {
    type: "font-face",
    properties,
  };

  getRegistry().addFontFace(rule);

  return family;
}
