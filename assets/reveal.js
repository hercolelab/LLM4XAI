/* Scroll reveal: fade/rise + de-blur each block as it enters the viewport,
   with a small stagger across grid items. Runs on every page. Fail-safe:
   the hiding class is added here, so if this script never runs, nothing
   stays hidden. No-ops under reduced motion or without IntersectionObserver. */
document.addEventListener("DOMContentLoaded", function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  function reveal(el) {
    el.classList.add("reveal");
    io.observe(el);
  }

  // Standalone blocks fade + rise
  var blockSel = [
    "main .section-heading",
    "main .prose",
    "main .program-note",
    "main .date-lines",
    "main .dates-clock",
    "main .section-note"
  ].join(", ");
  Array.prototype.forEach.call(document.querySelectorAll(blockSel), reveal);

  // Grid / group containers reveal their children with a stagger
  var grids = document.querySelectorAll(
    ".dates-strip, .people-grid, .topics, .guidelines"
  );
  Array.prototype.forEach.call(grids, function (grid) {
    Array.prototype.forEach.call(grid.children, function (child, i) {
      child.classList.add("reveal");
      child.style.transitionDelay = Math.min(i * 70, 480) + "ms";
      io.observe(child);
    });
  });
});
