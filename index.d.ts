// Type definitions for ghost-reveal 0.2.0

/** Built-in animation names (AOS-compatible). Zoom also accepts directions, e.g. "zoom-in-up". */
export type GhostAnimation =
  | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right'
  | 'zoom-in' | 'zoom-out'
  | 'zoom-in-up' | 'zoom-in-down' | 'zoom-in-left' | 'zoom-in-right'
  | 'zoom-out-up' | 'zoom-out-down' | 'zoom-out-left' | 'zoom-out-right'
  | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'flip-up' | 'flip-down' | 'flip-left' | 'flip-right';

/** "<element edge>-<window edge>". Window edge: "bottom" (uses offset) or "center". */
export type AnchorPlacement =
  | 'top-bottom' | 'center-bottom' | 'bottom-bottom'
  | 'top-center' | 'center-center' | 'bottom-center';

export interface GhostRevealOptions {
  /** CSS selector of elements to reveal. Default: '[data-reveal],[data-aos]'. */
  selector?: string;
  /** Animation used when the attribute is empty (`data-reveal`). Default 'fade-up'. */
  animation?: GhostAnimation | (string & {});
  /** Animation duration in ms. Default 700. */
  duration?: number;
  /** Delay in ms. Default 0. */
  delay?: number;
  /** Any CSS easing string, or a key registered in `easings`. Default 'cubic-bezier(.16,1,.3,1)' (expo-out). */
  easing?: string;
  /** Travel in px for fade-* and zoom-*-<dir> animations. Default 16. */
  distance?: number;
  /** Start blur in px (blur-to-sharp). 0 disables. Default 4. */
  blur?: number;
  /** Trigger line in px above the bottom of the viewport. Default 60 (AOS: 120). */
  offset?: number;
  /** Raw IntersectionObserver rootMargin; overrides `offset` (but not per-element data-*-offset). Default: none (derived from `offset`). */
  rootMargin?: string;
  /** Default anchor placement. Default 'top-bottom'. */
  anchorPlacement?: AnchorPlacement;
  /** Reveal only once. Default true (AOS default is false). */
  once?: boolean;
  /** Also animate elements that are already on screen at init. Default false (otherwise they are simply shown, without animation). */
  initial?: boolean;
  /** Watch the DOM (MutationObserver, added subtrees only) for added/removed elements. Default true. */
  observe?: boolean;
  /**
   * Experimental: tie progress to scroll position with a native ViewTimeline (reversible, no JS per frame).
   * Falls back to the normal reveal where ViewTimeline is unsupported. Usually set per element: `data-reveal-scrub`.
   * Default false.
   */
  scrub?: boolean;
  /** Disable entirely (nothing is hidden). 'mobile' = viewport narrower than 768px. Re-checked on refresh(). Default false. */
  disable?: boolean | 'mobile' | (() => boolean);
}

export interface GhostRevealInstance {
  /** Pick up new elements, forget removed ones, and re-read every element's data-* attributes. */
  refresh(): void;
  /** Disconnect all observers and listeners, cancel all animations, restore every element to its natural visible state. */
  destroy(): void;
}

/** A "from" keyframe. Only compositor-friendly properties are used. */
export interface GhostKeyframe {
  opacity?: number;
  transform?: string;
  filter?: string;
}

/**
 * Start revealing. Call after the DOM is parsed (or in a mount/effect hook).
 * Safe to call on the server: without a `document` it returns a no-op instance.
 */
export function init(options?: GhostRevealOptions): GhostRevealInstance;

/**
 * Animation definitions as plain data: name -> [from, to] keyframes (`to` is `{}`, i.e. the element's own styles).
 * Usable with element.animate(), a ViewTimeline, or to generate a CSS @keyframes rule.
 * @param distance px of travel (default `defaults.distance`)
 * @param blur px of start blur (default `defaults.blur`)
 */
export function keyframes(name: GhostAnimation | (string & {}), distance?: number, blur?: number): [GhostKeyframe, {}];

/** Mutable global defaults used by every subsequent init(). */
export const defaults: Required<
  Pick<GhostRevealOptions, 'animation' | 'duration' | 'delay' | 'easing' | 'distance' | 'blur' | 'offset' | 'once' | 'observe'>
>;

/** Named easing registry: name -> CSS easing. Empty by default; see 'ghost-reveal/aos-easings'. */
export const easings: Record<string, string>;

declare global {
  interface HTMLElementEventMap {
    'reveal:in': CustomEvent<null>;
    'reveal:out': CustomEvent<null>;
  }
  interface DocumentEventMap {
    'reveal:in': CustomEvent<null>;
    'reveal:out': CustomEvent<null>;
  }
}
