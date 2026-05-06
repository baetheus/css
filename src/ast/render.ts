import type {
  CssDocument,
  CssProperty,
  CssRule,
  CssValue,
  Selector,
} from "./types.ts";

export interface RenderOptions {
  minify?: boolean;
  indent?: string;
  newline?: string;
}

interface ResolvedOptions {
  minify: boolean;
  indent: string;
  newline: string;
}

function resolveOptions(options?: RenderOptions): ResolvedOptions {
  const minify = options?.minify ?? false;
  return {
    minify,
    indent: minify ? "" : (options?.indent ?? "  "),
    newline: minify ? "" : (options?.newline ?? "\n"),
  };
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function renderValue(value: CssValue): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value.type === "var") {
    if (value.fallback !== undefined) {
      return `var(${value.name}, ${renderValue(value.fallback)})`;
    }
    return `var(${value.name})`;
  }
  if (value.type === "fallback") {
    return value.values.map(renderValue).join(", ");
  }
  // Exhaustive check
  const _exhaustive: never = value;
  return _exhaustive;
}

export function renderProperty(property: CssProperty): string {
  const name = camelToKebab(property.name);
  const value = renderValue(property.value);
  const important = property.important ? " !important" : "";
  return `${name}: ${value}${important}`;
}

export function renderSelector(selector: Selector): string {
  switch (selector.type) {
    case "simple":
      return selector.value;
    case "compound":
      return selector.selectors.map((s) => s.value).join("");
    case "complex": {
      const left = renderSelector(selector.left);
      const right = renderSelector(selector.right);
      if (selector.combinator === " ") {
        return `${left} ${right}`;
      }
      return `${left} ${selector.combinator} ${right}`;
    }
    case "pseudo": {
      const base = renderSelector(selector.base);
      const sep = selector.isElement ? "::" : ":";
      return `${base}${sep}${selector.pseudo}`;
    }
  }
}

export function renderRule(
  rule: CssRule,
  options?: RenderOptions,
  depth: number = 0
): string {
  const opts = resolveOptions(options);
  const { indent, newline, minify } = opts;
  const baseIndent = indent.repeat(depth);
  const innerIndent = indent.repeat(depth + 1);
  const space = minify ? "" : " ";
  const propSep = minify ? ";" : `;${newline}`;

  switch (rule.type) {
    case "style": {
      const selectors = rule.selectors.map(renderSelector).join(`,${space}`);
      const props = rule.properties
        .map((p) => `${innerIndent}${renderProperty(p)}`)
        .join(propSep);
      return `${baseIndent}${selectors}${space}{${newline}${props}${propSep}${baseIndent}}`;
    }

    case "font-face": {
      const props = rule.properties
        .map((p) => `${innerIndent}${renderProperty(p)}`)
        .join(propSep);
      return `${baseIndent}@font-face${space}{${newline}${props}${propSep}${baseIndent}}`;
    }

    case "keyframes": {
      const frames = rule.frames
        .map((frame) => {
          const frameIndent = indent.repeat(depth + 1);
          const frameInner = indent.repeat(depth + 2);
          const props = frame.properties
            .map((p) => `${frameInner}${renderProperty(p)}`)
            .join(propSep);
          return `${frameIndent}${frame.offset}${space}{${newline}${props}${propSep}${frameIndent}}`;
        })
        .join(newline);
      return `${baseIndent}@keyframes ${rule.name}${space}{${newline}${frames}${newline}${baseIndent}}`;
    }

    case "layer": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@layer ${rule.name}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "layer-statement": {
      return `${baseIndent}@layer ${rule.names.join(", ")};`;
    }

    case "media": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@media ${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "supports": {
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@supports ${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "container": {
      const namePrefix = rule.name ? `${rule.name} ` : "";
      const nested = rule.rules
        .map((r) => renderRule(r, options, depth + 1))
        .join(newline);
      return `${baseIndent}@container ${namePrefix}${rule.query}${space}{${newline}${nested}${newline}${baseIndent}}`;
    }

    case "property": {
      const props: string[] = [
        `${innerIndent}syntax: "${rule.syntax}"`,
        `${innerIndent}inherits: ${rule.inherits}`,
      ];
      if (rule.initialValue !== undefined) {
        props.push(`${innerIndent}initial-value: ${rule.initialValue}`);
      }
      return `${baseIndent}@property ${rule.name}${space}{${newline}${props.join(propSep)}${propSep}${baseIndent}}`;
    }
  }
}

export function renderCss(
  document: CssDocument,
  options?: RenderOptions
): string {
  const opts = resolveOptions(options);
  return document.rules
    .map((rule) => renderRule(rule, options, 0))
    .join(opts.newline);
}
