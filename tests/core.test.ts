import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import * as core from "../core.ts";

// Helper to reset config between tests
function resetConfig() {
  core.setClassNameConfig({});
}

// isCSSRef tests

Deno.test("isCSSRef returns true for StyleRef", () => {
  const ref = core.style({ color: "red" });
  assertEquals(core.isCSSRef(ref), true);
});

Deno.test("isCSSRef returns false for null", () => {
  assertEquals(core.isCSSRef(null), false);
});

Deno.test("isCSSRef returns false for non-object", () => {
  assertEquals(core.isCSSRef("string"), false);
  assertEquals(core.isCSSRef(123), false);
  assertEquals(core.isCSSRef(undefined), false);
});

Deno.test("isCSSRef returns false for plain object", () => {
  assertEquals(core.isCSSRef({ color: "red" }), false);
});

// StyleRef tests

Deno.test("StyleRef toString returns className", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  assertEquals(typeof ref.toString(), "string");
  assertEquals(ref.toString().length > 0, true);
});

Deno.test("StyleRef getName returns className", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  assertEquals(ref.getName(), ref.toString());
});

Deno.test("StyleRef getRules returns rules array", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  const rules = ref.getRules();
  assertEquals(Array.isArray(rules), true);
  assertEquals(rules.length > 0, true);
  assertEquals(rules[0].type, "style");
});

Deno.test("StyleRef render returns CSS string", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  const css = ref.render();
  assertEquals(css.includes("color: red"), true);
  assertEquals(css.includes(ref.getName()), true);
});

Deno.test("StyleRef render with minify option", () => {
  resetConfig();
  const ref = core.style({ color: "red", padding: 10 });
  const css = ref.render({ indent: "", newline: "" });
  assertEquals(css.includes("\n"), false);
});

// GlobalStyleRef tests

Deno.test("GlobalStyleRef toString returns selector", () => {
  const ref = core.globalStyle("body", { margin: 0 });
  assertEquals(ref.toString(), "body");
});

Deno.test("GlobalStyleRef getName returns selector", () => {
  const ref = core.globalStyle("html", { fontSize: 16 });
  assertEquals(ref.getName(), "html");
});

Deno.test("GlobalStyleRef getRules returns rules", () => {
  const ref = core.globalStyle("body", { margin: 0 });
  const rules = ref.getRules();
  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "style");
});

Deno.test("globalStyle with empty properties creates no rules", () => {
  const ref = core.globalStyle("body", {});
  assertEquals(ref.getRules().length, 0);
});

Deno.test("globalStyle handles @media", () => {
  const ref = core.globalStyle("body", {
    margin: 0,
    "@media": {
      "(min-width: 768px)": { padding: 20 },
    },
  });
  const rules = ref.getRules();
  assertEquals(rules.length, 2);
  assertEquals(rules[0].type, "style");
  assertEquals(rules[1].type, "media");
});

Deno.test("globalStyle handles @media with empty nested properties", () => {
  const ref = core.globalStyle("body", {
    margin: 0,
    "@media": {
      "(min-width: 768px)": {},
    },
  });
  const rules = ref.getRules();
  assertEquals(rules.length, 1); // Only base rule, media has no properties
});

Deno.test("globalStyle handles @media with nested vars", () => {
  const ref = core.globalStyle("body", {
    "@media": {
      "(min-width: 768px)": { padding: 10, vars: { spacing: "20px" } },
    },
  });
  const rules = ref.getRules();
  assertEquals(rules.length, 1); // media rule only (no base properties)
  assertEquals(rules[0].type, "media");
});

Deno.test("globalStyle handles vars", () => {
  const ref = core.globalStyle(":root", {
    vars: { primaryColor: "blue" },
  });
  const css = ref.render();
  assertEquals(css.includes("--primaryColor: blue"), true);
});

Deno.test("globalStyle handles array input", () => {
  const ref = core.globalStyle("body", [{ color: "red" }, { padding: 10 }]);
  const css = ref.render();
  assertEquals(css.includes("color: red"), true);
  assertEquals(css.includes("padding: 10px"), true);
});

// KeyframesRef tests

Deno.test("KeyframesRef toString returns animation name", () => {
  resetConfig();
  const ref = core.keyframes({ "0%": { opacity: 0 }, "100%": { opacity: 1 } });
  assertEquals(typeof ref.toString(), "string");
  assertEquals(ref.toString().length > 0, true);
});

Deno.test("KeyframesRef getName returns animation name", () => {
  const ref = core.keyframes({ "0%": { opacity: 0 } });
  assertEquals(ref.getName(), ref.toString());
});

Deno.test("KeyframesRef getRules returns keyframes rule", () => {
  const ref = core.keyframes({ "0%": { opacity: 0 }, "100%": { opacity: 1 } });
  const rules = ref.getRules();
  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "keyframes");
});

Deno.test("keyframes with debugName includes name in output", () => {
  const ref = core.keyframes({ "0%": { opacity: 0 } }, "fadeIn");
  assertEquals(ref.getName().startsWith("fadeIn_"), true);
});

Deno.test("keyframes handles array style input", () => {
  const ref = core.keyframes({
    "0%": [{ opacity: 0 }, { transform: "scale(0)" }],
    "100%": { opacity: 1 },
  });
  const css = ref.render();
  assertEquals(css.includes("opacity: 0"), true);
  assertEquals(css.includes("transform: scale(0)"), true);
});

// FontFaceRef tests

Deno.test("FontFaceRef toString returns font family", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")' }, "MyFont");
  assertEquals(ref.toString(), "MyFont");
});

Deno.test("FontFaceRef getName returns font family", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")' }, "TestFont");
  assertEquals(ref.getName(), "TestFont");
});

Deno.test("FontFaceRef getRules returns font-face rule", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")' });
  const rules = ref.getRules();
  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "font-face");
});

Deno.test("fontFace uses fontFamily option", () => {
  const ref = core.fontFace({
    src: 'url("font.woff2")',
    fontFamily: "CustomFont",
  });
  assertEquals(ref.getName(), "CustomFont");
});

Deno.test("fontFace uses debugName when no fontFamily", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")' }, "DebugFont");
  assertEquals(ref.getName(), "DebugFont");
});

Deno.test("fontFace generates hash when no names provided", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")' });
  assertEquals(ref.getName().length > 0, true);
});

Deno.test("fontFace handles array src", () => {
  const ref = core.fontFace({
    src: ['url("font.woff2")', 'url("font.woff")'],
  });
  const css = ref.render();
  assertEquals(css.includes('url("font.woff2"), url("font.woff")'), true);
});

Deno.test("fontFace handles fontWeight string", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")', fontWeight: "bold" });
  const css = ref.render();
  assertEquals(css.includes("font-weight: bold"), true);
});

Deno.test("fontFace handles fontWeight number", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")', fontWeight: 700 });
  const css = ref.render();
  assertEquals(css.includes("font-weight: 700"), true);
});

Deno.test("fontFace handles fontWeight array (range)", () => {
  const ref = core.fontFace({
    src: 'url("font.woff2")',
    fontWeight: [400, 700],
  });
  const css = ref.render();
  assertEquals(css.includes("font-weight: 400 700"), true);
});

Deno.test("fontFace handles fontStyle", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")', fontStyle: "italic" });
  const css = ref.render();
  assertEquals(css.includes("font-style: italic"), true);
});

Deno.test("fontFace handles fontDisplay", () => {
  const ref = core.fontFace({ src: 'url("font.woff2")', fontDisplay: "swap" });
  const css = ref.render();
  assertEquals(css.includes("font-display: swap"), true);
});

Deno.test("fontFace handles fontStretch", () => {
  const ref = core.fontFace({
    src: 'url("font.woff2")',
    fontStretch: "condensed",
  });
  const css = ref.render();
  assertEquals(css.includes("font-stretch: condensed"), true);
});

Deno.test("fontFace handles unicodeRange", () => {
  const ref = core.fontFace({
    src: 'url("font.woff2")',
    unicodeRange: "U+0000-00FF",
  });
  const css = ref.render();
  assertEquals(css.includes("unicode-range: U+0000-00FF"), true);
});

// LayerRef tests

Deno.test("LayerRef toString returns layer name", () => {
  resetConfig();
  const styleRef = core.style({ color: "red" });
  const ref = core.layer("components", [styleRef]);
  assertEquals(ref.toString(), "components");
});

Deno.test("LayerRef getName returns layer name", () => {
  const styleRef = core.style({ color: "red" });
  const ref = core.layer("utilities", [styleRef]);
  assertEquals(ref.getName(), "utilities");
});

Deno.test("LayerRef getRules returns layer rule containing nested rules", () => {
  resetConfig();
  const styleRef = core.style({ color: "red" });
  const ref = core.layer("base", [styleRef]);
  const rules = ref.getRules();
  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "layer");
});

Deno.test("layer combines multiple refs", () => {
  resetConfig();
  const ref1 = core.style({ color: "red" });
  const ref2 = core.style({ padding: 10 });
  const layerRef = core.layer("test", [ref1, ref2]);
  const css = layerRef.render();
  assertEquals(css.includes("@layer test"), true);
  assertEquals(css.includes("color: red"), true);
  assertEquals(css.includes("padding: 10px"), true);
});

Deno.test("layerOrder creates layer statement", () => {
  resetConfig();
  const layer1 = core.layer("reset", []);
  const layer2 = core.layer("base", []);
  const layer3 = core.layer("components", []);
  const stmt = core.layerOrder([layer1, layer2, layer3]);
  assertEquals(stmt.type, "layer-statement");
  assertEquals(stmt.names, ["reset", "base", "components"]);
});

// VarRef tests

Deno.test("VarRef toString returns var() reference", () => {
  const ref = core.createVar("testVar");
  assertEquals(ref.toString().startsWith("var(--testVar-"), true);
});

Deno.test("VarRef getName returns variable name", () => {
  const ref = core.createVar("myVar");
  assertEquals(ref.getName().startsWith("--myVar-"), true);
});

Deno.test("VarRef getRules returns empty array", () => {
  const ref = core.createVar();
  assertEquals(ref.getRules(), []);
});

Deno.test("createVar without debugName generates random name", () => {
  const ref1 = core.createVar();
  const ref2 = core.createVar();
  assertNotEquals(ref1.getName(), ref2.getName());
});

// VarsRef tests

Deno.test("VarsRef toString returns className", () => {
  resetConfig();
  const contract = core.createVars({ primary: null });
  const ref = core.vars(contract, { primary: "blue" });
  assertEquals(typeof ref.toString(), "string");
});

Deno.test("VarsRef getName returns className", () => {
  resetConfig();
  const contract = core.createVars({ primary: null });
  const ref = core.vars(contract, { primary: "red" } as never);
  assertEquals(ref.getName(), ref.toString());
});

Deno.test("VarsRef getRules returns style rule with var assignments", () => {
  resetConfig();
  const contract = core.createVars({ primary: null });
  const ref = core.vars(contract, { primary: "green" } as never);
  const rules = ref.getRules();
  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "style");
});

// createVars tests

Deno.test("createVars creates var() references for flat object", () => {
  const contract = core.createVars({
    primary: null as unknown as string,
    secondary: null as unknown as string,
  });
  assertEquals(contract.primary, "var(--primary)");
  assertEquals(contract.secondary, "var(--secondary)");
});

Deno.test("createVars creates var() references for nested object", () => {
  const contract = core.createVars({
    colors: {
      primary: null as unknown as string,
      secondary: null as unknown as string,
    },
  });
  assertEquals(contract.colors.primary, "var(--colors-primary)");
  assertEquals(contract.colors.secondary, "var(--colors-secondary)");
});

Deno.test("createVars handles string values as leaves", () => {
  const contract = core.createVars({
    color: "initial",
  });
  assertEquals(contract.color, "var(--color)");
});

Deno.test("createVars handles deeply nested objects", () => {
  const contract = core.createVars({
    theme: {
      colors: {
        brand: {
          primary: null as unknown as string,
        },
      },
    },
  });
  assertEquals(
    contract.theme.colors.brand.primary,
    "var(--theme-colors-brand-primary)",
  );
});

// vars tests

Deno.test("vars creates VarsRef with className", () => {
  resetConfig();
  const contract = core.createVars({ color: null as unknown as string });
  const ref = core.vars(contract, { color: "#fff" });
  assertEquals(typeof ref.getName(), "string");
});

Deno.test("vars with debugName includes name in className", () => {
  core.setClassNameConfig({ debug: true });
  const contract = core.createVars({ color: null as unknown as string });
  const ref = core.vars(contract, { color: "#000" }, "myTheme");
  assertEquals(ref.getName().includes("myTheme"), true);
  resetConfig();
});

Deno.test("vars generates correct CSS", () => {
  resetConfig();
  const contract = core.createVars({
    primary: null as unknown as string,
    secondary: null as unknown as string,
  });
  const ref = core.vars(contract, { primary: "red", secondary: "blue" });
  const css = ref.render();
  assertEquals(css.includes("--primary: red"), true);
  assertEquals(css.includes("--secondary: blue"), true);
});

Deno.test("vars handles nested contract values", () => {
  resetConfig();
  const contract = core.createVars({
    colors: { primary: null as unknown as string },
  });
  const ref = core.vars(contract, { colors: { primary: "purple" } });
  const css = ref.render();
  assertEquals(css.includes("--colors-primary: purple"), true);
});

// assignInlineVars tests

Deno.test("assignInlineVars returns plain object", () => {
  const contract = core.createVars({ color: null as unknown as string });
  const result = core.assignInlineVars(contract, { color: "red" });
  assertEquals(typeof result, "object");
  assertEquals(result["--color"], "red");
});

Deno.test("assignInlineVars handles nested contracts", () => {
  const contract = core.createVars({
    colors: { primary: null as unknown as string },
  });
  const result = core.assignInlineVars(contract, {
    colors: { primary: "blue" },
  });
  assertEquals(result["--colors-primary"], "blue");
});

// RecipeRef tests

Deno.test("RecipeRef toString returns base + defaults", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: {
        small: { fontSize: 12 },
        large: { fontSize: 24 },
      },
    },
    defaultVariants: { size: "small" },
  });
  const classes = ref.toString();
  assertEquals(classes.includes(ref.getName()), true);
});

Deno.test("RecipeRef getName returns base className", () => {
  resetConfig();
  const ref = core.recipe({ base: { color: "red" } });
  assertEquals(typeof ref.getName(), "string");
});

Deno.test("RecipeRef getRules returns all rules", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: { small: { fontSize: 12 }, large: { fontSize: 24 } },
    },
  });
  const rules = ref.getRules();
  assertEquals(rules.length, 3); // base + 2 variants
});

Deno.test("RecipeRef with() selects variants", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: { small: { fontSize: 12 }, large: { fontSize: 24 } },
      color: { red: { color: "red" }, blue: { color: "blue" } },
    },
  });
  const classes = ref.with({ size: "large", color: "blue" });
  assertEquals(classes.split(" ").length, 3); // base + size + color
});

Deno.test("RecipeRef with() applies defaults when not overridden", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: { small: { fontSize: 12 }, large: { fontSize: 24 } },
    },
    defaultVariants: { size: "small" },
  });
  const withDefault = ref.with();
  const withOverride = ref.with({ size: "large" });
  assertNotEquals(withDefault, withOverride);
});

Deno.test("RecipeRef with() handles compound variants", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: { small: { fontSize: 12 }, large: { fontSize: 24 } },
      color: { red: { color: "red" }, blue: { color: "blue" } },
    },
    compoundVariants: [
      {
        variants: { size: "large", color: "red" },
        style: { fontWeight: "bold" },
      },
    ],
  });
  const withCompound = ref.with({ size: "large", color: "red" });
  const withoutCompound = ref.with({ size: "small", color: "red" });
  // Compound match should have extra class
  assertEquals(
    withCompound.split(" ").length,
    withoutCompound.split(" ").length + 1,
  );
});

Deno.test("RecipeRef with() handles undefined variant option", () => {
  resetConfig();
  const ref = core.recipe({
    base: { padding: 10 },
    variants: {
      size: { small: { fontSize: 12 } },
    },
  });
  const classes = ref.with({ size: undefined });
  assertEquals(classes.split(" ").length, 1); // Just base
});

Deno.test("recipe without base creates empty base className", () => {
  resetConfig();
  const ref = core.recipe({
    variants: {
      size: { small: { fontSize: 12 } },
    },
  });
  assertEquals(ref.getName(), "");
});

Deno.test("recipe with debugName includes name in classes", () => {
  core.setClassNameConfig({ debug: true });
  const ref = core.recipe(
    {
      base: { padding: 10 },
      variants: { size: { small: { fontSize: 12 } } },
      compoundVariants: [
        { variants: { size: "small" }, style: { color: "red" } },
      ],
    },
    "button",
  );
  assertEquals(ref.getName().includes("button_base"), true);
  resetConfig();
});

// hashStyle tests

Deno.test("hashStyle returns consistent hash for same input", () => {
  const hash1 = core.hashStyle({ color: "red" });
  const hash2 = core.hashStyle({ color: "red" });
  assertEquals(hash1, hash2);
});

Deno.test("hashStyle returns different hash for different input", () => {
  const hash1 = core.hashStyle({ color: "red" });
  const hash2 = core.hashStyle({ color: "blue" });
  assertNotEquals(hash1, hash2);
});

Deno.test("hashStyle returns 7 character string", () => {
  const hash = core.hashStyle({ padding: 10 });
  assertEquals(hash.length, 7);
});

// generateClassName tests

Deno.test("generateClassName without config returns hash only", () => {
  resetConfig();
  const name = core.generateClassName({ color: "red" });
  assertEquals(name.length, 7);
});

Deno.test("generateClassName with prefix adds prefix", () => {
  core.setClassNameConfig({ prefix: "css_" });
  const name = core.generateClassName({ color: "red" });
  assertEquals(name.startsWith("css_"), true);
  resetConfig();
});

Deno.test("generateClassName with debug and name includes both", () => {
  core.setClassNameConfig({ debug: true });
  const name = core.generateClassName({ color: "red" }, "button");
  assertEquals(name.includes("button_"), true);
  resetConfig();
});

Deno.test("generateClassName with debug but no name returns hash only", () => {
  core.setClassNameConfig({ debug: true });
  const name = core.generateClassName({ color: "red" });
  assertEquals(name.includes("_"), false);
  resetConfig();
});

Deno.test("generateClassName with custom hashFn uses it", () => {
  core.setClassNameConfig({ hashFn: () => "custom" });
  const name = core.generateClassName({ color: "red" });
  assertEquals(name, "custom");
  resetConfig();
});

Deno.test("generateClassName with all options", () => {
  core.setClassNameConfig({ prefix: "x_", debug: true });
  const name = core.generateClassName({ color: "red" }, "test");
  assertEquals(name.startsWith("x_test_"), true);
  resetConfig();
});

// setClassNameConfig / getClassNameConfig tests

Deno.test("setClassNameConfig updates config", () => {
  core.setClassNameConfig({ prefix: "myprefix_" });
  const config = core.getClassNameConfig();
  assertEquals(config.prefix, "myprefix_");
  resetConfig();
});

Deno.test("getClassNameConfig returns current config", () => {
  core.setClassNameConfig({ debug: true });
  assertEquals(core.getClassNameConfig().debug, true);
  resetConfig();
});

// style tests

Deno.test("style creates core.StyleRef", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  assertEquals(ref instanceof core.StyleRef, true);
});

Deno.test("style with debugName includes name when debug enabled", () => {
  core.setClassNameConfig({ debug: true });
  const ref = core.style({ color: "red" }, "myButton");
  assertEquals(ref.getName().includes("myButton"), true);
  resetConfig();
});

Deno.test("style compiles nested selectors", () => {
  resetConfig();
  const ref = core.style({
    color: "blue",
    selectors: { "&:hover": { color: "red" } },
  });
  const css = ref.render();
  assertEquals(css.includes(":hover"), true);
});

Deno.test("style compiles @media", () => {
  resetConfig();
  const ref = core.style({
    padding: 10,
    "@media": { "(min-width: 768px)": { padding: 20 } },
  });
  const css = ref.render();
  assertEquals(css.includes("@media (min-width: 768px)"), true);
});

// styleVariants tests

Deno.test("styleVariants creates record of StyleRefs", () => {
  resetConfig();
  const variants = core.styleVariants({
    small: { fontSize: 12 },
    large: { fontSize: 24 },
  });
  assertEquals(variants.small instanceof core.StyleRef, true);
  assertEquals(variants.large instanceof core.StyleRef, true);
});

Deno.test("styleVariants with debugName includes variant key", () => {
  core.setClassNameConfig({ debug: true });
  const variants = core.styleVariants(
    {
      small: { fontSize: 12 },
      large: { fontSize: 24 },
    },
    "size",
  );
  assertEquals(variants.small.getName().includes("size_small"), true);
  assertEquals(variants.large.getName().includes("size_large"), true);
  resetConfig();
});

Deno.test("styleVariants without debugName still works", () => {
  resetConfig();
  const variants = core.styleVariants({
    a: { color: "red" },
    b: { color: "blue" },
  });
  assertEquals(typeof variants.a.getName(), "string");
  assertEquals(typeof variants.b.getName(), "string");
});

// render tests

Deno.test("render combines multiple refs", () => {
  resetConfig();
  const ref1 = core.style({ color: "red" });
  const ref2 = core.style({ padding: 10 });
  const css = core.render([ref1, ref2]);
  assertEquals(css.includes("color: red"), true);
  assertEquals(css.includes("padding: 10px"), true);
});

Deno.test("render deduplicates by object identity", () => {
  resetConfig();
  const ref = core.style({ color: "red" });
  const css = core.render([ref, ref, ref]);
  // Should only appear once
  const matches = css.match(/color: red/g);
  assertEquals(matches?.length, 1);
});

Deno.test("render handles empty array", () => {
  const css = core.render([]);
  assertEquals(css, "");
});

Deno.test("render with minify option", () => {
  resetConfig();
  const ref = core.style({ color: "red", padding: 10 });
  const css = core.render([ref], { indent: "", newline: "" });
  assertEquals(css.includes("\n"), false);
});

Deno.test("render deduplicates nested rules from layer", () => {
  resetConfig();
  const styleRef = core.style({ color: "red" });
  const layerRef = core.layer("test", [styleRef]);
  // Include both - layer contains the style rules
  const css = core.render([styleRef, layerRef]);
  // Style appears both standalone and in layer
  const matches = css.match(/color: red/g);
  assertEquals(matches?.length, 2);
});

// Edge cases and integration tests

Deno.test("style with array input merges styles", () => {
  resetConfig();
  const ref = core.style([{ color: "red" }, { padding: 10 }]);
  const css = ref.render();
  assertEquals(css.includes("color: red"), true);
  assertEquals(css.includes("padding: 10px"), true);
});

Deno.test("globalStyle renders correct CSS", () => {
  const ref = core.globalStyle("body", { margin: 0, padding: 0 });
  const css = ref.render();
  assertEquals(css.includes("body {"), true);
  assertEquals(css.includes("margin: 0"), true);
  assertEquals(css.includes("padding: 0"), true);
});

Deno.test("keyframes renders correct CSS", () => {
  const ref = core.keyframes({
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  });
  const css = ref.render();
  assertEquals(css.includes("@keyframes"), true);
  assertEquals(css.includes("0%"), true);
  assertEquals(css.includes("100%"), true);
});

Deno.test("full integration: recipe with all options", () => {
  resetConfig();
  const buttonRecipe = core.recipe({
    base: { padding: 10, borderRadius: 4 },
    variants: {
      size: {
        small: { padding: 5, fontSize: 12 },
        medium: { padding: 10, fontSize: 14 },
        large: { padding: 15, fontSize: 18 },
      },
      variant: {
        primary: { backgroundColor: "blue", color: "white" },
        secondary: { backgroundColor: "gray", color: "black" },
      },
    },
    compoundVariants: [
      {
        variants: { size: "large", variant: "primary" },
        style: { boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
      },
    ],
    defaultVariants: {
      size: "medium",
      variant: "primary",
    },
  });

  // Test default
  const defaultClasses = buttonRecipe.toString();
  assertEquals(defaultClasses.split(" ").length >= 3, true);

  // Test with selection
  const largeSecondary = buttonRecipe.with({
    size: "large",
    variant: "secondary",
  });
  assertEquals(largeSecondary.split(" ").length, 3); // base + size + variant (no compound)

  // Test compound
  const largePrimary = buttonRecipe.with({ size: "large", variant: "primary" });
  assertEquals(largePrimary.split(" ").length, 4); // base + size + variant + compound

  // Test CSS generation
  const css = buttonRecipe.render();
  assertEquals(css.includes("padding"), true);
  assertEquals(css.includes("background-color"), true);
});

// Transform tests

Deno.test("pixelify adds px to numbers for dimensional properties", () => {
  assertEquals(core.pixelify("padding", 10), "10px");
  assertEquals(core.pixelify("margin", 20), "20px");
  assertEquals(core.pixelify("width", 100), "100px");
  assertEquals(core.pixelify("fontSize", 16), "16px");
});

Deno.test("pixelify does not add px to zero", () => {
  assertEquals(core.pixelify("padding", 0), "0");
  assertEquals(core.pixelify("margin", 0), "0");
});

Deno.test("pixelify does not add px to unitless properties", () => {
  assertEquals(core.pixelify("opacity", 0.5), "0.5");
  assertEquals(core.pixelify("zIndex", 10), "10");
  assertEquals(core.pixelify("fontWeight", 700), "700");
  assertEquals(core.pixelify("flexGrow", 1), "1");
  assertEquals(core.pixelify("lineHeight", 1.5), "1.5");
});

Deno.test("pixelify passes through strings unchanged", () => {
  assertEquals(core.pixelify("padding", "10px"), "10px");
  assertEquals(core.pixelify("color", "red"), "red");
  assertEquals(core.pixelify("background", "url(image.png)"), "url(image.png)");
});

Deno.test("transformProperties converts full style object", () => {
  const result = core.transformProperties({
    backgroundColor: "blue",
    padding: 10,
    opacity: 0.5,
  });

  assertEquals(result.length, 3);
  assertEquals(result[0], { name: "background-color", value: "blue" });
  assertEquals(result[1], { name: "padding", value: "10px" });
  assertEquals(result[2], { name: "opacity", value: "0.5" });
});

Deno.test("transformProperties filters out vars and selectors", () => {
  const result = core.transformProperties({
    color: "red",
    vars: { primaryColor: "blue" },
    selectors: { "&:hover": { color: "green" } },
  } as Record<string, unknown>);

  assertEquals(result.length, 1);
  assertEquals(result[0], { name: "color", value: "red" });
});

Deno.test("transformProperties filters out @-rules", () => {
  const result = core.transformProperties({
    color: "red",
    "@media": { "(min-width: 768px)": { color: "blue" } },
  } as Record<string, unknown>);

  assertEquals(result.length, 1);
  assertEquals(result[0], { name: "color", value: "red" });
});

// Compile tests

Deno.test("compileStyle creates simple StyleRule", () => {
  const rules = core.compileStyle("button", {
    color: "blue",
    padding: 10,
  });

  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "style");

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  color: blue;
  padding: 10px;
}`,
  );
});

Deno.test("compileStyle handles CSS variables in vars", () => {
  const rules = core.compileStyle("button", {
    vars: { primaryColor: "#007bff", spacing: "8px" },
    color: "red",
  });

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  --primaryColor: #007bff;
  --spacing: 8px;
  color: red;
}`,
  );
});

Deno.test("compileStyle handles nested selectors with &", () => {
  const rules = core.compileStyle("button", {
    color: "blue",
    selectors: {
      "&:hover": { color: "darkblue" },
      "&:active": { color: "navy" },
    },
  });

  assertEquals(rules.length, 3);

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  color: blue;
}
.button:hover {
  color: darkblue;
}
.button:active {
  color: navy;
}`,
  );
});

Deno.test("compileStyle handles complex nested selectors", () => {
  const rules = core.compileStyle("card", {
    padding: 16,
    selectors: {
      "& .title": { fontSize: 20 },
      "&:hover .icon": { opacity: 1 },
    },
  });

  const css = core.render([new core.StyleRef("card", rules)]);
  assertEquals(
    css,
    `.card {
  padding: 16px;
}
.card .title {
  font-size: 20px;
}
.card:hover .icon {
  opacity: 1;
}`,
  );
});

Deno.test("compileStyle handles media queries", () => {
  const rules = core.compileStyle("button", {
    padding: 8,
    "@media": {
      "(min-width: 768px)": { padding: 16 },
    },
  });

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  padding: 8px;
}
@media (min-width: 768px) {
  .button {
    padding: 16px;
  }
}`,
  );
});

Deno.test("compileStyle handles supports queries", () => {
  const rules = core.compileStyle("grid", {
    display: "block",
    "@supports": {
      "(display: grid)": { display: "grid" },
    },
  });

  const css = core.render([new core.StyleRef("grid", rules)]);
  assertEquals(
    css,
    `.grid {
  display: block;
}
@supports (display: grid) {
  .grid {
    display: grid;
  }
}`,
  );
});

Deno.test("compileStyle handles container queries", () => {
  const rules = core.compileStyle("card", {
    padding: 8,
    "@container": {
      "(min-width: 300px)": { padding: 16 },
    },
  });

  const css = core.render([new core.StyleRef("card", rules)]);
  assertEquals(
    css,
    `.card {
  padding: 8px;
}
@container (min-width: 300px) {
  .card {
    padding: 16px;
  }
}`,
  );
});

Deno.test("compileStyle handles layers", () => {
  const rules = core.compileStyle("button", {
    color: "blue",
    "@layer": {
      utilities: { display: "flex" },
    },
  });

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  color: blue;
}
@layer utilities {
  .button {
    display: flex;
  }
}`,
  );
});

Deno.test("compileStyle handles multiple at-rules", () => {
  const rules = core.compileStyle("button", {
    padding: 8,
    "@media": {
      "(min-width: 768px)": { padding: 16 },
      "(min-width: 1024px)": { padding: 24 },
    },
  });

  assertEquals(rules.length, 3);
  assertEquals(rules[0].type, "style");
  assertEquals(rules[1].type, "media");
  assertEquals(rules[2].type, "media");
});

Deno.test("mergeStyles merges simple properties (later wins)", () => {
  const result = core.mergeStyles(
    { color: "red", padding: 10 },
    { color: "blue", margin: 20 },
  );

  assertEquals(result.color, "blue");
  assertEquals(result.padding, 10);
  assertEquals(result.margin, 20);
});

Deno.test("mergeStyles deep merges vars", () => {
  const result = core.mergeStyles(
    { vars: { primary: "red", secondary: "green" } },
    { vars: { primary: "blue" } },
  );

  assertEquals(result.vars, { primary: "blue", secondary: "green" });
});

Deno.test("mergeStyles deep merges selectors", () => {
  const result = core.mergeStyles(
    { selectors: { "&:hover": { color: "red" } } },
    { selectors: { "&:active": { color: "blue" } } },
  );

  assertEquals(result.selectors, {
    "&:hover": { color: "red" },
    "&:active": { color: "blue" },
  });
});

Deno.test("mergeStyles deep merges @media", () => {
  const result = core.mergeStyles(
    { "@media": { "(min-width: 768px)": { padding: 16 } } },
    { "@media": { "(min-width: 1024px)": { padding: 24 } } },
  );

  assertEquals(result["@media"], {
    "(min-width: 768px)": { padding: 16 },
    "(min-width: 1024px)": { padding: 24 },
  });
});

Deno.test("compileStyle handles array input (composition)", () => {
  const base = { color: "red", padding: 8 };
  const override = { color: "blue" };

  const rules = core.compileStyle("button", [base, override]);
  const css = core.render([new core.StyleRef("button", rules)]);

  assertEquals(
    css,
    `.button {
  color: blue;
  padding: 8px;
}`,
  );
});

Deno.test("compileStyle handles nested arrays", () => {
  const a = { color: "red" };
  const b = { padding: 8 };
  const c = { margin: 16 };

  const rules = core.compileStyle("button", [[a, b], c]);
  const css = core.render([new core.StyleRef("button", rules)]);

  assertEquals(
    css,
    `.button {
  color: red;
  padding: 8px;
  margin: 16px;
}`,
  );
});

Deno.test("validateSelector throws for selectors without &", () => {
  assertThrows(
    () => core.validateSelector(".other"),
    Error,
    "must reference the element with &",
  );
});

Deno.test("compileStyle throws for invalid nested selector", () => {
  assertThrows(
    () =>
      core.compileStyle("button", {
        selectors: { ".invalid": { color: "red" } },
      }),
    Error,
    "must reference the element with &",
  );
});

Deno.test("compileStyle creates no rules for empty style", () => {
  const rules = core.compileStyle("empty", {});
  assertEquals(rules.length, 0);
});

Deno.test("full example from phase-2 spec", () => {
  const rules = core.compileStyle("button", {
    padding: 8,
    backgroundColor: "blue",
    vars: { primaryColor: "#007bff" },
    selectors: {
      "&:hover": { backgroundColor: "darkblue" },
    },
    "@media": {
      "(min-width: 768px)": { padding: 16 },
    },
  });

  const css = core.render([new core.StyleRef("button", rules)]);
  assertEquals(
    css,
    `.button {
  --primaryColor: #007bff;
  padding: 8px;
  background-color: blue;
}
.button:hover {
  background-color: darkblue;
}
@media (min-width: 768px) {
  .button {
    padding: 16px;
  }
}`,
  );
});
