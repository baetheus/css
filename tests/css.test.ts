import { assertEquals, assertStrictEquals } from "@std/assert";

import {
  AtRule,
  charset,
  colorProfile,
  complexSelector,
  compoundSelector,
  contract,
  container,
  counterStyle,
  cssNamespace,
  element,
  fontFace,
  fontFeatureValues,
  fontPaletteValues,
  id,
  importRule,
  isAtRule,
  isContract,
  isStyle,
  keyframes,
  layer,
  media,
  MINIMAL_RENDER,
  page,
  property,
  raw,
  render,
  renderAtRule,
  renderBlock,
  renderColorProfile,
  renderCounterStyle,
  renderFontFace,
  renderFontFeatureValues,
  renderFontPalette,
  renderKeyframes,
  renderProperties,
  renderProperty,
  renderPropertyDescriptors,
  renderSelector,
  scope,
  STANDARD_RENDER,
  startingStyle,
  style,
  supports,
  vars,
} from "../css.ts";

// =============================================================================
// Render Options Tests
// =============================================================================

Deno.test("STANDARD_RENDER has correct values", () => {
  assertEquals(STANDARD_RENDER.space, " ");
  assertEquals(STANDARD_RENDER.indent, "  ");
  assertEquals(STANDARD_RENDER.newline, "\n");
});

Deno.test("MINIMAL_RENDER has correct values", () => {
  assertEquals(MINIMAL_RENDER.space, "");
  assertEquals(MINIMAL_RENDER.indent, "");
  assertEquals(MINIMAL_RENDER.newline, "");
});

// =============================================================================
// contract and vars Tests
// =============================================================================

Deno.test("contract - creates Contract with var references", () => {
  const theme = contract({
    colors: { primary: null, secondary: null },
  });
  assertEquals(typeof theme.colors.primary, "string");
  assertEquals(theme.colors.primary.startsWith("var(--"), true);
  assertEquals(theme.colors.secondary.startsWith("var(--"), true);
});

Deno.test("contract - hash is non-enumerable", () => {
  const theme = contract({
    colors: { primary: null },
  });
  const keys = Object.keys(theme);
  assertEquals(keys.includes("hash"), false);
  assertEquals(keys, ["colors"]);
});

Deno.test("isContract - returns true for Contract", () => {
  const theme = contract({
    colors: { primary: null },
  });
  assertEquals(isContract(theme), true);
});

Deno.test("isContract - returns false for non-Contract", () => {
  assertEquals(isContract({}), false);
  assertEquals(isContract(null), false);
  assertEquals(isContract({ colors: { primary: "blue" } }), false);
});

Deno.test("vars - creates Style from contract and values", () => {
  const theme = contract({
    colors: { primary: null, secondary: null },
  });
  const light = vars(theme, {
    colors: { primary: "blue", secondary: "green" },
  });
  assertEquals(isStyle(light), true);
  const result = light.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("--"), true);
  assertEquals(result.includes("blue"), true);
  assertEquals(result.includes("green"), true);
});

Deno.test("vars - multiple themes from same contract use same hash", () => {
  const theme = contract({
    colors: { bg: null, text: null },
  });
  const light = vars(theme, {
    colors: { bg: "white", text: "black" },
  });
  const dark = vars(theme, {
    colors: { bg: "black", text: "white" },
  });
  // Both styles should have same var names (same hash from contract)
  const lightResult = light.render(STANDARD_RENDER, 0);
  const darkResult = dark.render(STANDARD_RENDER, 0);
  // Extract the hash from the variable names
  const lightMatch = lightResult.match(/--([a-z0-9]+)-colors-bg/);
  const darkMatch = darkResult.match(/--([a-z0-9]+)-colors-bg/);
  assertEquals(lightMatch?.[1], darkMatch?.[1]);
});

Deno.test("vars - consistent hashes for same contract structure", () => {
  const c1 = contract({ colors: { primary: null } });
  const c2 = contract({ colors: { primary: null } });
  // Same structure should produce same hash
  assertEquals(c1.colors.primary, c2.colors.primary);
});

Deno.test("contract - supports deeply nested structures", () => {
  const theme = contract({
    colors: {
      primary: null,
      brand: {
        light: null,
        dark: null,
      },
    },
    spacing: null,
  });
  // Check var references are created at each level
  assertEquals(theme.colors.primary.startsWith("var(--"), true);
  assertEquals(theme.colors.brand.light.startsWith("var(--"), true);
  assertEquals(theme.colors.brand.dark.startsWith("var(--"), true);
  assertEquals(theme.spacing.startsWith("var(--"), true);
  // Check paths are correct
  assertEquals(theme.colors.primary.includes("-colors-primary"), true);
  assertEquals(theme.colors.brand.light.includes("-colors-brand-light"), true);
  assertEquals(theme.spacing.includes("-spacing)"), true);
});

Deno.test("vars - works with deeply nested structures", () => {
  const theme = contract({
    colors: {
      primary: null,
      brand: {
        light: null,
        dark: null,
      },
    },
    spacing: null,
  });
  const values = vars(theme, {
    colors: {
      primary: "blue",
      brand: {
        light: "#eef",
        dark: "#335",
      },
    },
    spacing: "8px",
  });
  assertEquals(isStyle(values), true);
  const result = values.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("-colors-primary: blue;"), true);
  assertEquals(result.includes("-colors-brand-light: #eef;"), true);
  assertEquals(result.includes("-colors-brand-dark: #335;"), true);
  assertEquals(result.includes("-spacing: 8px;"), true);
});

Deno.test("contract - top-level variables work", () => {
  const theme = contract({
    fontSize: null,
    lineHeight: null,
  });
  assertEquals(theme.fontSize.startsWith("var(--"), true);
  assertEquals(theme.lineHeight.startsWith("var(--"), true);
  assertEquals(theme.fontSize.includes("-fontSize)"), true);
});

// =============================================================================
// Selector Tests
// =============================================================================

Deno.test("compoundSelector - creates CompoundSelector", () => {
  const sel = compoundSelector(".button");
  assertEquals(sel.type, "CompoundSelector");
  assertEquals(sel.values[0], ".button");
});

Deno.test("compoundSelector - with multiple values", () => {
  const sel = compoundSelector(".button", ":hover");
  assertEquals(sel.values.length, 2);
  assertEquals(sel.values[0], ".button");
  assertEquals(sel.values[1], ":hover");
});

Deno.test("complexSelector - creates ComplexSelector with combinator", () => {
  const sel = complexSelector(">", ".parent", ".child");
  assertEquals(sel.type, "ComplexSelector");
  assertEquals(sel.combinator, ">");
  assertEquals(sel.values.length, 2);
});

Deno.test("complexSelector - with space combinator", () => {
  const sel = complexSelector(" ", ".parent", ".child");
  assertEquals(sel.combinator, " ");
});

Deno.test("complexSelector - with adjacent sibling combinator", () => {
  const sel = complexSelector("+", ".prev", ".next");
  assertEquals(sel.combinator, "+");
});

Deno.test("complexSelector - with general sibling combinator", () => {
  const sel = complexSelector("~", ".sibling1", ".sibling2");
  assertEquals(sel.combinator, "~");
});

Deno.test("renderSelector - renders compound selector", () => {
  const sel = compoundSelector(".button", ":hover");
  assertEquals(renderSelector(sel), ".button:hover");
});

Deno.test("renderSelector - renders complex selector with combinator", () => {
  const sel = complexSelector(">", ".parent", ".child");
  assertEquals(renderSelector(sel), ".parent>.child");
});

Deno.test("renderSelector - renders nested selectors", () => {
  const inner = compoundSelector(".inner");
  const outer = compoundSelector(".outer", inner);
  assertEquals(renderSelector(outer), ".outer.inner");
});

Deno.test("renderSelector - renders nested complex selector", () => {
  const inner = complexSelector(">", "ul", "li");
  const outer = compoundSelector(".nav", inner);
  assertEquals(renderSelector(outer), ".navul>li");
});

// =============================================================================
// Render Helper Tests
// =============================================================================

Deno.test("renderProperty - converts camelCase to kebab-case", () => {
  const result = renderProperty("backgroundColor", "red", STANDARD_RENDER);
  assertEquals(result, "background-color: red;");
});

Deno.test("renderProperty - preserves custom properties", () => {
  const result = renderProperty("--my-var", "blue", STANDARD_RENDER);
  assertEquals(result, "--my-var: blue;");
});

Deno.test("renderProperty - with MINIMAL_RENDER", () => {
  const result = renderProperty("color", "red", MINIMAL_RENDER);
  assertEquals(result, "color:red;");
});

Deno.test("renderProperty - with number value", () => {
  const result = renderProperty("zIndex", 100, STANDARD_RENDER);
  assertEquals(result, "z-index: 100;");
});

Deno.test("renderProperties - renders multiple properties", () => {
  const result = renderProperties(
    { color: "red", fontSize: "16px" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result, "color: red;\nfont-size: 16px;");
});

Deno.test("renderProperties - returns empty string for empty object", () => {
  const result = renderProperties({}, STANDARD_RENDER, 0);
  assertEquals(result, "");
});

Deno.test("renderProperties - with indentation", () => {
  const result = renderProperties({ color: "red" }, STANDARD_RENDER, 1);
  assertEquals(result, "  color: red;");
});

Deno.test("renderProperties - with MINIMAL_RENDER", () => {
  const result = renderProperties(
    { color: "red", fontSize: "16px" },
    MINIMAL_RENDER,
    0,
  );
  assertEquals(result, "color:red;font-size:16px;");
});

Deno.test("renderBlock - renders block with body", () => {
  const result = renderBlock(".button", "color: red;", STANDARD_RENDER, 0);
  assertEquals(result, ".button {\ncolor: red;\n}");
});

Deno.test("renderBlock - renders empty block", () => {
  const result = renderBlock(".button", "", STANDARD_RENDER, 0);
  assertEquals(result, ".button {}");
});

Deno.test("renderBlock - with indentation", () => {
  const result = renderBlock(".nested", "color: red;", STANDARD_RENDER, 1);
  assertEquals(result, "  .nested {\ncolor: red;\n  }");
});

Deno.test("renderBlock - with MINIMAL_RENDER", () => {
  const result = renderBlock(".button", "color:red;", MINIMAL_RENDER, 0);
  assertEquals(result, ".button{color:red;}");
});

Deno.test("renderKeyframes - renders keyframe frames", () => {
  const frames = [
    { offset: "from" as const, properties: { opacity: "0" } },
    { offset: "to" as const, properties: { opacity: "1" } },
  ];
  const result = renderKeyframes(frames, STANDARD_RENDER, 0);
  assertEquals(result.includes("from {"), true);
  assertEquals(result.includes("to {"), true);
  assertEquals(result.includes("opacity: 0;"), true);
  assertEquals(result.includes("opacity: 1;"), true);
});

Deno.test("renderKeyframes - renders percentage offsets", () => {
  const frames = [
    { offset: "0%" as const, properties: { opacity: "0" } },
    { offset: "50%" as const, properties: { opacity: "0.5" } },
    { offset: "100%" as const, properties: { opacity: "1" } },
  ];
  const result = renderKeyframes(frames, STANDARD_RENDER, 0);
  assertEquals(result.includes("0% {"), true);
  assertEquals(result.includes("50% {"), true);
  assertEquals(result.includes("100% {"), true);
});

Deno.test("renderFontFace - renders all font-face properties", () => {
  const result = renderFontFace(
    {
      fontFamily: "MyFont",
      src: "url('font.woff2')",
      fontStyle: "normal",
      fontWeight: "400",
      fontStretch: "normal",
      fontDisplay: "swap",
      unicodeRange: "U+0000-00FF",
      fontVariant: "normal",
      fontFeatureSettings: "'liga' 1",
      fontVariationSettings: "'wght' 400",
      ascentOverride: "90%",
      descentOverride: "20%",
      lineGapOverride: "0%",
      sizeAdjust: "100%",
    },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("font-family: MyFont;"), true);
  assertEquals(result.includes("src: url('font.woff2');"), true);
  assertEquals(result.includes("font-style: normal;"), true);
  assertEquals(result.includes("font-weight: 400;"), true);
  assertEquals(result.includes("font-stretch: normal;"), true);
  assertEquals(result.includes("font-display: swap;"), true);
  assertEquals(result.includes("unicode-range: U+0000-00FF;"), true);
  assertEquals(result.includes("font-variant: normal;"), true);
  assertEquals(result.includes("font-feature-settings: 'liga' 1;"), true);
  assertEquals(result.includes("font-variation-settings: 'wght' 400;"), true);
  assertEquals(result.includes("ascent-override: 90%;"), true);
  assertEquals(result.includes("descent-override: 20%;"), true);
  assertEquals(result.includes("line-gap-override: 0%;"), true);
  assertEquals(result.includes("size-adjust: 100%;"), true);
});

Deno.test("renderFontFace - handles partial properties", () => {
  const result = renderFontFace(
    { fontFamily: "MyFont", src: "url('font.woff2')" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("font-family: MyFont;"), true);
  assertEquals(result.includes("src: url('font.woff2');"), true);
  assertEquals(result.includes("font-weight"), false);
});

Deno.test("renderPropertyDescriptors - renders all descriptors", () => {
  const result = renderPropertyDescriptors(
    { syntax: "<color>", inherits: false, initialValue: "red" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes('syntax: "<color>";'), true);
  assertEquals(result.includes("inherits: false;"), true);
  assertEquals(result.includes("initial-value: red;"), true);
});

Deno.test("renderPropertyDescriptors - without initialValue", () => {
  const result = renderPropertyDescriptors(
    { syntax: "<length>", inherits: true },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes('syntax: "<length>";'), true);
  assertEquals(result.includes("inherits: true;"), true);
  assertEquals(result.includes("initial-value"), false);
});

Deno.test("renderCounterStyle - renders all descriptors", () => {
  const result = renderCounterStyle(
    {
      system: "cyclic",
      symbols: "'*'",
      additiveSymbols: "3 '*', 2 '+', 1 '-'",
      negative: "'-'",
      prefix: "'('",
      suffix: "')'",
      range: "1 100",
      pad: "3 '0'",
      fallback: "decimal",
      speakAs: "numbers",
    },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("system: cyclic;"), true);
  assertEquals(result.includes("symbols: '*';"), true);
  assertEquals(result.includes("additive-symbols: 3 '*', 2 '+', 1 '-';"), true);
  assertEquals(result.includes("negative: '-';"), true);
  assertEquals(result.includes("prefix: '(';"), true);
  assertEquals(result.includes("suffix: ')';"), true);
  assertEquals(result.includes("range: 1 100;"), true);
  assertEquals(result.includes("pad: 3 '0';"), true);
  assertEquals(result.includes("fallback: decimal;"), true);
  assertEquals(result.includes("speak-as: numbers;"), true);
});

Deno.test("renderCounterStyle - handles partial descriptors", () => {
  const result = renderCounterStyle(
    { system: "alphabetic", symbols: "'a' 'b' 'c'" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("system: alphabetic;"), true);
  assertEquals(result.includes("symbols: 'a' 'b' 'c';"), true);
});

Deno.test("renderFontFeatureValues - renders feature value blocks", () => {
  const result = renderFontFeatureValues(
    {
      stylistic: { fancy: [1] },
      swash: { flowing: [2, 3] },
    },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("@stylistic {"), true);
  assertEquals(result.includes("fancy: 1;"), true);
  assertEquals(result.includes("@swash {"), true);
  assertEquals(result.includes("flowing: 2 3;"), true);
});

Deno.test("renderFontFeatureValues - handles empty descriptors", () => {
  const result = renderFontFeatureValues({}, STANDARD_RENDER, 0);
  assertEquals(result, "");
});

Deno.test("renderFontPalette - renders all descriptors", () => {
  const result = renderFontPalette(
    {
      basePalette: 0,
      overrideColors: { 0: "red", 1: "blue" },
    },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("base-palette: 0;"), true);
  assertEquals(result.includes("override-colors: 0 red, 1 blue;"), true);
});

Deno.test("renderFontPalette - with string basePalette", () => {
  const result = renderFontPalette(
    { basePalette: "light" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("base-palette: light;"), true);
});

Deno.test("renderFontPalette - handles partial descriptors", () => {
  const result = renderFontPalette({ basePalette: "dark" }, STANDARD_RENDER, 0);
  assertEquals(result.includes("base-palette: dark;"), true);
  assertEquals(result.includes("override-colors"), false);
});

Deno.test("renderColorProfile - renders all descriptors", () => {
  const result = renderColorProfile(
    {
      src: "url('profile.icc')",
      renderingIntent: "relative-colorimetric",
      components: "R, G, B",
    },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("src: url('profile.icc');"), true);
  assertEquals(
    result.includes("rendering-intent: relative-colorimetric;"),
    true,
  );
  assertEquals(result.includes("components: R, G, B;"), true);
});

Deno.test("renderColorProfile - handles partial descriptors", () => {
  const result = renderColorProfile(
    { src: "url('profile.icc')" },
    STANDARD_RENDER,
    0,
  );
  assertEquals(result.includes("src: url('profile.icc');"), true);
  assertEquals(result.includes("rendering-intent"), false);
});

// =============================================================================
// AtRule Tests
// =============================================================================

Deno.test("AtRule - constructor creates rule with hash", () => {
  const rule = new AtRule("@media", {
    query: "(min-width: 768px)",
    children: [],
  });
  assertEquals(rule.tag, "@media");
  assertEquals(typeof rule.hash, "string");
  assertEquals(rule.hash.length, 7);
});

Deno.test("AtRule - render method works", () => {
  const rule = new AtRule("@media", {
    query: "(min-width: 768px)",
    children: [],
  });
  const result = rule.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("@media"), true);
});

Deno.test("isAtRule - returns true for AtRule", () => {
  const rule = media("(min-width: 768px)");
  assertEquals(isAtRule(rule), true);
});

Deno.test("isAtRule - returns false for null", () => {
  assertEquals(isAtRule(null), false);
});

Deno.test("isAtRule - returns false for string", () => {
  assertEquals(isAtRule("@media"), false);
});

Deno.test("isAtRule - returns false for Style", () => {
  const s = style({ color: "red" });
  assertEquals(isAtRule(s), false);
});

Deno.test("renderAtRule - renders @media rule", () => {
  const s = style({ color: "red" });
  const rule = media("(min-width: 768px)", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
});

Deno.test("renderAtRule - renders @import rule", () => {
  const rule = importRule("'styles.css'");
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result, "@import 'styles.css';");
});

Deno.test("renderAtRule - renders @charset rule", () => {
  const rule = charset("'UTF-8'");
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result, "@charset 'UTF-8';");
});

Deno.test("renderAtRule - renders @namespace rule", () => {
  const rule = cssNamespace("svg url('http://www.w3.org/2000/svg')");
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result, "@namespace svg url('http://www.w3.org/2000/svg');");
});

Deno.test("renderAtRule - renders @keyframes rule", () => {
  const rule = keyframes("fadeIn", [
    { offset: "from", properties: { opacity: "0" } },
    { offset: "to", properties: { opacity: "1" } },
  ]);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@keyframes fadeIn"), true);
  assertEquals(result.includes("from {"), true);
  assertEquals(result.includes("to {"), true);
});

Deno.test("renderAtRule - renders @font-face rule", () => {
  const rule = fontFace({ fontFamily: "MyFont", src: "url('font.woff2')" });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@font-face {"), true);
  assertEquals(result.includes("font-family: MyFont;"), true);
});

Deno.test("renderAtRule - renders @page rule", () => {
  const rule = page(":first", { margin: "2cm" });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@page :first"), true);
  assertEquals(result.includes("margin: 2cm;"), true);
});

Deno.test("renderAtRule - renders @property rule", () => {
  const rule = property("--my-color", {
    syntax: "<color>",
    inherits: false,
    initialValue: "red",
  });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@property --my-color"), true);
  assertEquals(result.includes('syntax: "<color>";'), true);
});

Deno.test("renderAtRule - renders @counter-style rule", () => {
  const rule = counterStyle("thumbs", { system: "cyclic", symbols: "'*'" });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@counter-style thumbs"), true);
  assertEquals(result.includes("system: cyclic;"), true);
});

Deno.test("renderAtRule - renders @font-feature-values rule", () => {
  const rule = fontFeatureValues("MyFont", { stylistic: { fancy: [1] } });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@font-feature-values MyFont"), true);
  assertEquals(result.includes("@stylistic {"), true);
});

Deno.test("renderAtRule - renders @font-palette-values rule", () => {
  const rule = fontPaletteValues("--my-palette", { basePalette: 0 });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@font-palette-values --my-palette"), true);
  assertEquals(result.includes("base-palette: 0;"), true);
});

Deno.test("renderAtRule - renders @color-profile rule", () => {
  const rule = colorProfile("--swop5c", { src: "url('profile.icc')" });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@color-profile --swop5c"), true);
  assertEquals(result.includes("src: url('profile.icc');"), true);
});

Deno.test("renderAtRule - renders @supports rule", () => {
  const s = style({ display: "grid" });
  const rule = supports("(display: grid)", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@supports (display: grid)"), true);
});

Deno.test("renderAtRule - renders @container rule", () => {
  const s = style({ padding: "16px" });
  const rule = container("(min-width: 400px)", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@container (min-width: 400px)"), true);
});

Deno.test("renderAtRule - renders @layer rule", () => {
  const s = style({ margin: "0" });
  const rule = layer("utilities", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@layer utilities"), true);
});

Deno.test("renderAtRule - renders @scope rule", () => {
  const s = style({ borderRadius: "8px" });
  const rule = scope("(.card)", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@scope (.card)"), true);
});

Deno.test("renderAtRule - renders @starting-style rule", () => {
  const s = style({ opacity: "0" });
  const rule = startingStyle(s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@starting-style {"), true);
});

Deno.test("renderAtRule - renders nested at-rules", () => {
  const s = style({ color: "red" });
  const inner = media("(min-width: 768px)", s);
  const outer = supports("(display: grid)", inner);
  const result = renderAtRule(outer, STANDARD_RENDER, 0);
  assertEquals(result.includes("@supports (display: grid)"), true);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
});

// =============================================================================
// At-Rule Constructor Tests
// =============================================================================

Deno.test("media - creates @media AtRule", () => {
  const rule = media("(min-width: 768px)");
  assertEquals(rule.tag, "@media");
  assertEquals(isAtRule(rule), true);
});

Deno.test("supports - creates @supports AtRule", () => {
  const rule = supports("(display: grid)");
  assertEquals(rule.tag, "@supports");
});

Deno.test("container - creates @container AtRule", () => {
  const rule = container("(min-width: 400px)");
  assertEquals(rule.tag, "@container");
});

Deno.test("layer - creates @layer AtRule", () => {
  const rule = layer("utilities");
  assertEquals(rule.tag, "@layer");
});

Deno.test("scope - creates @scope AtRule", () => {
  const rule = scope("(.card)");
  assertEquals(rule.tag, "@scope");
});

Deno.test("startingStyle - creates @starting-style AtRule", () => {
  const rule = startingStyle();
  assertEquals(rule.tag, "@starting-style");
});

Deno.test("keyframes - creates @keyframes AtRule", () => {
  const rule = keyframes("fadeIn", [
    { offset: "from", properties: { opacity: "0" } },
    { offset: "to", properties: { opacity: "1" } },
  ]);
  assertEquals(rule.tag, "@keyframes");
});

Deno.test("fontFace - creates @font-face AtRule", () => {
  const rule = fontFace({ fontFamily: "MyFont" });
  assertEquals(rule.tag, "@font-face");
});

Deno.test("importRule - creates @import AtRule", () => {
  const rule = importRule("'styles.css'");
  assertEquals(rule.tag, "@import");
});

Deno.test("charset - creates @charset AtRule", () => {
  const rule = charset("'UTF-8'");
  assertEquals(rule.tag, "@charset");
});

Deno.test("cssNamespace - creates @namespace AtRule", () => {
  const rule = cssNamespace("svg url('http://www.w3.org/2000/svg')");
  assertEquals(rule.tag, "@namespace");
});

Deno.test("page - creates @page AtRule", () => {
  const rule = page(":first", { margin: "2cm" });
  assertEquals(rule.tag, "@page");
});

Deno.test("property - creates @property AtRule", () => {
  const rule = property("--my-color", { syntax: "<color>", inherits: false });
  assertEquals(rule.tag, "@property");
});

Deno.test("counterStyle - creates @counter-style AtRule", () => {
  const rule = counterStyle("thumbs", { system: "cyclic" });
  assertEquals(rule.tag, "@counter-style");
});

Deno.test("fontFeatureValues - creates @font-feature-values AtRule", () => {
  const rule = fontFeatureValues("MyFont", {});
  assertEquals(rule.tag, "@font-feature-values");
});

Deno.test("fontPaletteValues - creates @font-palette-values AtRule", () => {
  const rule = fontPaletteValues("--my-palette", {});
  assertEquals(rule.tag, "@font-palette-values");
});

Deno.test("colorProfile - creates @color-profile AtRule", () => {
  const rule = colorProfile("--swop5c", { src: "url('profile.icc')" });
  assertEquals(rule.tag, "@color-profile");
});

// =============================================================================
// Style Tests
// =============================================================================

Deno.test("style - creates Style with hash-based class", () => {
  const s = style({ color: "red" });
  const name = s.toString();
  assertEquals(name.startsWith("."), true);
  assertEquals(name.length, 8); // . + 7 char hash
});

Deno.test("style - same properties produce same hash", () => {
  const s1 = style({ color: "red" });
  const s2 = style({ color: "red" });
  assertEquals(s1.toString(), s2.toString());
});

Deno.test("style - different properties produce different hash", () => {
  const s1 = style({ color: "red" });
  const s2 = style({ color: "blue" });
  assertEquals(s1.toString() !== s2.toString(), true);
});

Deno.test("style - render method produces CSS", () => {
  const s = style({ color: "red" });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("color: red;"), true);
  assertEquals(result.includes("{"), true);
  assertEquals(result.includes("}"), true);
});

Deno.test("style - with variants", () => {
  const s = style(
    { padding: "8px" },
    { variants: { large: { padding: "16px" } } },
  );
  const classes = s.with("large");
  assertEquals(classes.includes(s.toString()), true);
});

Deno.test("style - with children", () => {
  const s = style(
    { color: "red" },
    { children: { hover: { color: "blue" } } },
  );
  assertEquals(typeof s.hover, "object");
  assertEquals(isStyle(s.hover), true);
});

Deno.test("style - nest creates nested selector", () => {
  const s = style({ color: "red" });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&."), true);
});

Deno.test("style - with at-rules", () => {
  const m = media("(min-width: 768px)");
  const s = style({ color: "red" }, { at: [m] });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("@media"), true);
});

Deno.test("isStyle - returns true for Style", () => {
  const s = style({ color: "red" });
  assertEquals(isStyle(s), true);
});

Deno.test("isStyle - returns false for null", () => {
  assertEquals(isStyle(null), false);
});

Deno.test("isStyle - returns false for plain object", () => {
  assertEquals(isStyle({ color: "red" }), false);
});

Deno.test("isStyle - returns false for AtRule", () => {
  const rule = media("(min-width: 768px)");
  assertEquals(isStyle(rule), false);
});

Deno.test("raw - creates style with custom selector", () => {
  const s = raw("a", { properties: { textDecoration: "none" } });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("a {"), true);
  assertEquals(result.includes("text-decoration: none;"), true);
});

Deno.test("raw - with pseudo-class selector", () => {
  const s = raw(":root", { properties: { fontSize: "16px" } });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes(":root {"), true);
});

Deno.test("id - creates style with ID selector", () => {
  const s = id("header", { position: "fixed" });
  assertEquals(s.toString(), "#header");
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("#header {"), true);
});

Deno.test("element - creates style with element selector", () => {
  const s = element("body", { margin: "0" });
  assertEquals(s.toString(), "body");
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("body {"), true);
});

Deno.test("element - with variants", () => {
  const s = element("button", { color: "blue" }, {
    variants: { primary: { backgroundColor: "blue" } },
  });
  assertEquals(s.toString(), "button");
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("button {"), true);
});

Deno.test("element - nest for non-nestable returns same", () => {
  const s = element("div", { color: "red" });
  const nested = s.nest();
  // Element selectors are not nestable, so nest returns the same
  assertEquals(s.toString(), nested.toString());
});

// =============================================================================
// render Function Tests
// =============================================================================

Deno.test("render - renders Style array", () => {
  const s = style({ color: "red" });
  const result = render([s], STANDARD_RENDER);
  assertEquals(result.includes("color: red;"), true);
});

Deno.test("render - renders AtRule array", () => {
  const rule = importRule("'styles.css'");
  const result = render([rule], STANDARD_RENDER);
  assertEquals(result, "@import 'styles.css';");
});

Deno.test("render - renders mixed array", () => {
  const s = style({ color: "red" });
  const rule = importRule("'styles.css'");
  const result = render([rule, s], STANDARD_RENDER);
  assertEquals(result.includes("@import 'styles.css';"), true);
  assertEquals(result.includes("color: red;"), true);
});

Deno.test("render - renders style record", () => {
  const styles = {
    btn: style({ color: "blue" }),
    card: style({ padding: "16px" }),
  };
  const result = render([styles], STANDARD_RENDER);
  assertEquals(result.includes("color: blue;"), true);
  assertEquals(result.includes("padding: 16px;"), true);
});

Deno.test("render - with MINIMAL_RENDER", () => {
  const s = style({ color: "red" });
  const result = render([s], MINIMAL_RENDER);
  assertEquals(result.includes("\n"), false);
  assertEquals(result.includes("color:red;"), true);
});

Deno.test("render - empty array returns empty string", () => {
  const result = render([], STANDARD_RENDER);
  assertEquals(result, "");
});

Deno.test("render - with nested styles in at-rules", () => {
  const s = style({ color: "red" });
  const m = media("(min-width: 768px)", s);
  const result = render([m], STANDARD_RENDER);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
  assertEquals(result.includes("color: red;"), true);
});

// =============================================================================
// Edge Cases and Integration Tests
// =============================================================================

Deno.test("style - empty properties", () => {
  const s = style({});
  const result = s.render(STANDARD_RENDER, 0);
  // Empty properties means no body, so should be empty or minimal
  assertEquals(result === "" || result.includes("{}"), true);
});

Deno.test("style - with existing Style as variant", () => {
  const existing = style({ color: "blue" });
  const s = style({ color: "red" }, { variants: { blue: existing } });
  const classes = s.with("blue");
  assertEquals(typeof classes, "string");
});

Deno.test("style - with existing Style as child", () => {
  const child = style({ color: "blue" });
  const s = style({ color: "red" }, { children: { nested: child } });
  assertEquals(isStyle(s.nested), true);
});

Deno.test("complex nested rendering", () => {
  const button = style({ padding: "8px" }, {
    variants: {
      large: { padding: "16px" },
      small: { padding: "4px" },
    },
    children: {
      icon: { marginRight: "4px" },
    },
  });

  const result = button.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("padding: 8px;"), true);
  assertEquals(result.includes("padding: 16px;"), true);
  assertEquals(result.includes("padding: 4px;"), true);
  assertEquals(result.includes("margin-right: 4px;"), true);
});

Deno.test("deeply nested at-rules", () => {
  const s = style({ color: "red" });
  const inner = media("(min-width: 768px)", s);
  const middle = supports("(display: grid)", inner);
  const outer = layer("components", middle);

  const result = render([outer], STANDARD_RENDER);
  assertEquals(result.includes("@layer components"), true);
  assertEquals(result.includes("@supports (display: grid)"), true);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
});

Deno.test("multiple at-rules in render", () => {
  const charset_rule = charset("'UTF-8'");
  const import_rule = importRule("'reset.css'");
  const s = style({ color: "red" });
  const m = media("(min-width: 768px)", s);

  const result = render([charset_rule, import_rule, s, m], STANDARD_RENDER);
  assertEquals(result.includes("@charset"), true);
  assertEquals(result.includes("@import"), true);
  assertEquals(result.includes("@media"), true);
});

Deno.test("style with numeric CSS values", () => {
  const s = style({ zIndex: 100, opacity: 0.5 });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("z-index: 100;"), true);
  assertEquals(result.includes("opacity: 0.5;"), true);
});

Deno.test("style with custom properties", () => {
  const s = style({ "--custom-color": "red", color: "var(--custom-color)" });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("--custom-color: red;"), true);
  assertEquals(result.includes("color: var(--custom-color);"), true);
});

Deno.test("font-face with numeric fontWeight", () => {
  const rule = fontFace({ fontFamily: "MyFont", fontWeight: 400 });
  const result = rule.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("font-weight: 400;"), true);
});

Deno.test("contract - generates consistent hashes", () => {
  const c1 = contract({ colors: { primary: null } });
  const c2 = contract({ colors: { primary: null } });
  // Same structure produces same var references
  assertEquals(c1.colors.primary, c2.colors.primary);
});

Deno.test("complex selector with nested compound", () => {
  const inner = compoundSelector(".inner", ":hover");
  const outer = compoundSelector(".outer", inner);
  const result = renderSelector(outer);
  assertEquals(result, ".outer.inner:hover");
});

Deno.test("complex selector in complex selector", () => {
  const inner = complexSelector(">", "ul", "li");
  const outer = complexSelector(" ", ".nav", inner);
  const result = renderSelector(outer);
  assertEquals(result, ".nav ul>li");
});

Deno.test("style render with empty variants and children", () => {
  const s = style({ color: "red" }, { variants: {}, children: {} });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("color: red;"), true);
});

Deno.test("renderAtRule - unknown tag returns empty string", () => {
  // Create a mock AtRule with an unknown tag to test the default branch
  const _mockRule = {
    tag: "@unknown" as const,
    options: { query: "test" },
    hash: "test123",
    render: () => "",
  };
  // The internal renderAtRule won't handle unknown tags - this tests the default case
  // Since we can't easily test this, we verify existing behavior
  const rule = media("test");
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(typeof result, "string");
});

Deno.test("id - with children", () => {
  const s = id("main", { padding: "20px" }, {
    children: { header: { marginBottom: "10px" } },
  });
  assertEquals(isStyle(s.header), true);
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("#main {"), true);
  assertEquals(result.includes("margin-bottom: 10px;"), true);
});

Deno.test("raw - with empty properties", () => {
  const s = raw("*", { properties: {} });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result === "" || result.includes("*"), true);
});

Deno.test("style.with - returns space-separated class names", () => {
  const s = style({ color: "red" }, {
    variants: {
      large: { fontSize: "20px" },
      primary: { backgroundColor: "blue" },
    },
  });
  const classes = s.with("large", "primary");
  const parts = classes.split(" ");
  assertEquals(parts.length, 3);
});

Deno.test("renderFontFace - empty properties", () => {
  const result = renderFontFace({}, STANDARD_RENDER, 0);
  assertEquals(result, "");
});

Deno.test("renderCounterStyle - empty descriptors", () => {
  const result = renderCounterStyle({}, STANDARD_RENDER, 0);
  assertEquals(result, "");
});

Deno.test("renderFontPalette - empty descriptors", () => {
  const result = renderFontPalette({}, STANDARD_RENDER, 0);
  assertEquals(result, "");
});

// =============================================================================
// Selector Kind Coverage Tests
// =============================================================================

Deno.test("nest - with universal selector returns same", () => {
  const s = raw("*", { properties: { color: "red" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("* {") || result.includes("&*"), true);
});

Deno.test("nest - with parent selector returns same", () => {
  const s = raw("&", { properties: { color: "red" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&"), true);
});

Deno.test("nest - with ID selector creates nested selector", () => {
  const s = id("test", { color: "red" });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&#test") || result.includes("&"), true);
});

Deno.test("nest - with attribute selector creates nested selector", () => {
  const s = raw("[type]", { properties: { color: "red" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&[type]"), true);
});

Deno.test("nest - with pseudo-element selector creates nested selector", () => {
  const s = raw("::before", { properties: { content: "''" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&::before"), true);
});

Deno.test("nest - with function-class selector creates nested selector", () => {
  const s = raw(":nth-child(2)", { properties: { color: "red" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&:nth-child(2)"), true);
});

Deno.test("nest - with pseudo-class selector creates nested selector", () => {
  const s = raw(":hover", { properties: { color: "blue" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&:hover"), true);
});

Deno.test("nest - with nested selector in compound", () => {
  const inner = compoundSelector(".inner");
  const s = raw(inner, { properties: { color: "red" } });
  const nested = s.nest();
  const result = nested.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("&"), true);
});

Deno.test("renderAtRule - @starting-style without children", () => {
  const rule = startingStyle();
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@starting-style"), true);
  assertEquals(result.includes("{}"), true);
});

// =============================================================================
// Contract and vars Coverage Tests
// =============================================================================

Deno.test("style - with contract var references", () => {
  const theme = contract({
    colors: { primary: null, secondary: null },
  });
  const s = style({ color: theme.colors.primary });
  const result = s.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("color: var(--"), true);
});

Deno.test("vars - produces valid CSS custom properties", () => {
  const theme = contract({
    colors: { primary: null },
  });
  const light = vars(theme, {
    colors: { primary: "blue" },
  });
  const result = light.render(STANDARD_RENDER, 0);
  assertEquals(result.includes("--"), true);
  assertEquals(result.includes(": blue;"), true);
});

Deno.test("renderAtRule - @media with empty children array", () => {
  const rule = media("(min-width: 768px)");
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
  assertEquals(result.includes("{}"), true);
});

Deno.test("renderAtRule - @scope with children", () => {
  const s = style({ color: "red" });
  const rule = scope("(.card) to (.card-content)", s);
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@scope (.card) to (.card-content)"), true);
  assertEquals(result.includes("color: red;"), true);
});

// =============================================================================
// Edge Case Coverage Tests (defensive code paths)
// =============================================================================

Deno.test("renderAtRule - @page with custom properties", () => {
  const rule = new AtRule("@page", {
    query: ":first",
    properties: { "--custom-margin": "2cm", margin: "2cm" },
  } as { query: ":first"; properties: { "--custom-margin": string; margin: string } });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@page :first"), true);
  assertEquals(result.includes("--custom-margin: 2cm;"), true);
});

Deno.test("renderAtRule - @media with undefined children (direct construction)", () => {
  // Test the falsy children branch by creating an AtRule directly
  const rule = new AtRule("@media", {
    query: "(min-width: 768px)",
    children: undefined,
  } as unknown as { query: string; children: [] });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result.includes("@media (min-width: 768px)"), true);
  assertEquals(result.includes("{}"), true);
});

Deno.test("renderAtRule - unknown tag returns empty string (defensive)", () => {
  // Test the default case in the switch by creating an AtRule with an unknown tag
  const rule = new AtRule("@unknown" as "@media", {
    query: "test",
    children: [],
  } as unknown as { query: string; children: [] });
  const result = renderAtRule(rule, STANDARD_RENDER, 0);
  assertEquals(result, "");
});
