import { style } from "../vanilla/index.ts";
import { THEME_COLORS } from "./config.ts";

function createColorClasses(): Record<string, string> {
  const classes: Record<string, string> = {};

  for (const theme of THEME_COLORS) {
    // ct-{theme} - full theme (foreground + background + border)
    classes[`ct-${theme.label}`] = style(
      {
        color: theme.foreground,
        backgroundColor: theme.background,
        borderColor: theme.edge,
      },
      `ct-${theme.label}`,
    );

    // cf-{theme} - foreground only
    classes[`cf-${theme.label}`] = style(
      { color: theme.foreground },
      `cf-${theme.label}`,
    );

    // cb-{theme} - background only
    classes[`cb-${theme.label}`] = style(
      { backgroundColor: theme.background },
      `cb-${theme.label}`,
    );

    // ce-{theme} - edge (border-color) only
    classes[`ce-${theme.label}`] = style(
      { borderColor: theme.edge },
      `ce-${theme.label}`,
    );

    // Pseudo-class variants (e.g., ct-focus-on-focus, ct-error-on-invalid)
    if (theme.pseudoClasses) {
      for (const pseudo of theme.pseudoClasses) {
        classes[`ct-${theme.label}-on-${pseudo}`] = style(
          {
            selectors: {
              [`&:${pseudo}`]: {
                color: theme.foreground,
                backgroundColor: theme.background,
                borderColor: theme.edge,
              },
            },
          },
          `ct-${theme.label}-on-${pseudo}`,
        );
      }
    }
  }

  return classes;
}

export const color = createColorClasses();
