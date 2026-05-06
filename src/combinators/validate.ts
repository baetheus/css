// Validate selector references the element with &
export function validateSelector(selector: string): void {
  if (!selector.includes("&")) {
    throw new Error(
      `Invalid selector "${selector}": must reference the element with &`
    );
  }
}

// Basic media query validation
export function validateMediaQuery(query: string): void {
  if (!query.trim()) {
    throw new Error("Media query cannot be empty");
  }
  // Basic syntax check - must have parentheses or valid keywords
  if (
    !query.includes("(") &&
    !["all", "print", "screen"].some((k) => query.includes(k))
  ) {
    throw new Error(`Invalid media query: ${query}`);
  }
}
