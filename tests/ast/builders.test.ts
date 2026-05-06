import { assertEquals } from "jsr:@std/assert";
import {
  adjacent,
  attr,
  child,
  cls,
  compound,
  containerRule,
  cssVar,
  descendant,
  fallback,
  fontFaceRule,
  id,
  keyframesRule,
  layerRule,
  layerStatement,
  mediaRule,
  prop,
  propertyRule,
  pseudo,
  pseudoElement,
  sibling,
  styleRule,
  supportsRule,
  tag,
  universal,
} from "../../src/ast/builders.ts";

Deno.test("cls creates class selector", () => {
  assertEquals(cls("button"), { type: "simple", value: ".button" });
});

Deno.test("id creates id selector", () => {
  assertEquals(id("main"), { type: "simple", value: "#main" });
});

Deno.test("tag creates element selector", () => {
  assertEquals(tag("div"), { type: "simple", value: "div" });
});

Deno.test("attr creates attribute selector", () => {
  assertEquals(attr('[type="text"]'), { type: "simple", value: '[type="text"]' });
});

Deno.test("universal creates universal selector", () => {
  assertEquals(universal(), { type: "simple", value: "*" });
});

Deno.test("compound combines simple selectors", () => {
  const result = compound(tag("div"), cls("container"));
  assertEquals(result, {
    type: "compound",
    selectors: [
      { type: "simple", value: "div" },
      { type: "simple", value: ".container" },
    ],
  });
});

Deno.test("descendant creates descendant combinator", () => {
  const result = descendant(cls("parent"), cls("child"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".parent" },
    combinator: " ",
    right: { type: "simple", value: ".child" },
  });
});

Deno.test("child creates child combinator", () => {
  const result = child(cls("parent"), cls("child"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".parent" },
    combinator: ">",
    right: { type: "simple", value: ".child" },
  });
});

Deno.test("adjacent creates adjacent sibling combinator", () => {
  const result = adjacent(cls("first"), cls("second"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".first" },
    combinator: "+",
    right: { type: "simple", value: ".second" },
  });
});

Deno.test("sibling creates general sibling combinator", () => {
  const result = sibling(cls("first"), cls("second"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".first" },
    combinator: "~",
    right: { type: "simple", value: ".second" },
  });
});

Deno.test("pseudo creates pseudo-class selector", () => {
  const result = pseudo(cls("button"), "hover");
  assertEquals(result, {
    type: "pseudo",
    base: { type: "simple", value: ".button" },
    pseudo: "hover",
    isElement: false,
  });
});

Deno.test("pseudoElement creates pseudo-element selector", () => {
  const result = pseudoElement(cls("container"), "before");
  assertEquals(result, {
    type: "pseudo",
    base: { type: "simple", value: ".container" },
    pseudo: "before",
    isElement: true,
  });
});

Deno.test("prop creates property without important", () => {
  assertEquals(prop("color", "red"), { name: "color", value: "red" });
});

Deno.test("prop creates property with important", () => {
  assertEquals(prop("color", "red", true), {
    name: "color",
    value: "red",
    important: true,
  });
});

Deno.test("cssVar creates variable without fallback", () => {
  assertEquals(cssVar("--primary"), { type: "var", name: "--primary" });
});

Deno.test("cssVar creates variable with fallback", () => {
  assertEquals(cssVar("--primary", "blue"), {
    type: "var",
    name: "--primary",
    fallback: "blue",
  });
});

Deno.test("fallback creates fallback value", () => {
  assertEquals(fallback("red", "blue", "green"), {
    type: "fallback",
    values: ["red", "blue", "green"],
  });
});

Deno.test("styleRule with single selector", () => {
  const result = styleRule(cls("btn"), [prop("color", "blue")]);
  assertEquals(result, {
    type: "style",
    selectors: [{ type: "simple", value: ".btn" }],
    properties: [{ name: "color", value: "blue" }],
  });
});

Deno.test("styleRule with multiple selectors", () => {
  const result = styleRule([cls("btn"), cls("link")], [prop("color", "blue")]);
  assertEquals(result, {
    type: "style",
    selectors: [
      { type: "simple", value: ".btn" },
      { type: "simple", value: ".link" },
    ],
    properties: [{ name: "color", value: "blue" }],
  });
});

Deno.test("mediaRule creates media query", () => {
  const inner = styleRule(cls("btn"), [prop("padding", "20px")]);
  const result = mediaRule("(min-width: 768px)", [inner]);
  assertEquals(result, {
    type: "media",
    query: "(min-width: 768px)",
    rules: [inner],
  });
});

Deno.test("supportsRule creates supports query", () => {
  const inner = styleRule(cls("grid"), [prop("display", "grid")]);
  const result = supportsRule("(display: grid)", [inner]);
  assertEquals(result, {
    type: "supports",
    query: "(display: grid)",
    rules: [inner],
  });
});

Deno.test("containerRule without name", () => {
  const inner = styleRule(cls("card"), [prop("padding", "10px")]);
  const result = containerRule("(min-width: 300px)", [inner]);
  assertEquals(result, {
    type: "container",
    query: "(min-width: 300px)",
    rules: [inner],
  });
});

Deno.test("containerRule with name", () => {
  const inner = styleRule(cls("card"), [prop("padding", "10px")]);
  const result = containerRule("(min-width: 300px)", [inner], "sidebar");
  assertEquals(result, {
    type: "container",
    name: "sidebar",
    query: "(min-width: 300px)",
    rules: [inner],
  });
});

Deno.test("keyframesRule creates keyframes", () => {
  const result = keyframesRule("fadeIn", {
    "0%": [prop("opacity", 0)],
    "100%": [prop("opacity", 1)],
  });
  assertEquals(result.type, "keyframes");
  assertEquals(result.name, "fadeIn");
  assertEquals(result.frames.length, 2);
});

Deno.test("fontFaceRule creates font-face", () => {
  const result = fontFaceRule([
    prop("fontFamily", '"MyFont"'),
    prop("src", 'url("font.woff2")'),
  ]);
  assertEquals(result, {
    type: "font-face",
    properties: [
      { name: "fontFamily", value: '"MyFont"' },
      { name: "src", value: 'url("font.woff2")' },
    ],
  });
});

Deno.test("layerRule creates layer", () => {
  const inner = styleRule(cls("btn"), [prop("color", "blue")]);
  const result = layerRule("components", [inner]);
  assertEquals(result, {
    type: "layer",
    name: "components",
    rules: [inner],
  });
});

Deno.test("layerStatement creates layer statement", () => {
  const result = layerStatement("reset", "base", "components");
  assertEquals(result, {
    type: "layer-statement",
    names: ["reset", "base", "components"],
  });
});

Deno.test("propertyRule without initial value", () => {
  const result = propertyRule("--my-color", "<color>", true);
  assertEquals(result, {
    type: "property",
    name: "--my-color",
    syntax: "<color>",
    inherits: true,
  });
});

Deno.test("propertyRule with initial value", () => {
  const result = propertyRule("--my-color", "<color>", true, "blue");
  assertEquals(result, {
    type: "property",
    name: "--my-color",
    syntax: "<color>",
    inherits: true,
    initialValue: "blue",
  });
});
