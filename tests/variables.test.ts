import { assertEquals, assertNotEquals } from "@std/assert";
import {
  buildVarShape,
  type Contract,
  contract,
  isContract,
  type MapShape,
  type Shape,
  type VariableKey,
  type Variables,
  type VariableValue,
  vars,
  type VarsValues,
  walkShape,
} from "../variables.ts";
import { render, style } from "../style.ts";

// =============================================================================
// walkShape tests
// =============================================================================

Deno.test("walkShape - transforms leaf values", () => {
  const shape = { a: null, b: null };
  const result = walkShape(
    shape,
    (v): v is null => v === null,
    (_, path) => path.join("-"),
  );
  assertEquals(result, { a: "a", b: "b" });
});

Deno.test("walkShape - handles nested shapes", () => {
  const shape = { colors: { primary: null, secondary: null } };
  const result = walkShape(
    shape,
    (v): v is null => v === null,
    (_, path) => path.join("-"),
  );
  assertEquals(result, {
    colors: { primary: "colors-primary", secondary: "colors-secondary" },
  });
});

Deno.test("walkShape - handles deeply nested shapes", () => {
  const shape = { a: { b: { c: { d: null } } } };
  const result = walkShape(
    shape,
    (v): v is null => v === null,
    (_, path) => path.join("-"),
  );
  assertEquals(result, { a: { b: { c: { d: "a-b-c-d" } } } });
});

Deno.test("walkShape - passes value to callback", () => {
  const shape = { a: "original" };
  const result = walkShape(
    shape,
    (v): v is string => typeof v === "string",
    (value) => `${value}-modified`,
  );
  assertEquals(result, { a: "original-modified" });
});

Deno.test("walkShape - handles mixed nesting levels", () => {
  const shape = { top: null, nested: { inner: null } };
  const result = walkShape(
    shape,
    (v): v is null => v === null,
    (_, path) => path.length,
  );
  assertEquals(result, { top: 1, nested: { inner: 2 } });
});

// =============================================================================
// buildVarShape tests
// =============================================================================

Deno.test("buildVarShape - creates var references", () => {
  const shape = { primary: null };
  const result = buildVarShape(shape, "abc1234");
  assertEquals(result, { primary: "var(--abc1234-primary)" });
});

Deno.test("buildVarShape - handles nested shapes", () => {
  const shape = { colors: { primary: null, secondary: null } };
  const result = buildVarShape(shape, "abc1234");
  assertEquals(result, {
    colors: {
      primary: "var(--abc1234-colors-primary)",
      secondary: "var(--abc1234-colors-secondary)",
    },
  });
});

Deno.test("buildVarShape - handles deep nesting", () => {
  const shape = { a: { b: { c: null } } };
  const result = buildVarShape(shape, "hash");
  assertEquals(result, { a: { b: { c: "var(--hash-a-b-c)" } } });
});

// =============================================================================
// contract tests
// =============================================================================

Deno.test("contract - creates var references from shape", () => {
  const theme = contract({ primary: null });
  assertEquals(typeof theme.primary, "string");
  assertEquals(theme.primary.startsWith("var(--"), true);
});

Deno.test("contract - returns consistent results for same shape", () => {
  const theme1 = contract({ color: null });
  const theme2 = contract({ color: null });
  assertEquals(theme1.color, theme2.color);
});

Deno.test("contract - returns different results for different shapes", () => {
  const theme1 = contract({ a: null });
  const theme2 = contract({ b: null });
  assertNotEquals(theme1.a, theme2.b);
});

Deno.test("contract - handles nested shapes", () => {
  const theme = contract({
    colors: {
      primary: null,
      secondary: null,
    },
  });
  assertEquals(typeof theme.colors.primary, "string");
  assertEquals(typeof theme.colors.secondary, "string");
});

Deno.test("contract - includes non-enumerable hash symbol", () => {
  const theme = contract({ color: null });
  const keys = Object.keys(theme);
  assertEquals(keys, ["color"]);
});

// =============================================================================
// isContract tests
// =============================================================================

Deno.test("isContract - returns true for contracts", () => {
  const theme = contract({ color: null });
  assertEquals(isContract(theme), true);
});

Deno.test("isContract - returns false for plain objects", () => {
  const obj = { color: "var(--test)" };
  assertEquals(isContract(obj), false);
});

Deno.test("isContract - returns false for null", () => {
  assertEquals(isContract(null), false);
});

Deno.test("isContract - returns false for undefined", () => {
  assertEquals(isContract(undefined), false);
});

Deno.test("isContract - returns false for primitives", () => {
  assertEquals(isContract("string"), false);
  assertEquals(isContract(123), false);
  assertEquals(isContract(true), false);
});

Deno.test("isContract - returns false for arrays", () => {
  assertEquals(isContract([1, 2, 3]), false);
});

// =============================================================================
// vars tests (Variables output)
// =============================================================================

Deno.test("vars - creates CSS custom properties", () => {
  const theme = contract({ color: null });
  const result = vars(theme, { color: "red" });
  assertEquals(typeof Object.keys(result)[0], "string");
  assertEquals(Object.keys(result)[0].startsWith("--"), true);
  assertEquals(Object.values(result)[0], "red");
});

Deno.test("vars - handles nested values", () => {
  const theme = contract({ colors: { primary: null, secondary: null } });
  const result = vars(theme, {
    colors: { primary: "blue", secondary: "green" },
  });
  const keys = Object.keys(result);
  assertEquals(keys.length, 2);
  assertEquals(Object.values(result).includes("blue"), true);
  assertEquals(Object.values(result).includes("green"), true);
});

Deno.test("vars - handles number values", () => {
  const theme = contract({ spacing: null });
  const result = vars(theme, { spacing: 16 });
  assertEquals(Object.values(result)[0], 16);
});

Deno.test("vars - handles deep nesting", () => {
  const theme = contract({ a: { b: { c: null } } });
  const result = vars(theme, { a: { b: { c: "value" } } });
  assertEquals(Object.values(result)[0], "value");
});

// =============================================================================
// vars with style tests
// =============================================================================

Deno.test("vars with style - creates Style with CSS custom properties", () => {
  const theme = contract({ color: null });
  const light = style(vars(theme, { color: "blue" }));
  assertEquals(typeof light.toString(), "string");
});

Deno.test("vars with style - renders correct CSS", () => {
  const theme = contract({ primary: null });
  const light = style(vars(theme, { primary: "blue" }));
  const css = render(light);
  assertEquals(css.includes("blue"), true);
  assertEquals(css.includes("--"), true);
});

Deno.test("vars with style - handles nested contracts", () => {
  const theme = contract({ colors: { primary: null, secondary: null } });
  const light = style(vars(theme, {
    colors: { primary: "blue", secondary: "green" },
  }));
  const css = render(light);
  assertEquals(css.includes("blue"), true);
  assertEquals(css.includes("green"), true);
});

Deno.test("vars with style - allows custom selectors", () => {
  const theme = contract({ color: null });
  const light = style(":root", vars(theme, { color: "red" }));
  const css = render(light);
  assertEquals(css.includes(":root"), true);
  assertEquals(css.includes("red"), true);
});

// =============================================================================
// Type verification tests
// =============================================================================

Deno.test("VariableKey - accepts custom property names", () => {
  const key1: VariableKey = "--primary-color";
  const key2: VariableKey = "--spacing";
  assertEquals(key1, "--primary-color");
  assertEquals(key2, "--spacing");
});

Deno.test("VariableValue - accepts var() references", () => {
  const ref1: VariableValue = "var(--primary)";
  const ref2: VariableValue = "var(--color, blue)";
  assertEquals(ref1, "var(--primary)");
  assertEquals(ref2, "var(--color, blue)");
});

Deno.test("Variables - accepts custom property records", () => {
  const vars: Variables = {
    "--primary": "blue",
    "--spacing": 8,
  };
  assertEquals(vars["--primary"], "blue");
  assertEquals(vars["--spacing"], 8);
});

Deno.test("Shape - accepts null leaf values", () => {
  const shape: Shape = { a: null, b: { c: null } };
  assertEquals(shape.a, null);
});

Deno.test("MapShape - transforms shape leaves", () => {
  type TestShape = { a: null; b: { c: null } };
  type Mapped = MapShape<TestShape, string>;
  const mapped: Mapped = { a: "test", b: { c: "nested" } };
  assertEquals(mapped.a, "test");
  assertEquals(mapped.b.c, "nested");
});

Deno.test("VarsValues - accepts CSS values at leaves", () => {
  type TestShape = { color: null; size: null };
  const values: VarsValues<TestShape> = { color: "red", size: 16 };
  assertEquals(values.color, "red");
  assertEquals(values.size, 16);
});

Deno.test("Contract - includes hash symbol branding", () => {
  const theme = contract({ a: null });
  type ThemeType = Contract<{ a: null }>;
  const typed: ThemeType = theme;
  assertEquals(typeof typed.a, "string");
});
