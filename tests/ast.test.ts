import { assertEquals } from "@std/assert";
import * as ast from "../ast.ts";

const MINIFIED_RENDER_OPTIONS: ast.RenderOptions = {
  space: "",
  indent: "",
  newline: "",
};

// Builder tests

Deno.test("cls creates class selector", () => {
  assertEquals(ast.cls("button"), { type: "simple", value: ".button" });
});

Deno.test("id creates id selector", () => {
  assertEquals(ast.id("main"), { type: "simple", value: "#main" });
});

Deno.test("tag creates element selector", () => {
  assertEquals(ast.tag("div"), { type: "simple", value: "div" });
});

Deno.test("attr creates attribute selector", () => {
  assertEquals(ast.attr('[type="text"]'), {
    type: "simple",
    value: '[type="text"]',
  });
});

Deno.test("universal creates universal selector", () => {
  assertEquals(ast.universal(), { type: "simple", value: "*" });
});

Deno.test("compound combines simple selectors", () => {
  const result = ast.compound(ast.tag("div"), ast.cls("container"));
  assertEquals(result, {
    type: "compound",
    selectors: [
      { type: "simple", value: "div" },
      { type: "simple", value: ".container" },
    ],
  });
});

Deno.test("descendant creates descendant combinator", () => {
  const result = ast.descendant(ast.cls("parent"), ast.cls("child"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".parent" },
    combinator: " ",
    right: { type: "simple", value: ".child" },
  });
});

Deno.test("child creates child combinator", () => {
  const result = ast.child(ast.cls("parent"), ast.cls("child"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".parent" },
    combinator: ">",
    right: { type: "simple", value: ".child" },
  });
});

Deno.test("adjacent creates adjacent sibling combinator", () => {
  const result = ast.adjacent(ast.cls("first"), ast.cls("second"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".first" },
    combinator: "+",
    right: { type: "simple", value: ".second" },
  });
});

Deno.test("sibling creates general sibling combinator", () => {
  const result = ast.sibling(ast.cls("first"), ast.cls("second"));
  assertEquals(result, {
    type: "complex",
    left: { type: "simple", value: ".first" },
    combinator: "~",
    right: { type: "simple", value: ".second" },
  });
});

Deno.test("pseudo creates pseudo-class selector", () => {
  const result = ast.pseudo(ast.cls("button"), "hover");
  assertEquals(result, {
    type: "pseudo",
    base: { type: "simple", value: ".button" },
    pseudo: "hover",
    isElement: false,
  });
});

Deno.test("pseudoElement creates pseudo-element selector", () => {
  const result = ast.pseudoElement(ast.cls("container"), "before");
  assertEquals(result, {
    type: "pseudo",
    base: { type: "simple", value: ".container" },
    pseudo: "before",
    isElement: true,
  });
});

Deno.test("prop creates property without important", () => {
  assertEquals(ast.prop("color", "red"), { name: "color", value: "red" });
});

Deno.test("prop creates property with important", () => {
  assertEquals(ast.prop("color", "red", true), {
    name: "color",
    value: "red",
    important: true,
  });
});

Deno.test("cssVar creates variable without fallback", () => {
  assertEquals(ast.cssVar("--primary"), { type: "var", name: "--primary" });
});

Deno.test("cssVar creates variable with fallback", () => {
  assertEquals(ast.cssVar("--primary", "blue"), {
    type: "var",
    name: "--primary",
    fallback: "blue",
  });
});

Deno.test("fallback creates fallback value", () => {
  assertEquals(ast.fallback("red", "blue", "green"), {
    type: "fallback",
    values: ["red", "blue", "green"],
  });
});

Deno.test("styleRule with single selector", () => {
  const result = ast.styleRule(ast.cls("btn"), [ast.prop("color", "blue")]);
  assertEquals(result, {
    type: "style",
    selectors: [{ type: "simple", value: ".btn" }],
    properties: [{ name: "color", value: "blue" }],
  });
});

Deno.test("styleRule with multiple selectors", () => {
  const result = ast.styleRule([ast.cls("btn"), ast.cls("link")], [
    ast.prop("color", "blue"),
  ]);
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
  const inner = ast.styleRule(ast.cls("btn"), [ast.prop("padding", "20px")]);
  const result = ast.mediaRule("(min-width: 768px)", [inner]);
  assertEquals(result, {
    type: "media",
    query: "(min-width: 768px)",
    rules: [inner],
  });
});

Deno.test("supportsRule creates supports query", () => {
  const inner = ast.styleRule(ast.cls("grid"), [ast.prop("display", "grid")]);
  const result = ast.supportsRule("(display: grid)", [inner]);
  assertEquals(result, {
    type: "supports",
    query: "(display: grid)",
    rules: [inner],
  });
});

Deno.test("containerRule without name", () => {
  const inner = ast.styleRule(ast.cls("card"), [ast.prop("padding", "10px")]);
  const result = ast.containerRule("(min-width: 300px)", [inner]);
  assertEquals(result, {
    type: "container",
    query: "(min-width: 300px)",
    rules: [inner],
    name: undefined,
  });
});

Deno.test("containerRule with name", () => {
  const inner = ast.styleRule(ast.cls("card"), [ast.prop("padding", "10px")]);
  const result = ast.containerRule("(min-width: 300px)", [inner], "sidebar");
  assertEquals(result, {
    type: "container",
    name: "sidebar",
    query: "(min-width: 300px)",
    rules: [inner],
  });
});

Deno.test("keyframesRule creates keyframes", () => {
  const result = ast.keyframesRule("fadeIn", {
    "0%": [ast.prop("opacity", 0)],
    "100%": [ast.prop("opacity", 1)],
  });
  assertEquals(result.type, "keyframes");
  assertEquals(result.name, "fadeIn");
  assertEquals(result.frames.length, 2);
});

Deno.test("fontFaceRule creates font-face", () => {
  const result = ast.fontFaceRule([
    ast.prop("fontFamily", '"MyFont"'),
    ast.prop("src", 'url("font.woff2")'),
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
  const inner = ast.styleRule(ast.cls("btn"), [ast.prop("color", "blue")]);
  const result = ast.layerRule("components", [inner]);
  assertEquals(result, {
    type: "layer",
    name: "components",
    rules: [inner],
  });
});

Deno.test("layerStatement creates layer statement", () => {
  const result = ast.layerStatement("reset", "base", "components");
  assertEquals(result, {
    type: "layer-statement",
    names: ["reset", "base", "components"],
  });
});

Deno.test("propertyRule without initial value", () => {
  const result = ast.propertyRule("--my-color", "<color>", true);
  assertEquals(result, {
    type: "property",
    name: "--my-color",
    syntax: "<color>",
    inherits: true,
  });
});

Deno.test("propertyRule with initial value", () => {
  const result = ast.propertyRule("--my-color", "<color>", true, "blue");
  assertEquals(result, {
    type: "property",
    name: "--my-color",
    syntax: "<color>",
    inherits: true,
    initialValue: "blue",
  });
});

// Value rendering tests

Deno.test("renderValue handles string", () => {
  assertEquals(ast.renderValue("10px"), "10px");
});

Deno.test("renderValue handles number", () => {
  assertEquals(ast.renderValue(42), "42");
});

Deno.test("renderValue handles CSS variable without fallback", () => {
  assertEquals(ast.renderValue(ast.cssVar("--primary")), "var(--primary)");
});

Deno.test("renderValue handles CSS variable with fallback", () => {
  assertEquals(
    ast.renderValue(ast.cssVar("--primary", "blue")),
    "var(--primary, blue)",
  );
});

Deno.test("renderValue handles nested CSS variable fallback", () => {
  const value = ast.cssVar("--primary", ast.cssVar("--secondary", "blue"));
  assertEquals(
    ast.renderValue(value),
    "var(--primary, var(--secondary, blue))",
  );
});

Deno.test("renderValue handles fallback values", () => {
  assertEquals(ast.renderValue(ast.fallback("red", "blue")), "red, blue");
});

// Property rendering tests

Deno.test("renderProperty handles simple property", () => {
  assertEquals(ast.renderProperty(ast.prop("color", "red")), "color: red");
});

Deno.test("renderProperty handles camelCase to kebab-case", () => {
  assertEquals(
    ast.renderProperty(ast.prop("backgroundColor", "blue")),
    "background-color: blue",
  );
});

Deno.test("renderProperty handles !important", () => {
  assertEquals(
    ast.renderProperty(ast.prop("color", "red", true)),
    "color: red !important",
  );
});

Deno.test("renderProperty handles CSS variable value", () => {
  assertEquals(
    ast.renderProperty(ast.prop("color", ast.cssVar("--primary"))),
    "color: var(--primary)",
  );
});

// Selector rendering tests

Deno.test("renderSelector handles class selector", () => {
  assertEquals(ast.renderSelector(ast.cls("button")), ".button");
});

Deno.test("renderSelector handles id selector", () => {
  assertEquals(ast.renderSelector(ast.id("main")), "#main");
});

Deno.test("renderSelector handles tag selector", () => {
  assertEquals(ast.renderSelector(ast.tag("div")), "div");
});

Deno.test("renderSelector handles compound selector", () => {
  assertEquals(
    ast.renderSelector(ast.compound(ast.tag("div"), ast.cls("container"))),
    "div.container",
  );
});

Deno.test("renderSelector handles descendant combinator", () => {
  assertEquals(
    ast.renderSelector(ast.descendant(ast.cls("parent"), ast.cls("child"))),
    ".parent .child",
  );
});

Deno.test("renderSelector handles child combinator", () => {
  assertEquals(
    ast.renderSelector(ast.child(ast.cls("parent"), ast.cls("child"))),
    ".parent > .child",
  );
});

Deno.test("renderSelector handles adjacent sibling combinator", () => {
  assertEquals(
    ast.renderSelector(ast.adjacent(ast.cls("first"), ast.cls("second"))),
    ".first + .second",
  );
});

Deno.test("renderSelector handles general sibling combinator", () => {
  assertEquals(
    ast.renderSelector(ast.sibling(ast.cls("first"), ast.cls("second"))),
    ".first ~ .second",
  );
});

Deno.test("renderSelector handles pseudo-class", () => {
  assertEquals(
    ast.renderSelector(ast.pseudo(ast.cls("button"), "hover")),
    ".button:hover",
  );
});

Deno.test("renderSelector handles pseudo-element", () => {
  assertEquals(
    ast.renderSelector(ast.pseudoElement(ast.cls("container"), "before")),
    ".container::before",
  );
});

Deno.test("renderSelector handles complex nested selectors", () => {
  const selector = ast.descendant(
    ast.child(ast.cls("nav"), ast.tag("ul")),
    ast.pseudo(ast.tag("li"), "first-child"),
  );
  assertEquals(ast.renderSelector(selector), ".nav > ul li:first-child");
});

// Rule rendering tests

Deno.test("renderRule handles simple style rule", () => {
  const rule = ast.styleRule(ast.cls("button"), [ast.prop("color", "blue")]);
  assertEquals(
    ast.renderRule(rule),
    `.button {
  color: blue;
}`,
  );
});

Deno.test("renderRule handles style rule with multiple selectors", () => {
  const rule = ast.styleRule([ast.cls("button"), ast.cls("link")], [
    ast.prop("color", "blue"),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `.button, .link {
  color: blue;
}`,
  );
});

Deno.test("renderRule handles style rule with multiple properties", () => {
  const rule = ast.styleRule(ast.cls("button"), [
    ast.prop("color", "blue"),
    ast.prop("padding", "10px"),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `.button {
  color: blue;
  padding: 10px;
}`,
  );
});

Deno.test("renderRule handles media rule", () => {
  const rule = ast.mediaRule("(min-width: 768px)", [
    ast.styleRule(ast.cls("button"), [ast.prop("padding", "20px")]),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `@media (min-width: 768px) {
  .button {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles supports rule", () => {
  const rule = ast.supportsRule("(display: grid)", [
    ast.styleRule(ast.cls("container"), [ast.prop("display", "grid")]),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `@supports (display: grid) {
  .container {
    display: grid;
  }
}`,
  );
});

Deno.test("renderRule handles container rule without name", () => {
  const rule = ast.containerRule("(min-width: 300px)", [
    ast.styleRule(ast.cls("card"), [ast.prop("padding", "20px")]),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `@container (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles container rule with name", () => {
  const rule = ast.containerRule("(min-width: 300px)", [
    ast.styleRule(ast.cls("card"), [ast.prop("padding", "20px")]),
  ], "sidebar");
  assertEquals(
    ast.renderRule(rule),
    `@container sidebar (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles keyframes rule", () => {
  const rule = ast.keyframesRule("fadeIn", {
    "0%": [ast.prop("opacity", 0)],
    "100%": [ast.prop("opacity", 1)],
  });
  const result = ast.renderRule(rule);
  assertEquals(result.includes("@keyframes fadeIn"), true);
  assertEquals(result.includes("0%"), true);
  assertEquals(result.includes("100%"), true);
  assertEquals(result.includes("opacity: 0"), true);
  assertEquals(result.includes("opacity: 1"), true);
});

Deno.test("renderRule handles font-face rule", () => {
  const rule = ast.fontFaceRule([
    ast.prop("fontFamily", '"MyFont"'),
    ast.prop("src", 'url("font.woff2")'),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `@font-face {
  font-family: "MyFont";
  src: url("font.woff2");
}`,
  );
});

Deno.test("renderRule handles layer rule", () => {
  const rule = ast.layerRule("components", [
    ast.styleRule(ast.cls("button"), [ast.prop("color", "blue")]),
  ]);
  assertEquals(
    ast.renderRule(rule),
    `@layer components {
  .button {
    color: blue;
  }
}`,
  );
});

Deno.test("renderRule handles layer statement", () => {
  const rule = ast.layerStatement("reset", "base", "components");
  assertEquals(ast.renderRule(rule), "@layer reset, base, components;");
});

Deno.test("renderRule handles property rule without initial value", () => {
  const rule = ast.propertyRule("--my-color", "<color>", true);
  assertEquals(
    ast.renderRule(rule),
    `@property --my-color {
  syntax: "<color>";
  inherits: true;
}`,
  );
});

Deno.test("renderRule handles property rule with initial value", () => {
  const rule = ast.propertyRule("--my-color", "<color>", true, "blue");
  assertEquals(
    ast.renderRule(rule),
    `@property --my-color {
  syntax: "<color>";
  inherits: true;
  initial-value: blue;
}`,
  );
});

// Minified output tests

Deno.test("renderRule minified style rule", () => {
  const rule = ast.styleRule(ast.cls("button"), [
    ast.prop("color", "blue"),
    ast.prop("padding", "10px"),
  ]);
  assertEquals(
    ast.renderRule(rule, MINIFIED_RENDER_OPTIONS),
    ".button{color: blue;padding: 10px;}",
  );
});

Deno.test("renderRule minified media rule", () => {
  const rule = ast.mediaRule("(min-width: 768px)", [
    ast.styleRule(ast.cls("button"), [ast.prop("padding", "20px")]),
  ]);
  assertEquals(
    ast.renderRule(rule, MINIFIED_RENDER_OPTIONS),
    "@media (min-width: 768px){.button{padding: 20px;}}",
  );
});

// Document rendering tests

Deno.test("renderCss renders multiple rules", () => {
  const doc: ast.CssRule[] = [
    ast.styleRule(ast.cls("button"), [ast.prop("color", "blue")]),
    ast.styleRule(ast.cls("link"), [ast.prop("color", "red")]),
  ];
  assertEquals(
    ast.renderCss(doc),
    `.button {
  color: blue;
}
.link {
  color: red;
}`,
  );
});

Deno.test("renderCss minified document", () => {
  const doc: ast.CssRule[] = [
    ast.styleRule(ast.cls("button"), [ast.prop("color", "blue")]),
    ast.styleRule(ast.cls("link"), [ast.prop("color", "red")]),
  ];
  assertEquals(
    ast.renderCss(doc, MINIFIED_RENDER_OPTIONS),
    ".button{color: blue;}.link{color: red;}",
  );
});

Deno.test("renderCss integration test matching plan example", () => {
  const doc: ast.CssRule[] = [
    ast.styleRule(ast.cls("button"), [
      ast.prop("padding", "8px 16px"),
      ast.prop("backgroundColor", "blue"),
    ]),
    ast.mediaRule("(min-width: 768px)", [
      ast.styleRule(ast.cls("button"), [ast.prop("padding", "12px 24px")]),
    ]),
  ];
  assertEquals(
    ast.renderCss(doc),
    `.button {
  padding: 8px 16px;
  background-color: blue;
}
@media (min-width: 768px) {
  .button {
    padding: 12px 24px;
  }
}`,
  );
});

Deno.test("camelToKebab converts camelCase to kebab-case", () => {
  assertEquals(ast.camelToKebab("backgroundColor"), "background-color");
  assertEquals(
    ast.camelToKebab("borderTopLeftRadius"),
    "border-top-left-radius",
  );
  assertEquals(ast.camelToKebab("color"), "color");
  assertEquals(ast.camelToKebab("zIndex"), "z-index");
});
