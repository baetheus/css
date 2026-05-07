import type { StyleInput, StyleObject } from "../combinators/types.ts";
import type { KeyframeFrame, KeyframesRule } from "../ast/types.ts";
import { transformProperties } from "../combinators/transform.ts";
import { mergeStyles } from "../combinators/compile.ts";
import { hashStyle } from "./hash.ts";
import { getRegistry } from "./registry.ts";

export function keyframes(
  frames: Record<string, StyleInput>,
  debugName?: string,
): string {
  const name = debugName
    ? `${debugName}_${hashStyle(frames)}`
    : hashStyle(frames);

  const keyframeFrames: KeyframeFrame[] = Object.entries(frames).map(
    ([offset, input]) => {
      const style: StyleObject = Array.isArray(input)
        ? mergeStyles(...input)
        : (input as StyleObject);
      return {
        offset,
        properties: transformProperties(style),
      };
    },
  );

  const rule: KeyframesRule = {
    type: "keyframes",
    name,
    frames: keyframeFrames,
  };

  getRegistry().addKeyframes(name, rule);

  return name;
}
