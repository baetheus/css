import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
  compileStyle,
  mergeStyles,
  validateSelector,
} from "../../src/combinators/index.ts";
import { renderCss } from "../../src/ast/index.ts";

Deno.test("compileStyle creates simple StyleRule", () => {
  const rules = compileStyle("button", {
    color: "blue",
    padding: 10,
  });

  assertEquals(rules.length, 1);
  assertEquals(rules[0].type, "style");

  const css = renderCss({ rules });
  assertEquals(
    css,
    `.button {
  color: blue;
  padding: 10px;
}`,
  );
});

Deno.test("compileStyle handles CSS variables in vars", () => {
  const rules = compileStyle("button", {
    vars: { primaryColor: "#007bff", spacing: "8px" },
    color: "red",
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("button", {
    color: "blue",
    selectors: {
      "&:hover": { color: "darkblue" },
      "&:active": { color: "navy" },
    },
  });

  assertEquals(rules.length, 3);

  const css = renderCss({ rules });
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
  const rules = compileStyle("card", {
    padding: 16,
    selectors: {
      "& .title": { fontSize: 20 },
      "&:hover .icon": { opacity: 1 },
    },
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("button", {
    padding: 8,
    "@media": {
      "(min-width: 768px)": { padding: 16 },
    },
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("grid", {
    display: "block",
    "@supports": {
      "(display: grid)": { display: "grid" },
    },
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("card", {
    padding: 8,
    "@container": {
      "(min-width: 300px)": { padding: 16 },
    },
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("button", {
    color: "blue",
    "@layer": {
      utilities: { display: "flex" },
    },
  });

  const css = renderCss({ rules });
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
  const rules = compileStyle("button", {
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
  const result = mergeStyles(
    { color: "red", padding: 10 },
    { color: "blue", margin: 20 },
  );

  assertEquals(result.color, "blue");
  assertEquals(result.padding, 10);
  assertEquals(result.margin, 20);
});

Deno.test("mergeStyles deep merges vars", () => {
  const result = mergeStyles(
    { vars: { primary: "red", secondary: "green" } },
    { vars: { primary: "blue" } },
  );

  assertEquals(result.vars, { primary: "blue", secondary: "green" });
});

Deno.test("mergeStyles deep merges selectors", () => {
  const result = mergeStyles(
    { selectors: { "&:hover": { color: "red" } } },
    { selectors: { "&:active": { color: "blue" } } },
  );

  assertEquals(result.selectors, {
    "&:hover": { color: "red" },
    "&:active": { color: "blue" },
  });
});

Deno.test("mergeStyles deep merges @media", () => {
  const result = mergeStyles(
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

  const rules = compileStyle("button", [base, override]);
  const css = renderCss({ rules });

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

  const rules = compileStyle("button", [[a, b], c]);
  const css = renderCss({ rules });

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
    () => validateSelector(".other"),
    Error,
    "must reference the element with &",
  );
});

Deno.test("compileStyle throws for invalid nested selector", () => {
  assertThrows(
    () =>
      compileStyle("button", {
        selectors: { ".invalid": { color: "red" } },
      }),
    Error,
    "must reference the element with &",
  );
});

Deno.test("compileStyle creates no rules for empty style", () => {
  const rules = compileStyle("empty", {});
  assertEquals(rules.length, 0);
});

Deno.test("full example from phase-2 spec", () => {
  const rules = compileStyle("button", {
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

  const css = renderCss({ rules });
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
