import { assertEquals } from "@std/assert";
import {
  at,
  type CharsetRule,
  type ColorProfileDescriptors,
  type ColorProfileRenderingIntent,
  type ColorProfileRule,
  type ContainerRule,
  type CounterStyleDescriptors,
  type CounterStyleRule,
  type CounterStyleSystem,
  type CSSAtRule,
  type DocumentRule,
  type ExtractAtRuleTag,
  type FlatAtRule,
  type FlatAtRuleProperties,
  type FlatAtRulePropertiesFor,
  type FontFaceProperties,
  type FontFaceRule,
  type FontFeatureSubRule,
  type FontFeatureValuesDescriptors,
  type FontFeatureValuesRule,
  type FontFeatureValueType,
  type FontPaletteDescriptors,
  type FontPaletteValuesRule,
  type ImportRule,
  type KeyframeOffset,
  type KeyframeProperties,
  type KeyframesRule,
  type LayerRule,
  type MediaRule,
  type NamespaceRule,
  type NestableRules,
  type PageMarginRule,
  type PagePseudo,
  type PageRule,
  type PropertyDescriptors,
  type PropertyRule,
  type Quoted,
  type ScopeRule,
  type SelectorNestedAtRule,
  type StartingStyleRule,
  type SupportsRule,
  type Url,
} from "../atrules.ts";
import { render, STANDARD_RENDER_OPTIONS } from "../style.ts";

// =============================================================================
// at function tests
// =============================================================================

Deno.test("at - creates @font-face style", () => {
  const fontFace = at("@font-face", {
    fontFamily: "Roboto",
    src: "url('/fonts/roboto.woff2') format('woff2')",
    fontWeight: "400",
    fontDisplay: "swap",
  });
  assertEquals(fontFace.toString(), "@font-face");
  const css = render(STANDARD_RENDER_OPTIONS, fontFace);
  assertEquals(css.includes("font-family"), true);
  assertEquals(css.includes("Roboto"), true);
});

Deno.test("at - creates @property style", () => {
  const property = at("@property --theme-color", {
    syntax: '"<color>"',
    inherits: "true",
    initialValue: "blue",
  });
  assertEquals(property.toString(), "@property --theme-color");
  const css = render(STANDARD_RENDER_OPTIONS, property);
  assertEquals(css.includes("syntax"), true);
  assertEquals(css.includes("inherits"), true);
});

Deno.test("at - creates @counter-style style", () => {
  const counter = at("@counter-style thumbs", {
    system: "cyclic",
    symbols: "👍",
    suffix: " ",
  });
  assertEquals(counter.toString(), "@counter-style thumbs");
  const css = render(STANDARD_RENDER_OPTIONS, counter);
  assertEquals(css.includes("system"), true);
  assertEquals(css.includes("cyclic"), true);
});

Deno.test("at - creates @page style", () => {
  const page = at("@page :first", {
    marginTop: "2in",
  });
  assertEquals(page.toString(), "@page :first");
  const css = render(STANDARD_RENDER_OPTIONS, page);
  assertEquals(css.includes("margin-top"), true);
});

Deno.test("at - creates @page style without pseudo", () => {
  const page = at("@page", {
    margin: "1in",
  });
  assertEquals(page.toString(), "@page");
});

Deno.test("at - creates @color-profile style", () => {
  const profile = at("@color-profile --swop5c", {
    src: 'url("/profiles/swop.icc")',
    renderingIntent: "relative-colorimetric",
  });
  assertEquals(profile.toString(), "@color-profile --swop5c");
  const css = render(STANDARD_RENDER_OPTIONS, profile);
  assertEquals(css.includes("src"), true);
  assertEquals(css.includes("rendering-intent"), true);
});

Deno.test("at - @font-face with all properties", () => {
  const fontFace = at("@font-face", {
    fontFamily: "MyFont",
    src: "url('font.woff2')",
    fontStyle: "normal",
    fontWeight: 400,
    fontStretch: "normal",
    fontDisplay: "swap",
    unicodeRange: "U+0000-00FF",
    fontVariant: "normal",
    fontFeatureSettings: "normal",
    fontVariationSettings: "normal",
    ascentOverride: "90%",
    descentOverride: "20%",
    lineGapOverride: "0%",
    sizeAdjust: "100%",
  });
  const css = render(STANDARD_RENDER_OPTIONS, fontFace);
  assertEquals(css.includes("font-family"), true);
  assertEquals(css.includes("unicode-range"), true);
});

Deno.test("at - @property without initialValue", () => {
  const property = at("@property --my-prop", {
    syntax: '"*"',
    inherits: "false",
  });
  const css = render(STANDARD_RENDER_OPTIONS, property);
  assertEquals(css.includes("syntax"), true);
  assertEquals(css.includes("initial-value"), false);
});

Deno.test("at - @counter-style with all descriptors", () => {
  const counter = at("@counter-style custom", {
    system: "extends decimal",
    symbols: "a b c",
    additiveSymbols: "3 c, 2 b, 1 a",
    negative: "(-)",
    prefix: "[",
    suffix: "]",
    range: "1 10",
    pad: "3 0",
    fallback: "decimal",
    speakAs: "spell-out",
  });
  const css = render(STANDARD_RENDER_OPTIONS, counter);
  assertEquals(css.includes("system"), true);
  assertEquals(css.includes("fallback"), true);
});

Deno.test("at - @color-profile without optional fields", () => {
  const profile = at("@color-profile --minimal", {
    src: 'url("profile.icc")',
  });
  const css = render(STANDARD_RENDER_OPTIONS, profile);
  assertEquals(css.includes("src"), true);
});

// =============================================================================
// Type verification tests - Basic types
// =============================================================================

Deno.test("Quoted - accepts double-quoted strings", () => {
  const quoted: Quoted = '"UTF-8"';
  assertEquals(quoted, '"UTF-8"');
});

Deno.test("Quoted - accepts single-quoted strings", () => {
  const quoted: Quoted = "'UTF-8'";
  assertEquals(quoted, "'UTF-8'");
});

Deno.test("Url - accepts url() function values", () => {
  const url: Url = "url(image.png)";
  assertEquals(url, "url(image.png)");
});

// =============================================================================
// Type verification tests - At-rule types
// =============================================================================

Deno.test("CharsetRule - accepts charset declarations", () => {
  const rule: CharsetRule = '@charset "UTF-8"';
  assertEquals(rule, '@charset "UTF-8"');
});

Deno.test("ImportRule - accepts import with quoted string", () => {
  const rule1: ImportRule = '@import "base.css"';
  const rule2: ImportRule = '@import url("print.css") print';
  assertEquals(rule1, '@import "base.css"');
  assertEquals(rule2, '@import url("print.css") print');
});

Deno.test("NamespaceRule - accepts namespace declarations", () => {
  const rule1: NamespaceRule = "@namespace url(http://www.w3.org/1999/xhtml)";
  const rule2: NamespaceRule = "@namespace svg url(http://www.w3.org/2000/svg)";
  assertEquals(rule1, "@namespace url(http://www.w3.org/1999/xhtml)");
  assertEquals(rule2, "@namespace svg url(http://www.w3.org/2000/svg)");
});

Deno.test("MediaRule - accepts media queries", () => {
  const bare: MediaRule = "@media";
  const screen: MediaRule = "@media screen";
  const query: MediaRule = "@media screen and (min-width: 768px)";
  assertEquals(bare, "@media");
  assertEquals(screen, "@media screen");
  assertEquals(query, "@media screen and (min-width: 768px)");
});

Deno.test("SupportsRule - accepts supports queries", () => {
  const rule: SupportsRule = "@supports (display: grid)";
  assertEquals(rule, "@supports (display: grid)");
});

Deno.test("ContainerRule - accepts container queries", () => {
  const bare: ContainerRule = "@container";
  const query: ContainerRule = "@container (min-width: 300px)";
  assertEquals(bare, "@container");
  assertEquals(query, "@container (min-width: 300px)");
});

Deno.test("DocumentRule - accepts document rules", () => {
  const rule: DocumentRule = '@document url("https://example.com/")';
  const moz: DocumentRule = '@-moz-document url-prefix("https://")';
  assertEquals(rule, '@document url("https://example.com/")');
  assertEquals(moz, '@-moz-document url-prefix("https://")');
});

Deno.test("LayerRule - accepts layer declarations", () => {
  const anonymous: LayerRule = "@layer";
  const named: LayerRule = "@layer utilities";
  const order: LayerRule = "@layer base, components, utilities";
  assertEquals(anonymous, "@layer");
  assertEquals(named, "@layer utilities");
  assertEquals(order, "@layer base, components, utilities");
});

Deno.test("ScopeRule - accepts scope declarations", () => {
  const implicit: ScopeRule = "@scope";
  const root: ScopeRule = "@scope (.card)";
  const bounded: ScopeRule = "@scope (.card) to (.footer)";
  assertEquals(implicit, "@scope");
  assertEquals(root, "@scope (.card)");
  assertEquals(bounded, "@scope (.card) to (.footer)");
});

Deno.test("StartingStyleRule - accepts starting-style", () => {
  const rule: StartingStyleRule = "@starting-style";
  assertEquals(rule, "@starting-style");
});

Deno.test("FontFaceRule - accepts font-face", () => {
  const rule: FontFaceRule = "@font-face";
  assertEquals(rule, "@font-face");
});

Deno.test("FontFeatureValuesRule - accepts font-feature-values", () => {
  const rule: FontFeatureValuesRule = '@font-feature-values "Brill"';
  assertEquals(rule, '@font-feature-values "Brill"');
});

Deno.test("FontPaletteValuesRule - accepts font-palette-values", () => {
  const rule: FontPaletteValuesRule = "@font-palette-values --warm";
  assertEquals(rule, "@font-palette-values --warm");
});

Deno.test("KeyframesRule - accepts keyframes", () => {
  const standard: KeyframesRule = "@keyframes slide-in";
  const webkit: KeyframesRule = "@-webkit-keyframes bounce";
  assertEquals(standard, "@keyframes slide-in");
  assertEquals(webkit, "@-webkit-keyframes bounce");
});

Deno.test("PageRule - accepts page rules", () => {
  const all: PageRule = "@page";
  const first: PageRule = "@page :first";
  assertEquals(all, "@page");
  assertEquals(first, "@page :first");
});

Deno.test("CounterStyleRule - accepts counter-style", () => {
  const bare: CounterStyleRule = "@counter-style";
  const named: CounterStyleRule = "@counter-style thumbs";
  assertEquals(bare, "@counter-style");
  assertEquals(named, "@counter-style thumbs");
});

Deno.test("PropertyRule - accepts property rules", () => {
  const bare: PropertyRule = "@property";
  const named: PropertyRule = "@property --my-color";
  assertEquals(bare, "@property");
  assertEquals(named, "@property --my-color");
});

Deno.test("ColorProfileRule - accepts color-profile rules", () => {
  const bare: ColorProfileRule = "@color-profile";
  const named: ColorProfileRule = "@color-profile --swop5c";
  assertEquals(bare, "@color-profile");
  assertEquals(named, "@color-profile --swop5c");
});

Deno.test("PageMarginRule - accepts page margin rules", () => {
  const rules: PageMarginRule[] = [
    "@top-left-corner",
    "@top-left",
    "@top-center",
    "@top-right",
    "@top-right-corner",
    "@bottom-left-corner",
    "@bottom-left",
    "@bottom-center",
    "@bottom-right",
    "@bottom-right-corner",
    "@left-top",
    "@left-middle",
    "@left-bottom",
    "@right-top",
    "@right-middle",
    "@right-bottom",
  ];
  assertEquals(rules.length, 16);
});

Deno.test("FontFeatureSubRule - accepts font feature sub-rules", () => {
  const rules: FontFeatureSubRule[] = [
    "@swash",
    "@annotation",
    "@ornaments",
    "@stylistic",
    "@styleset",
    "@character-variant",
  ];
  assertEquals(rules.length, 6);
});

// =============================================================================
// Type verification tests - Composite types
// =============================================================================

Deno.test("SelectorNestedAtRule - accepts nestable at-rules", () => {
  const rules: SelectorNestedAtRule[] = [
    "@media screen",
    "@supports (display: grid)",
    "@container (min-width: 300px)",
    "@layer utilities",
    "@scope (.card)",
    "@starting-style",
  ];
  assertEquals(rules.length, 6);
});

Deno.test("NestableRules - matches SelectorNestedAtRule", () => {
  const rules: NestableRules[] = [
    "@media screen",
    "@scope (.card)",
    "@layer components",
    "@supports (display: flex)",
    "@container",
    "@starting-style",
  ];
  assertEquals(rules.length, 6);
});

Deno.test("CSSAtRule - accepts all at-rule types", () => {
  const rules: CSSAtRule[] = [
    '@charset "UTF-8"',
    '@import "base.css"',
    "@media screen",
    "@supports (display: grid)",
    "@keyframes bounce",
    "@font-face",
    "@page :first",
    "@top-left",
    "@swash",
  ];
  assertEquals(rules.length, 9);
});

// =============================================================================
// Type verification tests - Descriptor types
// =============================================================================

Deno.test("KeyframeOffset - accepts offset values", () => {
  const from: KeyframeOffset = "from";
  const to: KeyframeOffset = "to";
  const percent: KeyframeOffset = "50%";
  assertEquals(from, "from");
  assertEquals(to, "to");
  assertEquals(percent, "50%");
});

Deno.test("KeyframeProperties - accepts keyframe definitions", () => {
  const frames: KeyframeProperties = [
    { offset: "from", properties: { opacity: 0 } },
    { offset: "50%", properties: { opacity: 0.5 } },
    { offset: "to", properties: { opacity: 1 } },
  ];
  assertEquals(frames.length, 3);
});

Deno.test("FontFaceProperties - accepts font-face descriptors", () => {
  const props: FontFaceProperties = {
    fontFamily: "Roboto",
    src: "url('/fonts/roboto.woff2')",
    fontWeight: "400",
    fontStyle: "normal",
    fontDisplay: "swap",
  };
  assertEquals(props.fontFamily, "Roboto");
});

Deno.test("PagePseudo - accepts page pseudo-classes", () => {
  const pseudos: PagePseudo[] = [":first", ":last", ":left", ":right", ":blank"];
  assertEquals(pseudos.length, 5);
});

Deno.test("PropertyDescriptors - accepts property descriptors", () => {
  const desc: PropertyDescriptors = {
    syntax: '"<color>"',
    inherits: "true",
    initialValue: "black",
  };
  assertEquals(desc.syntax, '"<color>"');
  assertEquals(desc.inherits, "true");
});

Deno.test("PropertyDescriptors - inherits accepts only true/false strings", () => {
  const trueVal: PropertyDescriptors = { syntax: '"*"', inherits: "true" };
  const falseVal: PropertyDescriptors = { syntax: '"*"', inherits: "false" };
  assertEquals(trueVal.inherits, "true");
  assertEquals(falseVal.inherits, "false");
});

Deno.test("CounterStyleSystem - accepts system values", () => {
  const systems: CounterStyleSystem[] = [
    "cyclic",
    "numeric",
    "alphabetic",
    "symbolic",
    "additive",
    "fixed",
    "fixed 5",
    "extends decimal",
  ];
  assertEquals(systems.length, 8);
});

Deno.test("CounterStyleDescriptors - accepts counter-style descriptors", () => {
  const desc: CounterStyleDescriptors = {
    system: "cyclic",
    symbols: "👍 👎",
    suffix: " ",
  };
  assertEquals(desc.system, "cyclic");
});

Deno.test("FontFeatureValueType - accepts feature value types", () => {
  const types: FontFeatureValueType[] = [
    "stylistic",
    "styleset",
    "character-variant",
    "swash",
    "ornaments",
    "annotation",
  ];
  assertEquals(types.length, 6);
});

Deno.test("FontFeatureValuesDescriptors - accepts feature values", () => {
  const desc: FontFeatureValuesDescriptors = {
    stylistic: { fancy: [1] },
    swash: { swoop: [1], swoopier: [2] },
  };
  assertEquals(desc.stylistic?.fancy, [1]);
});

Deno.test("FontPaletteDescriptors - accepts palette descriptors", () => {
  const withNumber: FontPaletteDescriptors = { basePalette: 0 };
  const withString: FontPaletteDescriptors = { basePalette: "dark" };
  const withOverrides: FontPaletteDescriptors = {
    basePalette: 0,
    overrideColors: { 0: "#ff0000", 1: "#00ff00" },
  };
  assertEquals(withNumber.basePalette, 0);
  assertEquals(withString.basePalette, "dark");
  assertEquals(withOverrides.overrideColors?.[0], "#ff0000");
});

Deno.test("ColorProfileRenderingIntent - accepts rendering intents", () => {
  const intents: ColorProfileRenderingIntent[] = [
    "relative-colorimetric",
    "absolute-colorimetric",
    "perceptual",
    "saturation",
  ];
  assertEquals(intents.length, 4);
});

Deno.test("ColorProfileDescriptors - accepts color-profile descriptors", () => {
  const desc: ColorProfileDescriptors = {
    src: 'url("/profile.icc")',
    renderingIntent: "perceptual",
    components: "red, green, blue",
  };
  assertEquals(desc.src, 'url("/profile.icc")');
});

// =============================================================================
// Type verification tests - Utility types
// =============================================================================

Deno.test("FlatAtRule - accepts flat at-rules", () => {
  const rules: FlatAtRule[] = [
    "@font-face",
    "@page",
    "@page :first",
    "@property --color",
    "@counter-style thumbs",
    "@color-profile --swop",
  ];
  assertEquals(rules.length, 6);
});

Deno.test("ExtractAtRuleTag - extracts tag from at-rule", () => {
  type Tag1 = ExtractAtRuleTag<"@font-face">;
  type Tag2 = ExtractAtRuleTag<"@property --color">;
  const tag1: Tag1 = "@font-face";
  const tag2: Tag2 = "@property";
  assertEquals(tag1, "@font-face");
  assertEquals(tag2, "@property");
});

Deno.test("FlatAtRuleProperties - maps at-rule tags to property types", () => {
  type FontFaceProps = FlatAtRuleProperties["@font-face"];
  const props: FontFaceProps = { fontFamily: "Test" };
  assertEquals(props.fontFamily, "Test");
});

Deno.test("FlatAtRulePropertiesFor - gets properties for specific at-rule", () => {
  type Props = FlatAtRulePropertiesFor<"@property --color">;
  const props: Props = { syntax: '"<color>"', inherits: "true" };
  assertEquals(props.syntax, '"<color>"');
});
