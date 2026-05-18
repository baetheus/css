import type {
  AttributeSelector,
  ClassSelector,
  HtmlElement,
  IDSelector,
  ParentSelector,
  PseudoClass,
  PseudoClassFunctional,
  PseudoClassSimple,
  PseudoElement,
  RawSelector,
  Selector,
  SimpleSelectors,
  UniversalSelector,
} from "../selectors.ts";

// =============================================================================
// Type test stubs
// =============================================================================

/** Stub function to exercise valid Selector types at compile time */
function select(_s: Selector): void {}

/** Type that rejects any valid Selector */
type NonSelector<T> = T extends RawSelector ? never : T;

/** Stub function to verify values are NOT valid Selectors */
function unselect<T>(_s: NonSelector<T>): void {}

// =============================================================================
// Positive type tests - valid selectors
// =============================================================================

// HtmlElement selectors
Deno.test("select - accepts sectioning elements", () => {
  select("html");
  select("body");
  select("article");
  select("section");
  select("nav");
  select("aside");
  select("h1");
  select("h2");
  select("h3");
  select("h4");
  select("h5");
  select("h6");
  select("hgroup");
  select("header");
  select("footer");
  select("address");
  select("main");
});

Deno.test("select - accepts grouping elements", () => {
  select("p");
  select("hr");
  select("pre");
  select("blockquote");
  select("ol");
  select("ul");
  select("menu");
  select("li");
  select("dl");
  select("dt");
  select("dd");
  select("figure");
  select("figcaption");
  select("div");
});

Deno.test("select - accepts text-level elements", () => {
  select("a");
  select("em");
  select("strong");
  select("small");
  select("s");
  select("cite");
  select("q");
  select("dfn");
  select("abbr");
  select("ruby");
  select("rt");
  select("rp");
  select("data");
  select("time");
  select("code");
  select("var");
  select("samp");
  select("kbd");
  select("sub");
  select("sup");
  select("i");
  select("b");
  select("u");
  select("mark");
  select("bdi");
  select("bdo");
  select("span");
  select("br");
  select("wbr");
});

Deno.test("select - accepts edit elements", () => {
  select("ins");
  select("del");
});

Deno.test("select - accepts embedded elements", () => {
  select("picture");
  select("img");
  select("iframe");
  select("embed");
  select("object");
  select("video");
  select("audio");
  select("map");
  select("canvas");
});

Deno.test("select - accepts tabular elements", () => {
  select("table");
  select("caption");
  select("colgroup");
  select("col");
  select("tbody");
  select("thead");
  select("tfoot");
  select("tr");
  select("td");
  select("th");
});

Deno.test("select - accepts form elements", () => {
  select("form");
  select("label");
  select("input");
  select("button");
  select("select");
  select("datalist");
  select("optgroup");
  select("option");
  select("textarea");
  select("output");
  select("progress");
  select("meter");
  select("fieldset");
  select("legend");
});

Deno.test("select - accepts interactive elements", () => {
  select("details");
  select("summary");
  select("dialog");
});

Deno.test("select - accepts scripting elements", () => {
  select("noscript");
  select("slot");
});

Deno.test("select - accepts SVG elements", () => {
  select("svg");
  select("g");
  select("path");
  select("circle");
  select("ellipse");
  select("line");
  select("polyline");
  select("polygon");
  select("rect");
  select("text");
  select("tspan");
  select("textPath");
  select("image");
  select("use");
  select("foreignObject");
});

Deno.test("select - accepts MathML elements", () => {
  select("math");
  select("mi");
  select("mn");
  select("mo");
  select("ms");
  select("mtext");
  select("mrow");
  select("mfrac");
  select("msqrt");
  select("mroot");
  select("msub");
  select("msup");
  select("msubsup");
  select("munder");
  select("mover");
  select("munderover");
  select("mtable");
  select("mtr");
  select("mtd");
});

Deno.test("select - accepts universal selector", () => {
  select("*");
});

Deno.test("select - accepts parent selectors", () => {
  select("&");
  select("&:hover");
  select("&:focus");
  select("& > span");
  select("&.active");
  select("&#id");
  select("&[disabled]");
  select("& + p");
  select("& ~ div");
});

Deno.test("select - accepts class selectors", () => {
  select(".button");
  select(".my-class");
  select(".BEM__block--modifier");
  select(".camelCase");
  select(".-leading-dash");
  select("._underscore");
});

Deno.test("select - accepts ID selectors", () => {
  select("#main");
  select("#my-id");
  select("#camelCaseId");
  select("#id123");
});

Deno.test("select - accepts attribute selectors", () => {
  select("[disabled]");
  select('[type="text"]');
  select("[data-value]");
  select('[href^="https"]');
  select('[class*="btn"]');
  select('[lang|="en"]');
  select("[title~='word']");
  select('[href$=".pdf"]');
});

Deno.test("select - accepts simple pseudo-classes (user action)", () => {
  select(":active");
  select(":hover");
  select(":focus");
  select(":focus-visible");
  select(":focus-within");
});

Deno.test("select - accepts simple pseudo-classes (link)", () => {
  select(":link");
  select(":visited");
  select(":any-link");
  select(":local-link");
  select(":target");
  select(":target-within");
});

Deno.test("select - accepts simple pseudo-classes (input state)", () => {
  select(":enabled");
  select(":disabled");
  select(":read-only");
  select(":read-write");
  select(":placeholder-shown");
  select(":autofill");
  select(":default");
  select(":checked");
  select(":indeterminate");
});

Deno.test("select - accepts simple pseudo-classes (validation)", () => {
  select(":valid");
  select(":invalid");
  select(":in-range");
  select(":out-of-range");
  select(":required");
  select(":optional");
  select(":user-valid");
  select(":user-invalid");
});

Deno.test("select - accepts simple pseudo-classes (tree-structural)", () => {
  select(":root");
  select(":empty");
  select(":first-child");
  select(":last-child");
  select(":only-child");
  select(":first-of-type");
  select(":last-of-type");
  select(":only-of-type");
});

Deno.test("select - accepts simple pseudo-classes (resource state)", () => {
  select(":playing");
  select(":paused");
  select(":seeking");
  select(":buffering");
  select(":stalled");
  select(":muted");
  select(":volume-locked");
});

Deno.test("select - accepts simple pseudo-classes (time-dimensional)", () => {
  select(":current");
  select(":past");
  select(":future");
});

Deno.test("select - accepts simple pseudo-classes (display state)", () => {
  select(":fullscreen");
  select(":modal");
  select(":picture-in-picture");
  select(":open");
  select(":closed");
  select(":popover-open");
});

Deno.test("select - accepts simple pseudo-classes (printing)", () => {
  select(":first");
  select(":left");
  select(":right");
  select(":blank");
});

Deno.test("select - accepts simple pseudo-classes (misc)", () => {
  select(":defined");
  select(":scope");
});

Deno.test("select - accepts functional pseudo-classes", () => {
  select(":dir(ltr)");
  select(":dir(rtl)");
  select(":has(.child)");
  select(":has(> img)");
  select(":is(button, a)");
  select(":is(h1, h2, h3)");
  select(":lang(en)");
  select(":lang(zh-Hans)");
  select(":not(.disabled)");
  select(":not(:first-child)");
  select(":nth-child(2n+1)");
  select(":nth-child(odd)");
  select(":nth-col(2)");
  select(":nth-last-child(3)");
  select(":nth-last-col(1)");
  select(":nth-last-of-type(2)");
  select(":nth-of-type(even)");
  select(":where(section, article)");
});

Deno.test("select - accepts pseudo-elements", () => {
  select("::after");
  select("::before");
  select("::first-letter");
  select("::first-line");
});

Deno.test("select - accepts nestable at-rules", () => {
  select("@media");
  select("@media screen");
  select("@media (min-width: 768px)");
  select("@supports (display: grid)");
  select("@container");
  select("@container (min-width: 300px)");
  select("@layer");
  select("@layer utilities");
  select("@scope");
  select("@scope (.card)");
  select("@scope (.card) to (.footer)");
  select("@starting-style");
});

Deno.test("select - accepts arbitrary strings (escape hatch)", () => {
  select("div > p");
  select("ul li");
  select("input[type='checkbox']:checked + label");
  select(".parent .child");
  select("custom-element");
  select("my-web-component");
});

// =============================================================================
// Negative type tests - invalid selectors
// =============================================================================

Deno.test("unselect - rejects invalid pseudo-classes", () => {
  unselect(":notapseudo");
  unselect(":hover");
});

Deno.test("unselect - rejects invalid element names", () => {
  unselect("abba");
});

// =============================================================================
// Type narrowing tests
// =============================================================================

Deno.test("type narrowing - HtmlElement is subset of Selector", () => {
  const el: HtmlElement = "div";
  select(el);
});

Deno.test("type narrowing - UniversalSelector is subset of Selector", () => {
  const universal: UniversalSelector = "*";
  select(universal);
});

Deno.test("type narrowing - ParentSelector is subset of Selector", () => {
  const parent: ParentSelector = "&:hover";
  select(parent);
});

Deno.test("type narrowing - ClassSelector is subset of Selector", () => {
  const cls: ClassSelector = ".button";
  select(cls);
});

Deno.test("type narrowing - IDSelector is subset of Selector", () => {
  const id: IDSelector = "#main";
  select(id);
});

Deno.test("type narrowing - AttributeSelector is subset of Selector", () => {
  const attr: AttributeSelector = "[disabled]";
  select(attr);
});

Deno.test("type narrowing - SimpleSelectors is subset of Selector", () => {
  const simple: SimpleSelectors = "span";
  select(simple);
});

Deno.test("type narrowing - PseudoClassSimple is subset of Selector", () => {
  const pseudo: PseudoClassSimple = ":hover";
  select(pseudo);
});

Deno.test("type narrowing - PseudoClassFunctional is subset of Selector", () => {
  const pseudo: PseudoClassFunctional = ":nth-child(2n)";
  select(pseudo);
});

Deno.test("type narrowing - PseudoClass is subset of Selector", () => {
  const pseudo: PseudoClass = ":focus";
  select(pseudo);
});

Deno.test("type narrowing - PseudoElement is subset of Selector", () => {
  const pseudo: PseudoElement = "::before";
  select(pseudo);
});
