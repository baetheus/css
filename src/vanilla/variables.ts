import type { ThemeValues, ThemeVars } from "./types.ts";
import { generateClassName, hashStyle } from "./hash.ts";
import { globalStyle } from "./global.ts";

// Create a single CSS variable
export function createVar(debugName?: string): string {
  const name = debugName
    ? `--${debugName}-${hashStyle(debugName)}`
    : `--${hashStyle(Math.random().toString())}`;
  return `var(${name})`;
}

// Walk an object tree, replacing values with var() references
function walkContract<T>(obj: T, path: string[] = []): ThemeVars<T> {
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
export function createThemeContract<T extends Record<string, unknown>>(
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
    const [key, varRef] of Object.entries(
      contract as Record<string, unknown>,
    )
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
export function createTheme<T extends Record<string, unknown>>(
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
export function createGlobalTheme<T extends Record<string, unknown>>(
  selector: string,
  tokens: T,
): ThemeVars<T> {
  const contract = walkContract(tokens);
  const vars = walkValues(contract, tokens as ThemeValues<T>);

  globalStyle(selector, { vars });

  return contract;
}

// Assign vars at runtime (returns style object for inline use)
export function assignInlineVars(
  contract: ThemeVars<unknown>,
  values: ThemeValues<unknown>,
): Record<string, string> {
  return walkValues(contract, values);
}
