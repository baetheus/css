# CSS-in-TypeScript Library Plan

## Context

**Problem**: The nullpub/css Sass library provides a comprehensive set of utility classes but is tied to the Sass build system. We want a pure TypeScript solution that can generate CSS at runtime or build-time without Sass dependencies.

**Approach**: Build a layered CSS library with vanilla-extract compatible APIs, then implement the nullpub utility classes on top. The library focuses on CSS AST representation and string rendering (no DOM injection yet).

**Key decisions**:
- Content-addressable class naming (hash of properties, configurable)
- API-compatible with vanilla-extract
- Include recipes API for variants
- No external dependencies for core (csstype for types only)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Phase 4: Nullpub CSS Theme                         │
│  (Utility classes: spacing, flex, colors, etc.)     │
├─────────────────────────────────────────────────────┤
│  Phase 3: Vanilla Extract Overlay                   │
│  (style, globalStyle, createTheme, recipe, etc.)    │
├─────────────────────────────────────────────────────┤
│  Phase 2: Constrained CSS Combinators               │
│  (Type-safe properties, validation, transforms)     │
├─────────────────────────────────────────────────────┤
│  Phase 1: CSS AST                                   │
│  (Core data structures + renderCss)                 │
└─────────────────────────────────────────────────────┘
```

## Phase Files

- [Phase 1: CSS AST](./phase-1-css-ast.md)
- [Phase 2: Constrained CSS Combinators](./phase-2-combinators.md)
- [Phase 3: Vanilla Extract Overlay](./phase-3-vanilla.md)
- [Phase 4: Nullpub CSS Theme](./phase-4-theme.md)

## File Structure

```
src/
  ast/           # Phase 1
  combinators/   # Phase 2
  vanilla/       # Phase 3
  theme/         # Phase 4
  index.ts
tests/
  ast/
  combinators/
  vanilla/
  theme/
deno.json
```

## Verification

After each phase:
1. Run `deno test` to verify tests pass
2. Run `deno check src/` to verify types
3. Generate sample CSS output and inspect for correctness

Final verification:
- Generate the full nullpub CSS output
- Compare utility class names and properties with original Sass output
- Test responsive variants at each breakpoint
