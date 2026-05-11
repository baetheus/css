# CSS Types Reference Notes

## Selectors

### Simple Selectors (atomic units)

| Selector Type     | Example                   | Simple | Compound | Complex |
| ----------------- | ------------------------- | ------ | -------- | ------- |
| HtmlElement       | `div`, `span`             | Yes    | Yes      | Yes     |
| ClassSelector     | `.button`                 | Yes    | Yes      | Yes     |
| IdSelector        | `#main`                   | Yes    | Yes      | Yes     |
| UniversalSelector | `*`                       | Yes    | Yes      | Yes     |
| ParentSelector    | `&`                       | Yes    | Yes      | Yes     |
| AttributeSelector | `[href]`, `[type="text"]` | Yes    | Yes      | Yes     |

### Pseudo-Class Selectors (attach to simple selectors)

| Selector Type      | Example                                         | Simple | Compound | Complex |
| ------------------ | ----------------------------------------------- | ------ | -------- | ------- |
| PseudoClassValue   | `:hover`, `:focus`, `:first-child`              | No*    | Yes      | Yes     |
| FunctionClassValue | `:nth-child(2n)`, `:is(.a, .b)`, `:has(.child)` | No*    | Yes      | Yes     |

*Pseudo-classes cannot stand alone; they must attach to a simple selector (or
implicitly to `*`).

### Pseudo-Element Selectors (attach to compound selectors)

| Selector Type      | Example                                | Simple | Compound | Complex |
| ------------------ | -------------------------------------- | ------ | -------- | ------- |
| PseudoElementValue | `::before`, `::after`, `::placeholder` | No*    | Yes      | Yes     |

*Pseudo-elements must appear at the end of a compound selector.

### Selector Combinators (for complex selectors only)

| Combinator | Name             | Example   |
| ---------- | ---------------- | --------- |
| `` (space) | Descendant       | `div p`   |
| `>`        | Child            | `ul > li` |
| `+`        | Adjacent sibling | `h1 + p`  |
| `~`        | General sibling  | `h1 ~ p`  |

---

## At-Rules

### Nesting Capabilities

| At-Rule              | Under Root | Under @layer | Under @media | Under @supports | Under @container | Under @scope | Under Class/Selector |
| -------------------- | ---------- | ------------ | ------------ | --------------- | ---------------- | ------------ | -------------------- |
| @media               | Yes        | Yes          | Yes          | Yes             | Yes              | Yes          | Yes                  |
| @supports            | Yes        | Yes          | Yes          | Yes             | Yes              | Yes          | Yes                  |
| @scope               | Yes        | Yes          | Yes          | Yes             | Yes              | Yes          | Yes                  |
| @starting-style      | Yes        | Yes          | Yes          | Yes             | Yes              | Yes          | Yes                  |
| @container           | Yes        | Yes          | Yes          | Yes             | No               | Yes          | Yes                  |
| @layer               | Yes        | Yes          | Yes          | Yes             | Yes              | No           | No                   |
| @font-face           | Yes        | Yes          | Yes          | Yes             | No               | No           | No                   |
| @keyframes           | Yes        | Yes          | Yes          | No              | No               | No           | No                   |
| @page                | Yes        | Yes          | No           | No              | No               | No           | No                   |
| @property            | Yes        | Yes          | No           | No              | No               | No           | No                   |
| @counter-style       | Yes        | Yes          | No           | No              | No               | No           | No                   |
| @font-feature-values | Yes        | No           | No           | No              | No               | No           | No                   |
| @font-palette-values | Yes        | No           | No           | No              | No               | No           | No                   |
| @color-profile       | Yes        | No           | No           | No              | No               | No           | No                   |
| @import              | Yes        | No           | No           | No              | No               | No           | No                   |
| @charset             | Yes        | No           | No           | No              | No               | No           | No                   |
| @namespace           | Yes        | No           | No           | No              | No               | No           | No                   |
