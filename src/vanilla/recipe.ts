import type { StyleInput } from "../combinators/types.ts";
import type {
  RecipeFunction,
  RecipeOptions,
  VariantDefinitions,
  VariantSelection,
} from "./types.ts";
import { style } from "./style.ts";

export function recipe<V extends VariantDefinitions>(
  options: RecipeOptions<V>,
  debugName?: string,
): RecipeFunction<V> {
  // Generate base class
  const baseClassName = options.base
    ? style(options.base, debugName ? `${debugName}_base` : undefined)
    : "";

  // Generate variant classes
  const variantClassNames = {} as {
    [K in keyof V]: Record<keyof V[K], string>;
  };

  if (options.variants) {
    for (
      const [variantName, variantOptions] of Object.entries(
        options.variants,
      )
    ) {
      variantClassNames[variantName as keyof V] = {} as Record<
        keyof V[keyof V],
        string
      >;

      for (
        const [optionName, optionStyle] of Object.entries(
          variantOptions as Record<string, StyleInput>,
        )
      ) {
        const className = style(
          optionStyle,
          debugName ? `${debugName}_${variantName}_${optionName}` : undefined,
        );
        (variantClassNames[variantName as keyof V] as Record<string, string>)[
          optionName
        ] = className;
      }
    }
  }

  // Generate compound variant classes
  const compoundClassNames: Array<{
    condition: Partial<VariantSelection<V>>;
    className: string;
  }> = [];

  if (options.compoundVariants) {
    for (const compound of options.compoundVariants) {
      const className = style(
        compound.style,
        debugName ? `${debugName}_compound` : undefined,
      );
      compoundClassNames.push({ condition: compound.variants, className });
    }
  }

  // The recipe function
  const recipeFn = (selection?: VariantSelection<V>): string => {
    const classes: string[] = [];

    if (baseClassName) classes.push(baseClassName);

    // Apply defaults then selection
    const resolved = {
      ...options.defaultVariants,
      ...selection,
    } as VariantSelection<V>;

    // Add variant classes
    for (const [variantName, optionName] of Object.entries(resolved)) {
      if (
        optionName !== undefined &&
        variantClassNames[variantName as keyof V]
      ) {
        const className = (
          variantClassNames[variantName as keyof V] as Record<string, string>
        )[optionName as string];
        if (className) classes.push(className);
      }
    }

    // Check compound variants
    for (const { condition, className } of compoundClassNames) {
      const matches = Object.entries(condition).every(
        ([k, v]) => resolved[k as keyof V] === v,
      );
      if (matches) classes.push(className);
    }

    return classes.join(" ");
  };

  recipeFn.variants = () => Object.keys(options.variants ?? {}) as (keyof V)[];
  recipeFn.classNames = { base: baseClassName, variants: variantClassNames };

  return recipeFn as RecipeFunction<V>;
}
