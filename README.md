# CSS

This is a standalone css library--no required js, no dependencies, no footguns.
I'm just tired of learning how to write easy css in complicated frameworks.

## Goals (this project should be...)

1. Modular: A strong set of utility classes
2. Small: Hard limit of 5K compressed for the full library
3. Useful: Ship with a bootstrap-esque set of semantic html styles
4. Configurable: Class naming, component styling, and feature sets should all be configurable
5. Pretty: Styling a bare html page should make it look better, not worse (think zen garden)
6. Conscientious: Accessibility should be a right, not a priveledge

## Usage

It's not done yet so don't use it!

## TODO When this list is done we'll have an actual release

- Sass Variables
  - Units: pixel, percentage, character, view height, view width, em, rem
  - Color Themes
    - Requires name, background, color, and border
    - Optionally includes a map of pseudo-selectors with overrides
    - Optionally includes a map of variants with name and overrides
- Utility Classes
  - color: cX
  - font: fX
  - text: tX
  - border: bX
  - padding: p
  - margin: mX
  - width: wX
  - height: hX
  - display: dX
  - flex: flX
  - cursor: csrX
  - object: objX
  - overflow: ovrX
- Modules: tag based, uses utility classes, pure css
  - Typography: standard text structure tags
    - h1, h2, h3, h4, h5, h6, p, a
  - Layout: full page layouts
    - Vertical: flex column, full width, stretch children, children max width
  - Forms
    - Button: submit, reset, button
    - Textarea
    - Select
    - Input
      - Password
      - Checkbox
      - Radio
      - Email
      - Search
      - Tel
      - URL
      - Number
      - Range
      - Datetime: month, week, time, date
      - Color
      - File
  - Lists
    - Ordered
    - Unordered
  - Menu
