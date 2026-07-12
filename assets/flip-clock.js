/* ==========================================================================
   Flip-clock countdown — split-flap style.
   Reads data attributes on [data-flip-clock]:
     data-target : ISO date/time to count down to (empty = frozen / TBD)
     data-title  : caption above the clock
     data-note   : text shown while frozen (no target set)
   When a valid target is set the clock ticks and flips every second.
   With no target it stays frozen on "–" — ready for when dates are announced.
   ========================================================================== */
(function () {
  var GROUPS = [
    { key: "days", label: "Days" },
    { key: "hours", label: "Hours" },
    { key: "minutes", label: "Minutes" },
    { key: "seconds", label: "Seconds" }
  ];
  var PLACEHOLDER = "–";
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeDigit() {
    var flip = document.createElement("div");
    flip.className = "flip";
    flip.dataset.value = PLACEHOLDER;
    ["flip__top", "flip__bottom", "flip__top-fold", "flip__bottom-fold"]
      .forEach(function (cls) {
        var half = document.createElement("div");
        half.className = cls;
        var span = document.createElement("span");
        span.textContent = PLACEHOLDER;
        half.appendChild(span);
        flip.appendChild(half);
      });
    return flip;
  }

  function setDigit(flip, value) {
    if (flip.dataset.value === value) return;
    var old = flip.dataset.value;
    flip.dataset.value = value;

    var top = flip.querySelector(".flip__top span");
    var bottom = flip.querySelector(".flip__bottom span");
    var topFold = flip.querySelector(".flip__top-fold span");
    var bottomFold = flip.querySelector(".flip__bottom-fold span");

    if (reduceMotion) {
      top.textContent = bottom.textContent = topFold.textContent =
        bottomFold.textContent = value;
      return;
    }

    top.textContent = value;      // revealed once the top flap folds away
    topFold.textContent = old;    // upper flap of the outgoing value
    bottomFold.textContent = value; // lower flap of the incoming value
    // bottom keeps the old value until the animation lands

    flip.classList.remove("flip--anim");
    void flip.offsetWidth;
    flip.classList.add("flip--anim");

    clearTimeout(flip._flipTimer);
    flip._flipTimer = setTimeout(function () {
      bottom.textContent = value;
      topFold.textContent = value;
      flip.classList.remove("flip--anim");
    }, 640);
  }

  function build(root) {
    var title = root.dataset.title || "";
    var note = root.dataset.note || "";

    if (title) {
      var t = document.createElement("div");
      t.className = "flip-clock__title";
      t.textContent = title;
      root.appendChild(t);
    }

    var row = document.createElement("div");
    row.className = "flip-clock__row";

    var digits = {};
    GROUPS.forEach(function (g, i) {
      if (i > 0) {
        var sep = document.createElement("span");
        sep.className = "flip-clock__sep";
        sep.textContent = ":";
        row.appendChild(sep);
      }
      var group = document.createElement("div");
      group.className = "flip-clock__group";

      var pair = document.createElement("div");
      pair.className = "flip-clock__pair";
      var tens = makeDigit();
      var ones = makeDigit();
      pair.appendChild(tens);
      pair.appendChild(ones);

      var label = document.createElement("span");
      label.className = "flip-clock__label";
      label.textContent = g.label;

      group.appendChild(pair);
      group.appendChild(label);
      row.appendChild(group);

      digits[g.key] = [tens, ones];
    });

    root.appendChild(row);

    if (note) {
      var n = document.createElement("div");
      n.className = "flip-clock__note";
      n.textContent = note;
      root.appendChild(n);
    }

    return digits;
  }

  function render(digits, values) {
    GROUPS.forEach(function (g) {
      var pair = digits[g.key];
      var v = values[g.key];
      setDigit(pair[0], v[0]);
      setDigit(pair[1], v[1]);
    });
  }

  function computeValues(target, now) {
    var diff = Math.max(0, target - now);
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    function pad(n) {
      var s = String(Math.min(n, 99)).padStart(2, "0");
      return [s[0], s[1]];
    }
    return {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds)
    };
  }

  function init(root) {
    var digits = build(root);
    var targetRaw = (root.dataset.target || "").trim();
    var target = targetRaw ? Date.parse(targetRaw) : NaN;

    if (isNaN(target)) {
      root.classList.add("is-frozen"); // stays on placeholders — TBD
      return;
    }

    root.classList.remove("is-frozen");

    function tick() {
      render(digits, computeValues(target, Date.now()));
    }
    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-flip-clock]").forEach(init);
  });
})();
