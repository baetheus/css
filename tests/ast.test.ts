import { assertEquals } from "@std/assert";
import * as ast from "../ast.ts";

// =============================================================================
// Selector Builder Tests
// =============================================================================

Deno.test("select.el creates element selector", () => {
  const s = ast.select.el("div");
  assertEquals(s, { type: "element", name: "div", modifiers: [] });
});

Deno.test("select.el with modifiers", () => {
  const s = ast.select.el(
    "button",
    ast.select.pseudoClass("hover"),
    ast.select.pseudoClass("focus"),
  );
  assertEquals(s.type, "element");
  assertEquals(s.name, "button");
  assertEquals(s.modifiers.length, 2);
});

Deno.test("select.cls creates class selector", () => {
  const s = ast.select.cls("button");
  assertEquals(s, { type: "class-selector", name: "button", modifiers: [] });
});

Deno.test("select.cls with modifiers", () => {
  const s = ast.select.cls("btn", ast.select.pseudoClass("hover"));
  assertEquals(s.type, "class-selector");
  assertEquals(s.name, "btn");
  assertEquals(s.modifiers.length, 1);
});

Deno.test("select.id creates id selector", () => {
  const s = ast.select.id("main");
  assertEquals(s, { type: "id-selector", name: "main", modifiers: [] });
});

Deno.test("select.universal creates universal selector", () => {
  const s = ast.select.universal();
  assertEquals(s, { type: "universal-selector", modifiers: [] });
});

Deno.test("select.parent creates parent selector", () => {
  const s = ast.select.parent();
  assertEquals(s, { type: "parent-selector", modifiers: [] });
});

// =============================================================================
// Modifier Tests
// =============================================================================

Deno.test("select.class_ creates class modifier", () => {
  const m = ast.select.class_("active");
  assertEquals(m, { type: "class-mod", name: "active" });
});

Deno.test("select.attr creates attribute existence modifier", () => {
  const m = ast.select.attr("disabled");
  assertEquals(m, { type: "attr-mod", name: "disabled" });
});

Deno.test("select.attr with operator and value", () => {
  const m = ast.select.attr("type", "=", "text");
  assertEquals(m, { type: "attr-mod", name: "type", op: "=", value: "text" });
});

Deno.test("select.attrInsensitive creates case-insensitive attr", () => {
  const m = ast.select.attrInsensitive("type", "=", "TEXT");
  assertEquals(m, {
    type: "attr-mod",
    name: "type",
    op: "=",
    value: "TEXT",
    insensitive: true,
  });
});

Deno.test("select.pseudoClass creates simple pseudo-class", () => {
  const m = ast.select.pseudoClass("hover");
  assertEquals(m, { type: "pseudo-class-mod", name: "hover" });
});

Deno.test("select.pseudoClass with argument", () => {
  const m = ast.select.pseudoClass("nth-child", "2n+1");
  assertEquals(m, { type: "pseudo-class-mod", name: "nth-child", arg: "2n+1" });
});

Deno.test("select.pseudoElement creates pseudo-element", () => {
  const m = ast.select.pseudoElement("before");
  assertEquals(m, { type: "pseudo-element-mod", name: "before" });
});

// =============================================================================
// At-Rule Modifier Tests
// =============================================================================

Deno.test("select.media creates media modifier", () => {
  const m = ast.select.media("(min-width: 768px)");
  assertEquals(m, { type: "media-mod", query: "(min-width: 768px)" });
});

Deno.test("select.supports creates supports modifier", () => {
  const m = ast.select.supports("(display: grid)");
  assertEquals(m, { type: "supports-mod", query: "(display: grid)" });
});

Deno.test("select.container creates container modifier", () => {
  const m = ast.select.container("(min-width: 400px)");
  assertEquals(m, { type: "container-mod", query: "(min-width: 400px)" });
});

Deno.test("select.container with name", () => {
  const m = ast.select.container("(min-width: 400px)", "sidebar");
  assertEquals(m, {
    type: "container-mod",
    query: "(min-width: 400px)",
    name: "sidebar",
  });
});

Deno.test("select.layer creates layer modifier", () => {
  const m = ast.select.layer("utilities");
  assertEquals(m, { type: "layer-mod", name: "utilities" });
});

// =============================================================================
// Selector-Accepting Pseudo-Class Tests
// =============================================================================

Deno.test("select.is creates :is() pseudo-class", () => {
  const m = ast.select.is(ast.select.el("h1"), ast.select.el("h2"));
  assertEquals(m.type, "pseudo-class-mod");
  assertEquals(m.name, "is");
  assertEquals(Array.isArray(m.arg), true);
});

Deno.test("select.where creates :where() pseudo-class", () => {
  const m = ast.select.where(ast.select.cls("a"));
  assertEquals(m.type, "pseudo-class-mod");
  assertEquals(m.name, "where");
});

Deno.test("select.not creates :not() pseudo-class", () => {
  const m = ast.select.not(ast.select.cls("hidden"));
  assertEquals(m.type, "pseudo-class-mod");
  assertEquals(m.name, "not");
});

Deno.test("select.has creates :has() pseudo-class", () => {
  const m = ast.select.has(ast.select.el("img"));
  assertEquals(m.type, "pseudo-class-mod");
  assertEquals(m.name, "has");
});

// =============================================================================
// Combinator Tests
// =============================================================================

Deno.test("select.descendant creates descendant combinator", () => {
  const s = ast.select.descendant(ast.select.cls("nav"), ast.select.el("a"));
  assertEquals(s.type, "complex");
  assertEquals(s.combinator, " ");
});

Deno.test("select.child creates child combinator", () => {
  const s = ast.select.child(ast.select.el("ul"), ast.select.el("li"));
  assertEquals(s.type, "complex");
  assertEquals(s.combinator, ">");
});

Deno.test("select.adjacent creates adjacent sibling combinator", () => {
  const s = ast.select.adjacent(ast.select.el("h1"), ast.select.el("p"));
  assertEquals(s.type, "complex");
  assertEquals(s.combinator, "+");
});

Deno.test("select.sibling creates general sibling combinator", () => {
  const s = ast.select.sibling(ast.select.el("h1"), ast.select.el("p"));
  assertEquals(s.type, "complex");
  assertEquals(s.combinator, "~");
});

// =============================================================================
// Rule Builder Tests
// =============================================================================

Deno.test("styleRule creates style rule", () => {
  const rule = ast.styleRule(ast.select.cls("btn"), { color: "blue" });
  assertEquals(rule.type, "style");
  assertEquals(rule.selectors.length, 1);
  assertEquals(rule.properties, { color: "blue" });
});

Deno.test("styleRule with multiple selectors", () => {
  const rule = ast.styleRule([ast.select.cls("btn"), ast.select.cls("link")], {
    color: "blue",
  });
  assertEquals(rule.selectors.length, 2);
});

Deno.test("fontFaceRule creates font-face rule", () => {
  const rule = ast.fontFaceRule({
    fontFamily: '"MyFont"',
    src: 'url("font.woff2")',
  });
  assertEquals(rule.type, "font-face");
});

Deno.test("keyframesRule creates keyframes rule", () => {
  const rule = ast.keyframesRule("fadeIn", {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  });
  assertEquals(rule.type, "keyframes");
  assertEquals(rule.name, "fadeIn");
  assertEquals(rule.frames.length, 2);
});

Deno.test("layerRule creates layer rule", () => {
  const inner = ast.styleRule(ast.select.cls("btn"), { color: "blue" });
  const rule = ast.layerRule("components", [inner]);
  assertEquals(rule.type, "layer");
  assertEquals(rule.name, "components");
});

Deno.test("layerStatement creates layer statement", () => {
  const rule = ast.layerStatement("reset", "base", "components");
  assertEquals(rule.type, "layer-statement");
  assertEquals(rule.names, ["reset", "base", "components"]);
});

Deno.test("mediaRule creates media rule", () => {
  const inner = ast.styleRule(ast.select.cls("btn"), { padding: "20px" });
  const rule = ast.mediaRule("(min-width: 768px)", [inner]);
  assertEquals(rule.type, "media");
  assertEquals(rule.query, "(min-width: 768px)");
});

Deno.test("supportsRule creates supports rule", () => {
  const inner = ast.styleRule(ast.select.cls("grid"), { display: "grid" });
  const rule = ast.supportsRule("(display: grid)", [inner]);
  assertEquals(rule.type, "supports");
  assertEquals(rule.query, "(display: grid)");
});

Deno.test("containerRule creates container rule", () => {
  const inner = ast.styleRule(ast.select.cls("card"), { padding: "10px" });
  const rule = ast.containerRule("(min-width: 300px)", [inner]);
  assertEquals(rule.type, "container");
  assertEquals(rule.query, "(min-width: 300px)");
  assertEquals(rule.name, undefined);
});

Deno.test("containerRule with name", () => {
  const inner = ast.styleRule(ast.select.cls("card"), { padding: "10px" });
  const rule = ast.containerRule("(min-width: 300px)", [inner], "sidebar");
  assertEquals(rule.name, "sidebar");
});

Deno.test("propertyRule creates property rule", () => {
  const rule = ast.propertyRule("--my-color", "<color>", true, "blue");
  assertEquals(rule.type, "property");
  assertEquals(rule.name, "--my-color");
  assertEquals(rule.syntax, "<color>");
  assertEquals(rule.inherits, true);
  assertEquals(rule.initialValue, "blue");
});

Deno.test("propertyRule without initial value", () => {
  const rule = ast.propertyRule("--my-color", "<color>", false);
  assertEquals(rule.initialValue, undefined);
});

Deno.test("charsetRule creates charset rule", () => {
  const rule = ast.charsetRule("UTF-8");
  assertEquals(rule.type, "charset");
  assertEquals(rule.encoding, "UTF-8");
});

Deno.test("importRule creates import rule", () => {
  const rule = ast.importRule("./styles.css");
  assertEquals(rule.type, "import");
  assertEquals(rule.url, "./styles.css");
});

Deno.test("importRule with options", () => {
  const rule = ast.importRule(
    "./print.css",
    "print",
    "base",
    "(display: grid)",
  );
  assertEquals(rule.media, "print");
  assertEquals(rule.layer, "base");
  assertEquals(rule.supports, "(display: grid)");
});

Deno.test("namespaceRule creates namespace rule", () => {
  const rule = ast.namespaceRule("http://www.w3.org/1999/xhtml");
  assertEquals(rule.type, "namespace");
  assertEquals(rule.url, "http://www.w3.org/1999/xhtml");
});

Deno.test("namespaceRule with prefix", () => {
  const rule = ast.namespaceRule("http://www.w3.org/2000/svg", "svg");
  assertEquals(rule.prefix, "svg");
});

Deno.test("pageRule creates page rule", () => {
  const rule = ast.pageRule({ margin: "2cm" });
  assertEquals(rule.type, "page");
});

Deno.test("pageRule with selector", () => {
  const rule = ast.pageRule({ marginTop: "10cm" }, ":first");
  assertEquals(rule.selector, ":first");
});

Deno.test("counterStyleRule creates counter-style rule", () => {
  const rule = ast.counterStyleRule("thumbs", {
    system: "cyclic",
    symbols: "\\1F44D",
  });
  assertEquals(rule.type, "counter-style");
  assertEquals(rule.name, "thumbs");
});

Deno.test("fontFeatureValuesRule creates font-feature-values rule", () => {
  const rule = ast.fontFeatureValuesRule("Fancy Font", {
    stylistic: { cursive: [1] },
  });
  assertEquals(rule.type, "font-feature-values");
  assertEquals(rule.fontFamily, "Fancy Font");
});

Deno.test("fontPaletteValuesRule creates font-palette-values rule", () => {
  const rule = ast.fontPaletteValuesRule("--my-palette", "Color Font", {
    basePalette: 1,
  });
  assertEquals(rule.type, "font-palette-values");
  assertEquals(rule.name, "--my-palette");
});

Deno.test("colorProfileRule creates color-profile rule", () => {
  const rule = ast.colorProfileRule("--swop5c", "url('/profiles/swop.icc')");
  assertEquals(rule.type, "color-profile");
  assertEquals(rule.name, "--swop5c");
});

Deno.test("scopeRule creates scope rule", () => {
  const inner = ast.styleRule(ast.select.el("img"), { borderRadius: "8px" });
  const rule = ast.scopeRule(".card", ".card-footer", [inner]);
  assertEquals(rule.type, "scope");
  assertEquals(rule.start, ".card");
  assertEquals(rule.end, ".card-footer");
});

Deno.test("startingStyleRule creates starting-style rule", () => {
  const inner = ast.styleRule(ast.select.cls("dialog"), { opacity: "0" });
  const rule = ast.startingStyleRule([inner]);
  assertEquals(rule.type, "starting-style");
});

// =============================================================================
// Utility Function Tests
// =============================================================================

Deno.test("camelToKebab converts camelCase to kebab-case", () => {
  assertEquals(ast.camelToKebab("backgroundColor"), "background-color");
  assertEquals(
    ast.camelToKebab("borderTopLeftRadius"),
    "border-top-left-radius",
  );
  assertEquals(ast.camelToKebab("color"), "color");
  assertEquals(ast.camelToKebab("zIndex"), "z-index");
});

Deno.test("resolveOptions with defaults", () => {
  const opts = ast.resolveOptions();
  assertEquals(opts, ast.MINIMAL_RENDER_OPTIONS);
});

Deno.test("resolveOptions with partial overrides", () => {
  const opts = ast.resolveOptions({ indent: "  " });
  assertEquals(opts.indent, "  ");
  assertEquals(opts.space, "");
  assertEquals(opts.newline, "");
});

// =============================================================================
// Rendering Tests
// =============================================================================

Deno.test("renderValue handles string", () => {
  assertEquals(ast.renderValue("10px"), "10px");
});

Deno.test("renderValue handles number", () => {
  assertEquals(ast.renderValue(42), "42");
});

Deno.test("renderProperty handles simple property (minimal)", () => {
  assertEquals(ast.renderProperty("color", "red"), "color:red;");
});

Deno.test("renderProperty handles simple property (normal)", () => {
  assertEquals(
    ast.renderProperty("color", "red", ast.NORMAL_RENDER_OPTIONS),
    "color: red;\n",
  );
});

Deno.test("renderProperty handles camelCase", () => {
  assertEquals(
    ast.renderProperty("backgroundColor", "blue"),
    "background-color:blue;",
  );
});

Deno.test("renderProperty preserves CSS custom properties", () => {
  assertEquals(ast.renderProperty("--my-var", "red"), "--my-var:red;");
});

Deno.test("renderProperties renders multiple properties (minimal)", () => {
  const result = ast.renderProperties({ color: "red", padding: "10px" });
  assertEquals(result, "color:red;padding:10px;");
});

Deno.test("renderProperties renders multiple properties (normal)", () => {
  const result = ast.renderProperties(
    { color: "red", padding: "10px" },
    ast.NORMAL_RENDER_OPTIONS,
  );
  assertEquals(result, "color: red;\npadding: 10px;\n");
});

Deno.test("renderSelector handles class selector", () => {
  assertEquals(ast.renderSelector(ast.select.cls("button")), ".button");
});

Deno.test("renderSelector handles id selector", () => {
  assertEquals(ast.renderSelector(ast.select.id("main")), "#main");
});

Deno.test("renderSelector handles element selector", () => {
  assertEquals(ast.renderSelector(ast.select.el("div")), "div");
});

Deno.test("renderSelector handles universal selector", () => {
  assertEquals(ast.renderSelector(ast.select.universal()), "*");
});

Deno.test("renderSelector handles parent selector", () => {
  assertEquals(ast.renderSelector(ast.select.parent()), "&");
});

Deno.test("renderSelector handles element with class modifier", () => {
  assertEquals(
    ast.renderSelector(ast.select.el("div", ast.select.class_("container"))),
    "div.container",
  );
});

Deno.test("renderSelector handles element with attr modifier", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.el("input", ast.select.attr("type", "=", "text")),
    ),
    'input[type="text"]',
  );
});

Deno.test("renderSelector handles element with pseudo-class", () => {
  assertEquals(
    ast.renderSelector(ast.select.cls("btn", ast.select.pseudoClass("hover"))),
    ".btn:hover",
  );
});

Deno.test("renderSelector handles element with pseudo-element", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.cls("quote", ast.select.pseudoElement("before")),
    ),
    ".quote::before",
  );
});

Deno.test("renderSelector handles :is() with selectors", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.el(
        "div",
        ast.select.is(ast.select.el("h1"), ast.select.el("h2")),
      ),
    ),
    "div:is(h1, h2)",
  );
});

Deno.test("renderSelector handles descendant combinator", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.descendant(ast.select.cls("nav"), ast.select.el("a")),
    ),
    ".nav a",
  );
});

Deno.test("renderSelector handles child combinator", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.child(ast.select.el("ul"), ast.select.el("li")),
    ),
    "ul > li",
  );
});

Deno.test("renderSelector handles adjacent combinator", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.adjacent(ast.select.el("h1"), ast.select.el("p")),
    ),
    "h1 + p",
  );
});

Deno.test("renderSelector handles sibling combinator", () => {
  assertEquals(
    ast.renderSelector(
      ast.select.sibling(ast.select.el("h1"), ast.select.el("p")),
    ),
    "h1 ~ p",
  );
});

// =============================================================================
// Rule Rendering Tests
// =============================================================================

Deno.test("renderRule handles style rule (minified)", () => {
  const rule = ast.styleRule(ast.select.cls("btn"), { color: "blue" });
  assertEquals(ast.renderRule(rule), ".btn{color:blue;}");
});

Deno.test("renderRule handles style rule (normal)", () => {
  const rule = ast.styleRule(ast.select.cls("btn"), { color: "blue" });
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `.btn {
  color: blue;
}`,
  );
});

Deno.test("renderRule handles media rule", () => {
  const inner = ast.styleRule(ast.select.cls("btn"), { padding: "20px" });
  const rule = ast.mediaRule("(min-width: 768px)", [inner]);
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `@media (min-width: 768px) {
  .btn {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles supports rule", () => {
  const inner = ast.styleRule(ast.select.cls("grid"), { display: "grid" });
  const rule = ast.supportsRule("(display: grid)", [inner]);
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `@supports (display: grid) {
  .grid {
    display: grid;
  }
}`,
  );
});

Deno.test("renderRule handles container rule", () => {
  const inner = ast.styleRule(ast.select.cls("card"), { padding: "20px" });
  const rule = ast.containerRule("(min-width: 300px)", [inner]);
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `@container (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles container rule with name", () => {
  const inner = ast.styleRule(ast.select.cls("card"), { padding: "20px" });
  const rule = ast.containerRule("(min-width: 300px)", [inner], "sidebar");
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `@container sidebar (min-width: 300px) {
  .card {
    padding: 20px;
  }
}`,
  );
});

Deno.test("renderRule handles layer rule", () => {
  const inner = ast.styleRule(ast.select.cls("btn"), { color: "blue" });
  const rule = ast.layerRule("components", [inner]);
  assertEquals(
    ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS),
    `@layer components {
  .btn {
    color: blue;
  }
}`,
  );
});

Deno.test("renderRule handles layer statement", () => {
  const rule = ast.layerStatement("reset", "base", "components");
  assertEquals(ast.renderRule(rule), "@layer reset, base, components;");
});

Deno.test("renderRule handles keyframes rule", () => {
  const rule = ast.keyframesRule("fadeIn", {
    "from": { opacity: "0" },
    "to": { opacity: "1" },
  });
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@keyframes fadeIn"), true);
  assertEquals(result.includes("from"), true);
  assertEquals(result.includes("to"), true);
});

Deno.test("renderRule handles font-face rule", () => {
  const rule = ast.fontFaceRule({
    fontFamily: '"MyFont"',
    src: 'url("font.woff2")',
  });
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@font-face"), true);
  assertEquals(result.includes("font-family"), true);
});

Deno.test("renderRule handles property rule", () => {
  const rule = ast.propertyRule("--my-color", "<color>", true, "blue");
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@property --my-color"), true);
  assertEquals(result.includes('syntax: "<color>"'), true);
  assertEquals(result.includes("inherits: true"), true);
  assertEquals(result.includes("initial-value: blue"), true);
});

Deno.test("renderRule handles charset rule", () => {
  const rule = ast.charsetRule("UTF-8");
  assertEquals(ast.renderRule(rule), '@charset "UTF-8";');
});

Deno.test("renderRule handles import rule", () => {
  const rule = ast.importRule("./styles.css");
  assertEquals(ast.renderRule(rule), '@import url("./styles.css");');
});

Deno.test("renderRule handles import rule with layer", () => {
  const rule = ast.importRule("./base.css", undefined, "base");
  assertEquals(ast.renderRule(rule), '@import url("./base.css") layer(base);');
});

Deno.test("renderRule handles import rule with anonymous layer", () => {
  const rule = ast.importRule("./base.css", undefined, true);
  assertEquals(ast.renderRule(rule), '@import url("./base.css") layer;');
});

Deno.test("renderRule handles namespace rule", () => {
  const rule = ast.namespaceRule("http://www.w3.org/1999/xhtml");
  assertEquals(
    ast.renderRule(rule),
    '@namespace url("http://www.w3.org/1999/xhtml");',
  );
});

Deno.test("renderRule handles namespace rule with prefix", () => {
  const rule = ast.namespaceRule("http://www.w3.org/2000/svg", "svg");
  assertEquals(
    ast.renderRule(rule),
    '@namespace svg url("http://www.w3.org/2000/svg");',
  );
});

Deno.test("renderRule handles page rule", () => {
  const rule = ast.pageRule({ margin: "2cm" });
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@page"), true);
  assertEquals(result.includes("margin: 2cm"), true);
});

Deno.test("renderRule handles page rule with selector", () => {
  const rule = ast.pageRule({ marginTop: "10cm" }, ":first");
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@page :first"), true);
});

Deno.test("renderRule handles scope rule", () => {
  const inner = ast.styleRule(ast.select.el("a"), { color: "blue" });
  const rule = ast.scopeRule(".card", ".footer", [inner]);
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@scope (.card) to (.footer)"), true);
});

Deno.test("renderRule handles starting-style rule", () => {
  const inner = ast.styleRule(ast.select.cls("dialog"), { opacity: "0" });
  const rule = ast.startingStyleRule([inner]);
  const result = ast.renderRule(rule, ast.NORMAL_RENDER_OPTIONS);
  assertEquals(result.includes("@starting-style"), true);
});

// =============================================================================
// Document Rendering Tests
// =============================================================================

Deno.test("renderCss renders multiple rules", () => {
  const rules: ast.CssRule[] = [
    ast.styleRule(ast.select.cls("a"), { color: "red" }),
    ast.styleRule(ast.select.cls("b"), { color: "blue" }),
  ];
  assertEquals(ast.renderCss(rules), ".a{color:red;}.b{color:blue;}");
});

Deno.test("renderCss with normal options", () => {
  const rules: ast.CssRule[] = [
    ast.styleRule(ast.select.cls("a"), { color: "red" }),
    ast.styleRule(ast.select.cls("b"), { color: "blue" }),
  ];
  assertEquals(
    ast.renderCss(rules, ast.NORMAL_RENDER_OPTIONS),
    `.a {
  color: red;
}
.b {
  color: blue;
}`,
  );
});

Deno.test("renderCss integration example", () => {
  const rules: ast.CssRule[] = [
    ast.styleRule(ast.select.cls("button"), {
      padding: "8px 16px",
      backgroundColor: "blue",
    }),
    ast.mediaRule("(min-width: 768px)", [
      ast.styleRule(ast.select.cls("button"), { padding: "12px 24px" }),
    ]),
  ];
  assertEquals(
    ast.renderCss(rules, ast.NORMAL_RENDER_OPTIONS),
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
