import { assertEquals } from "jsr:@std/assert";
import {
  pixelify,
  toKebabCase,
  transformProperties,
} from "../../src/combinators/transform.ts";

Deno.test("toKebabCase converts camelCase to kebab-case", () => {
  assertEquals(toKebabCase("backgroundColor"), "background-color");
  assertEquals(toKebabCase("borderTopLeftRadius"), "border-top-left-radius");
  assertEquals(toKebabCase("color"), "color");
  assertEquals(toKebabCase("zIndex"), "z-index");
});

Deno.test("pixelify adds px to numbers for dimensional properties", () => {
  assertEquals(pixelify("padding", 10), "10px");
  assertEquals(pixelify("margin", 20), "20px");
  assertEquals(pixelify("width", 100), "100px");
  assertEquals(pixelify("fontSize", 16), "16px");
});

Deno.test("pixelify does not add px to zero", () => {
  assertEquals(pixelify("padding", 0), "0");
  assertEquals(pixelify("margin", 0), "0");
});

Deno.test("pixelify does not add px to unitless properties", () => {
  assertEquals(pixelify("opacity", 0.5), "0.5");
  assertEquals(pixelify("zIndex", 10), "10");
  assertEquals(pixelify("fontWeight", 700), "700");
  assertEquals(pixelify("flexGrow", 1), "1");
  assertEquals(pixelify("lineHeight", 1.5), "1.5");
});

Deno.test("pixelify passes through strings unchanged", () => {
  assertEquals(pixelify("padding", "10px"), "10px");
  assertEquals(pixelify("color", "red"), "red");
  assertEquals(pixelify("background", "url(image.png)"), "url(image.png)");
});

Deno.test("transformProperties converts full style object", () => {
  const result = transformProperties({
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
  const result = transformProperties({
    color: "red",
    vars: { primaryColor: "blue" },
    selectors: { "&:hover": { color: "green" } },
  } as Record<string, unknown>);

  assertEquals(result.length, 1);
  assertEquals(result[0], { name: "color", value: "red" });
});

Deno.test("transformProperties filters out @-rules", () => {
  const result = transformProperties({
    color: "red",
    "@media": { "(min-width: 768px)": { color: "blue" } },
  } as Record<string, unknown>);

  assertEquals(result.length, 1);
  assertEquals(result[0], { name: "color", value: "red" });
});
