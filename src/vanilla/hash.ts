import type { StyleInput } from "../combinators/types.ts";

// DJB2 hash - fast, simple, good distribution
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// Hash a style object to a stable string
export function hashStyle(style: unknown): string {
  const content = JSON.stringify(style);
  const hash = djb2(content);
  return hash.toString(36).padStart(7, "0"); // 7 chars, zero-padded
}

// Configuration
export interface ClassNameConfig {
  prefix?: string; // e.g., 'css_'
  debug?: boolean; // Include readable name
  hashFn?: (content: unknown) => string; // Custom hash
}

let config: ClassNameConfig = {};

export function setClassNameConfig(c: ClassNameConfig): void {
  config = c;
}

export function getClassNameConfig(): ClassNameConfig {
  return config;
}

// Generate class name
export function generateClassName(
  style: StyleInput,
  debugName?: string,
): string {
  const hash = (config.hashFn ?? hashStyle)(style);
  const prefix = config.prefix ?? "";

  if (config.debug && debugName) {
    return `${prefix}${debugName}_${hash}`;
  }
  return `${prefix}${hash}`;
}
