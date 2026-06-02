import { assertEquals, assertNotEquals } from "@std/assert";
import {
  isStyle,
  join,
  MINIMAL_RENDER_OPTIONS,
  properties,
  render,
  type RenderOptions,
  type SelectorInput,
  STANDARD_RENDER_OPTIONS,
  type Style,
  style,
  type StyleInput,
  use,
} from "../style.ts";

// =============================================================================
// style tests
// =============================================================================

Deno.test("style - creates Style with auto-generated class name", () => {
  const btn = style({ color: "red" });
  assertEquals(btn.toString().startsWith("."), true);
});

Deno.test("style - returns consistent class name for same input", () => {
  const btn1 = style({ color: "red" });
  const btn2 = style({ color: "red" });
  assertEquals(btn1.toString(), btn2.toString());
});

Deno.test("style - returns different class names for different inputs", () => {
  const btn1 = style({ color: "red" });
  const btn2 = style({ color: "blue" });
  assertNotEquals(btn1.toString(), btn2.toString());
});

Deno.test("style - accepts custom selector", () => {
  const heading = style("h1", { fontSize: "2rem" });
  assertEquals(heading.toString(), "h1");
});

Deno.test("style - accepts class selector", () => {
  const btn = style(".button", { padding: "8px" });
  assertEquals(btn.toString(), ".button");
});

Deno.test("style - accepts ID selector", () => {
  const main = style("#main", { width: "100%" });
  assertEquals(main.toString(), "#main");
});

Deno.test("style - accepts pseudo-class selectors", () => {
  const link = style("a:hover", { color: "blue" });
  assertEquals(link.toString(), "a:hover");
});

Deno.test("style - accepts nested selectors", () => {
  const btn = style({
    color: "white",
    select: {
      "&:hover": { color: "blue" },
    },
  });
  assertEquals(typeof btn.toString(), "string");
});

// =============================================================================
// isStyle tests
// =============================================================================

Deno.test("isStyle - returns true for Style objects", () => {
  const btn = style({ color: "red" });
  assertEquals(isStyle(btn), true);
});

Deno.test("isStyle - returns false for plain objects", () => {
  assertEquals(isStyle({ color: "red" }), false);
});

Deno.test("isStyle - returns false for null", () => {
  assertEquals(isStyle(null), false);
});

Deno.test("isStyle - returns false for undefined", () => {
  assertEquals(isStyle(undefined), false);
});

Deno.test("isStyle - returns false for strings", () => {
  assertEquals(isStyle(".button"), false);
});

Deno.test("isStyle - returns false for arrays", () => {
  assertEquals(isStyle([]), false);
});

Deno.test("isStyle - returns false for numbers", () => {
  assertEquals(isStyle(42), false);
});

// =============================================================================
// properties tests
// =============================================================================

Deno.test("properties - returns input unchanged", () => {
  const input: StyleInput = { color: "red", padding: "8px" };
  const result = properties(input);
  assertEquals(result, input);
});

Deno.test("properties - preserves nested selectors", () => {
  const input: StyleInput = {
    color: "white",
    select: { "&:hover": { color: "blue" } },
  };
  const result = properties(input);
  assertEquals(result, input);
});

Deno.test("properties - preserves custom properties", () => {
  const input: StyleInput = { "--primary": "blue" };
  const result = properties(input);
  assertEquals(result["--primary"], "blue");
});

// =============================================================================
// use tests
// =============================================================================

Deno.test("use - joins single style", () => {
  const btn = style({ color: "red" });
  const result = use(btn);
  assertEquals(result, btn.toString());
});

Deno.test("use - joins multiple styles with space", () => {
  const base = style({ padding: "8px" });
  const active = style({ color: "blue" });
  const result = use(base, active);
  assertEquals(result, `${base.toString()} ${active.toString()}`);
});

Deno.test("use - handles three styles", () => {
  const a = style({ padding: "8px" });
  const b = style({ color: "blue" });
  const c = style({ margin: "4px" });
  const result = use(a, b, c);
  assertEquals(result, `${a.toString()} ${b.toString()} ${c.toString()}`);
});

// =============================================================================
// render tests
// =============================================================================

Deno.test("render - renders single style with standard options", () => {
  const btn = style(".btn", { color: "red" });
  const css = render(btn);
  assertEquals(css.includes(".btn"), true);
  assertEquals(css.includes("color"), true);
  assertEquals(css.includes("red"), true);
});

Deno.test("render - converts camelCase to kebab-case", () => {
  const btn = style(".btn", { backgroundColor: "blue" });
  const css = render(btn);
  assertEquals(css.includes("background-color"), true);
});

Deno.test("render - preserves custom properties (--*)", () => {
  const vars = style(":root", { "--primary": "blue" } as StyleInput);
  const css = render(vars);
  assertEquals(css.includes("--primary"), true);
});

Deno.test("render - renders multiple styles with join", () => {
  const btn = style(".btn", { color: "white" });
  const heading = style("h1", { fontSize: "2rem" });
  const css = render(join(btn, heading));
  assertEquals(css.includes(".btn"), true);
  assertEquals(css.includes("h1"), true);
});

Deno.test("render - accepts explicit standard options", () => {
  const btn = style(".btn", { color: "red" });
  const css = render(btn, STANDARD_RENDER_OPTIONS);
  assertEquals(css.includes("\n"), true);
  assertEquals(css.includes("  "), true);
});

Deno.test("render - accepts minimal options", () => {
  const btn = style(".btn", { color: "red" });
  const css = render(btn, MINIMAL_RENDER_OPTIONS);
  assertEquals(css.includes("\n"), false);
  assertEquals(css.includes("  "), false);
});

Deno.test("render - renders nested selectors", () => {
  const btn = style(".btn", {
    color: "white",
    select: {
      "&:hover": { color: "blue" },
    },
  });
  const css = render(btn);
  assertEquals(css.includes("&:hover"), true);
  assertEquals(css.includes("blue"), true);
});

Deno.test("render - handles deeply nested selectors", () => {
  const btn = style(".btn", {
    color: "white",
    select: {
      "&:hover": {
        color: "blue",
        select: {
          "& span": { fontWeight: "bold" },
        },
      },
    },
  });
  const css = render(btn);
  assertEquals(css.includes("& span"), true);
  assertEquals(css.includes("font-weight"), true);
});

Deno.test("render - handles number values", () => {
  const box = style(".box", { zIndex: 10, opacity: 0.5 });
  const css = render(box);
  assertEquals(css.includes("z-index"), true);
  assertEquals(css.includes("10"), true);
  assertEquals(css.includes("0.5"), true);
});

Deno.test("render - handles empty select object", () => {
  const btn = style(".btn", {
    color: "white",
    select: {},
  });
  const css = render(btn);
  assertEquals(css.includes(".btn"), true);
});

Deno.test("render - handles undefined select values", () => {
  const btn = style(".btn", {
    color: "white",
    select: {
      "&:hover": undefined,
    } as SelectorInput,
  });
  const css = render(btn);
  assertEquals(css.includes(".btn"), true);
});

Deno.test("render - renders same style twice correctly", () => {
  const btn = style(".btn", { color: "red" });
  const css1 = render(btn);
  const css2 = render(btn);
  assertEquals(css1, css2);
});

// =============================================================================
// RenderOptions tests
// =============================================================================

Deno.test("STANDARD_RENDER_OPTIONS - has expected values", () => {
  assertEquals(STANDARD_RENDER_OPTIONS.newline, "\n");
  assertEquals(STANDARD_RENDER_OPTIONS.indent, "  ");
  assertEquals(STANDARD_RENDER_OPTIONS.space, " ");
});

Deno.test("MINIMAL_RENDER_OPTIONS - has expected values", () => {
  assertEquals(MINIMAL_RENDER_OPTIONS.newline, "");
  assertEquals(MINIMAL_RENDER_OPTIONS.indent, "");
  assertEquals(MINIMAL_RENDER_OPTIONS.space, "");
});

Deno.test("render - custom options work correctly", () => {
  const customOptions: RenderOptions = {
    newline: "\r\n",
    indent: "\t",
    space: " ",
  };
  const btn = style(".btn", { color: "red" });
  const css = render(btn, customOptions);
  assertEquals(css.includes("\r\n"), true);
  assertEquals(css.includes("\t"), true);
});

// =============================================================================
// Type verification tests
// =============================================================================

Deno.test("StyleInput - accepts CSS properties", () => {
  const input: StyleInput = {
    color: "red",
    backgroundColor: "blue",
    padding: "8px",
    margin: 0,
  };
  assertEquals(input.color, "red");
});

Deno.test("StyleInput - accepts custom properties", () => {
  const input: StyleInput = {
    "--primary": "blue",
    "--spacing": 8,
  };
  assertEquals(input["--primary"], "blue");
});

Deno.test("StyleInput - accepts select property", () => {
  const input: StyleInput = {
    color: "white",
    select: {
      "&:hover": { color: "blue" },
      "& > span": { fontWeight: "bold" },
    },
  };
  assertEquals(input.select?.["&:hover"]?.color, "blue");
});

Deno.test("SelectorInput - maps selectors to style inputs", () => {
  const input: SelectorInput = {
    "&:hover": { opacity: 0.8 },
    "&:focus": { outline: "2px solid blue" },
    "& span": { color: "inherit" },
  };
  assertEquals(input["&:hover"]?.opacity, 0.8);
});

Deno.test("Style - has toString method", () => {
  const btn: Style = style({ color: "red" });
  assertEquals(typeof btn.toString, "function");
  assertEquals(typeof btn.toString(), "string");
});

// =============================================================================
// join tests
// =============================================================================

Deno.test("join - combines two styles", () => {
  const a = style(".a", { color: "red" });
  const b = style(".b", { color: "blue" });
  const combined = join(a, b);
  const css = render(combined);
  assertEquals(css.includes(".a"), true);
  assertEquals(css.includes(".b"), true);
  assertEquals(css.includes("red"), true);
  assertEquals(css.includes("blue"), true);
});

Deno.test("join - toString returns space-separated selectors", () => {
  const a = style(".a", { color: "red" });
  const b = style(".b", { color: "blue" });
  const combined = join(a, b);
  assertEquals(combined.toString(), ".a .b");
});

Deno.test("join - supports nested joins", () => {
  const a = style(".a", { color: "red" });
  const b = style(".b", { color: "blue" });
  const c = style(".c", { color: "green" });
  const combined = join(a, join(b, c));
  const css = render(combined);
  assertEquals(css.includes(".a"), true);
  assertEquals(css.includes(".b"), true);
  assertEquals(css.includes(".c"), true);
});

Deno.test("join - preserves order of blocks", () => {
  const a = style(".first", { color: "red" });
  const b = style(".second", { color: "blue" });
  const c = style(".third", { color: "green" });
  const combined = join(a, b, c);
  const css = render(combined);
  const firstIndex = css.indexOf(".first");
  const secondIndex = css.indexOf(".second");
  const thirdIndex = css.indexOf(".third");
  assertEquals(firstIndex < secondIndex, true);
  assertEquals(secondIndex < thirdIndex, true);
});

Deno.test("join - can be rendered multiple times", () => {
  const a = style(".a", { color: "red" });
  const b = style(".b", { color: "blue" });
  const combined = join(a, b);
  const css1 = render(combined);
  const css2 = render(combined);
  assertEquals(css1, css2);
});
