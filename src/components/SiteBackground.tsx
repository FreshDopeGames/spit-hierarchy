/**
 * Site-wide decorative background: Egyptian-temple gutter art pinned to the
 * left and right edges of the viewport, with solid black in between.
 *
 * Both gutter images already fade to pure black on their inner edge, so they
 * blend into the black page with no seam. Uses a fixed element rather than
 * `background-attachment: fixed`, which iOS Safari ignores.
 *
 * Breakpoints:
 *  - xl (≥1280px): full gutters
 *  - md–lg:        pushed ~1/3 off-screen and dimmed so only the columns peek in
 *  - mobile:       thin slivers at low opacity so they never fight with content
 *
 * Page wrappers are made transparent in index.css ([data-page-root] rules) so
 * this layer shows through on every route.
 */
const gutterBase =
  "absolute top-0 h-full w-auto max-w-none select-none transition-[transform,opacity] duration-300";

export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      <img
        src="/bg/spithierarchy_gutter_left.webp"
        alt=""
        decoding="async"
        draggable={false}
        className={`${gutterBase} left-0 -translate-x-[60%] opacity-30 md:-translate-x-1/3 md:opacity-60 xl:translate-x-0 xl:opacity-100`}
      />
      <img
        src="/bg/spithierarchy_gutter_right.webp"
        alt=""
        decoding="async"
        draggable={false}
        className={`${gutterBase} right-0 translate-x-[60%] opacity-30 md:translate-x-1/3 md:opacity-60 xl:translate-x-0 xl:opacity-100`}
      />
    </div>
  );
}

export default SiteBackground;
