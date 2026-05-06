import { assertEquals } from "jsr:@std/assert";
import {
  adjacent,
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
} from "../../src/ast/builders.ts";
import {
  renderCss,
  renderProperty,
  renderRule,
  renderSelector,
  renderValue,
} from "../../src/ast/render.ts";
import type { CssDocument } from "../../src/ast/types.ts";

// Value rendering tests

Deno.test("renderValue handles string", () => {
  assertEquals(renderValue("10px"), "10px");
});

Deno.test("renderValue handles number", () => {
  assertEquals(renderValue(42), "42");
});

Deno.test("renderValue handles CSS variable without fallback", () => {
  assertEquals(renderValue(cssVar("--primary")), "var(--primary)");
});

Deno.test("renderValue handles CSS variable with fallback", () => {
  assertEquals(renderValue(cssVar("--primary", "blue")), "var(--primary, blue)");
});

Deno.test("renderValue handles nested CSS variable fallback", () => {
  const value = cssVar("--primary", cssVar("--secondary", "blue"));
  assertEquals(renderValue(value), "var(--primary, var(--secondary, blue))");
});

Deno.test("renderValue handles fallback values", () => {
  assertEquals(renderValue(fallback("red", "blue")), "red, blue");
});

// Property rendering tests

Deno.test("renderProperty handles simple property", () => {
  assertEquals(renderProperty(prop("color", "red")), "color: red");
});

Deno.test("renderProperty handles camelCase to kebab-case", () => {
  assertEquals(
    renderProperty(prop("backgroundColor", "blue")),
    "background-color: blue"
  );
});

Deno.test("renderProperty handles !important", () => {
  assertEquals(
    renderProperty(prop("color", "red", true)),
    "color: red !important"
  );
});

Deno.test("renderProperty handles CSS variable value", () => {
  assertEquals(
    renderProperty(prop("color", cssVar("--primary"))),
    "color: var(--primary)"
  );
});

// Selector rendering tests

Deno.test("renderSelector handles class selector", () => {
  assertEquals(renderSelector(cls("button")), ".button");
});

Deno.test("renderSelector handles id selector", () => {
  assertEquals(renderSelector(id("main")), "#main");
});

Deno.test("renderSelector handles tag selector", () => {
  assertEquals(renderSelector(tag("div")), "div");
});

Deno.test("renderSelector handles compound selector", () => {
  assertEquals(renderSelector(compound(tag("div"), cls("container"))), "div.container");
});

Deno.test("renderSelector handles descendant combinator", () => {
  assertEquals(renderSelector(descendant(cls("parent"), cls("child"))), ".parent .child");
});

Deno.test("renderSelector handles child combinator", () => {
  assertEquals(renderSelector(child(cls("parent"), cls("child"))), ".parent > .child");
});

Deno.test("renderSelector handles adjacent sibling combinator", () => {
  assertEquals(renderSelector(adjacent(cls("first"), cls("second"))), ".first + .second");
});

Deno.test("renderSelector handles general sibling combinator", () => {
  assertEquals(renderSelector(sibling(cls("first"), cls("second"))), ".first ~ .second");
});

Deno.test("renderSelector handles pseudo-class", () => {
  assertEquals(renderSelector(pseudo(cls("button"), "hover")), ".button:hover");
});

Deno.test("renderSelector handles pseudo-element", () => {
  assertEquals(renderSelector(pseudoElement(cls("container"), "before")), ".container::before");
});

Deno.test("renderSelector handles complex nested selectors", () => {
  const selector = descendant(
    child(cls("nav"), tag("ul")),
    pseudo(tag("li"), "first-child")
  );
  assertEquals(renderSelector(selector), ".nav > ul li:first-child");
});

// Rule rendering tests

Deno.test("renderRule handles simple style rule", () => {
  const rule = styleRule(cls("button"), [prop("color", "blue")]);
  assertEquals(
    renderRule(rule),
    `.button {
  color: blue;
}`
  );
});

Deno.test("renderRule handles style rule with multiple selectors", () => {
  const rule = styleRule([cls("button"), cls("link")], [prop("color", "blue")]);
  assertEquals(
    renderRule(rule),
    `.button, .link {
  color: blue;
}`
  );
});

Deno.test("renderRule handles style rule with multiple properties", () => {
  const rule = styleRule(cls("button"), [
    prop("color", "blue"),
    prop("padding", "10px"),
  ]);
  assertEquals(
    renderRule(rule),
    `.button {
  color: blue;
  padding: 10px;
}`
  );
});

Deno.test("renderRule handles media rule", () => {
  const rule = mediaRule("(min-width: 768px)", [
    styleRule(cls("button"), [prop("padding", "20px")]),
  ]);
  assertEquals(
    renderRule(rule),
    `@media (min-width: 768px) {
  .button {
    padding: 20px;
  }
}`
  );
});

Deno.test("renderRule handles supports rule", () => {
  const rule = supportsRule("(display: grid)", [
    styleRule(cls("container"), [prop("display", "grid")]),
  ]);
  assertEquals(
    renderRule(rule),
    `@supports (display: grid) {
  .container {
    display: grid;
  }
}`
  );
});

Deno.test("renderRule handles container rule without name", () => {
  const rule = containerRule("(min-width: 300px)", [
    styleRule(cls("card"), [prop("padding", "20px")]),
  ]);
  assertEquals(
    renderRule(rule),
    `@container (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`
  );
});

Deno.test("renderRule handles container rule with name", () => {
  const rule = containerRule("(min-width: 300px)", [
    styleRule(cls("card"), [prop("padding", "20px")]),
  ], "sidebar");
  assertEquals(
    renderRule(rule),
    `@container sidebar (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`
  );
});

Deno.test("renderRule handles keyframes rule", () => {
  const rule = keyframesRule("fadeIn", {
    "0%": [prop("opacity", 0)],
    "100%": [prop("opacity", 1)],
  });
  const result = renderRule(rule);
  assertEquals(result.includes("@keyframes fadeIn"), true);
  assertEquals(result.includes("0%"), true);
  assertEquals(result.includes("100%"), true);
  assertEquals(result.includes("opacity: 0"), true);
  assertEquals(result.includes("opacity: 1"), true);
});

Deno.test("renderRule handles font-face rule", () => {
  const rule = fontFaceRule([
    prop("fontFamily", '"MyFont"'),
    prop("src", 'url("font.woff2")'),
  ]);
  assertEquals(
    renderRule(rule),
    `@font-face {
  font-family: "MyFont";
  src: url("font.woff2");
}`
  );
});

Deno.test("renderRule handles layer rule", () => {
  const rule = layerRule("components", [
    styleRule(cls("button"), [prop("color", "blue")]),
  ]);
  assertEquals(
    renderRule(rule),
    `@layer components {
  .button {
    color: blue;
  }
}`
  );
});

Deno.test("renderRule handles layer statement", () => {
  const rule = layerStatement("reset", "base", "components");
  assertEquals(renderRule(rule), "@layer reset, base, components;");
});

Deno.test("renderRule handles property rule without initial value", () => {
  const rule = propertyRule("--my-color", "<color>", true);
  assertEquals(
    renderRule(rule),
    `@property --my-color {
  syntax: "<color>";
  inherits: true;
}`
  );
});

Deno.test("renderRule handles property rule with initial value", () => {
  const rule = propertyRule("--my-color", "<color>", true, "blue");
  assertEquals(
    renderRule(rule),
    `@property --my-color {
  syntax: "<color>";
  inherits: true;
  initial-value: blue;
}`
  );
});

// Minified output tests

Deno.test("renderRule minified style rule", () => {
  const rule = styleRule(cls("button"), [
    prop("color", "blue"),
    prop("padding", "10px"),
  ]);
  assertEquals(
    renderRule(rule, { minify: true }),
    ".button{color: blue;padding: 10px;}"
  );
});

Deno.test("renderRule minified media rule", () => {
  const rule = mediaRule("(min-width: 768px)", [
    styleRule(cls("button"), [prop("padding", "20px")]),
  ]);
  assertEquals(
    renderRule(rule, { minify: true }),
    "@media (min-width: 768px){.button{padding: 20px;}}"
  );
});

// Document rendering tests

Deno.test("renderCss renders multiple rules", () => {
  const doc: CssDocument = {
    rules: [
      styleRule(cls("button"), [prop("color", "blue")]),
      styleRule(cls("link"), [prop("color", "red")]),
    ],
  };
  assertEquals(
    renderCss(doc),
    `.button {
  color: blue;
}
.link {
  color: red;
}`
  );
});

Deno.test("renderCss minified document", () => {
  const doc: CssDocument = {
    rules: [
      styleRule(cls("button"), [prop("color", "blue")]),
      styleRule(cls("link"), [prop("color", "red")]),
    ],
  };
  assertEquals(
    renderCss(doc, { minify: true }),
    ".button{color: blue;}.link{color: red;}"
  );
});

Deno.test("renderCss integration test matching plan example", () => {
  const doc: CssDocument = {
    rules: [
      styleRule(cls("button"), [
        prop("padding", "8px 16px"),
        prop("backgroundColor", "blue"),
      ]),
      mediaRule("(min-width: 768px)", [
        styleRule(cls("button"), [prop("padding", "12px 24px")]),
      ]),
    ],
  };
  assertEquals(
    renderCss(doc),
    `.button {
  padding: 8px 16px;
  background-color: blue;
}
@media (min-width: 768px) {
  .button {
    padding: 12px 24px;
  }
}`
  );
});
