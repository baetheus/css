import type { StyleInput, StyleObject } from "../combinators/types.ts";
import { transformProperties } from "../combinators/transform.ts";
import { createVarAssignments } from "../combinators/variables.ts";
import { mergeStyles } from "../combinators/compile.ts";
import { mediaRule, styleRule } from "../ast/builders.ts";
import { getRegistry } from "./registry.ts";

export function globalStyle(selector: string, input: StyleInput): void {
  const style: StyleObject = Array.isArray(input)
    ? mergeStyles(...input)
    : (input as StyleObject);

  const properties = [
    ...createVarAssignments(style.vars ?? {}),
    ...transformProperties(style),
  ];

  if (properties.length > 0) {
    const rule = styleRule({ type: "simple", value: selector }, properties);
    getRegistry().addGlobal([rule]);
  }

  // Handle nested at-rules for global styles
  if (style["@media"]) {
    for (const [query, nested] of Object.entries(style["@media"])) {
      const nestedStyle: StyleObject = Array.isArray(nested)
        ? mergeStyles(...nested)
        : nested;
      const nestedProps = [
        ...createVarAssignments(nestedStyle.vars ?? {}),
        ...transformProperties(nestedStyle),
      ];
      if (nestedProps.length > 0) {
        const nestedRule = styleRule(
          { type: "simple", value: selector },
          nestedProps,
        );
        getRegistry().addGlobal([mediaRule(query, [nestedRule])]);
      }
    }
  }
}
