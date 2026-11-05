// The Agency Universe — hub site
// Two small jobs: mobile nav toggle, and a header shadow once the page scrolls.
// No dependencies, no tracking.

(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the mobile menu as soon as a link is chosen.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();

// Effects layer: hero parallax + pointer-tracked card tilt/foil.
// Engages only for fine pointers (mouse/pen) when the visitor has
// NOT asked for reduced motion. Everyone else — touch, keyboard,
// reduced motion, no JS — gets the static design untouched.
(function () {
  "use strict";

  var demo = new URLSearchParams(window.location.search).has("fxdemo");
  var motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)");
  var finePointer = window.matchMedia("(pointer: fine)");
  // ?fxdemo bypasses the gate: it exists so headless renderers
  // (which report no fine pointer) can capture the effects state.
  if (!demo && (!motionOK.matches || !finePointer.matches)) return;

  document.documentElement.classList.add("fx");

  /* ---- Hero parallax: CSS vars --mx/--my (pointer, -1..1) and
     --sy (scroll fraction 0..1) drive the three depth layers. */
  var hero = document.querySelector(".hero");
  if (hero) {
    var scrollTick = false;
    var updateScroll = function () {
      scrollTick = false;
      var h = hero.offsetHeight || 1;
      var sy = Math.min(Math.max(window.scrollY / h, 0), 1);
      hero.style.setProperty("--sy", sy.toFixed(3));
    };
    window.addEventListener("scroll", function () {
      if (!scrollTick) {
        scrollTick = true;
        window.requestAnimationFrame(updateScroll);
      }
    }, { passive: true });
    hero.addEventListener("pointermove", function (event) {
      var r = hero.getBoundingClientRect();
      var mx = ((event.clientX - r.left) / r.width) * 2 - 1;
      var my = ((event.clientY - r.top) / r.height) * 2 - 1;
      hero.style.setProperty("--mx", mx.toFixed(3));
      hero.style.setProperty("--my", my.toFixed(3));
    });
    hero.addEventListener("pointerleave", function () {
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
    });
    updateScroll();
  }

  /* ---- Card tilt (max 6deg) + foil position tracking ---- */
  var MAX_TILT = 6;
  var cards = document.querySelectorAll(".card, .offer");
  cards.forEach(function (card) {
    var rafId = null;
    var lastEvent = null;

    var apply = function () {
      rafId = null;
      if (!lastEvent) return;
      var r = card.getBoundingClientRect();
      var px = (lastEvent.clientX - r.left) / r.width;
      var py = (lastEvent.clientY - r.top) / r.height;
      px = Math.min(Math.max(px, 0), 1);
      py = Math.min(Math.max(py, 0), 1);
      card.style.setProperty("--ry", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
      card.style.setProperty("--sheen-x", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--sheen-y", (py * 100).toFixed(1) + "%");
      card.style.setProperty("--sheen-pos", (120 - px * 140).toFixed(1) + "%");
      var angle = Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 90;
      card.style.setProperty("--edge-a", angle.toFixed(1) + "deg");
    };

    card.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      lastEvent = event;
      card.classList.add("is-tilting");
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    });
    card.addEventListener("pointerleave", function () {
      lastEvent = null;
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });

  /* ---- Proof hook: ?fxdemo poses two cards mid-tilt (and offsets
     the hero layers) so headless screenshots can capture the
     effects state. No effect on normal visits. ---- */
  if (demo) {
    var pose = function (el, rx, ry, sx, sy, pos, ang) {
      if (!el) return;
      el.classList.add("is-tilting", "fx-posed");
      el.style.setProperty("--rx", rx + "deg");
      el.style.setProperty("--ry", ry + "deg");
      el.style.setProperty("--sheen-x", sx);
      el.style.setProperty("--sheen-y", sy);
      el.style.setProperty("--sheen-pos", pos);
      el.style.setProperty("--edge-a", ang);
    };
    pose(cards[1], -4.5, 5.5, "30%", "32%", "78%", "125deg");
    pose(cards[4], 3.5, -5, "68%", "40%", "25%", "300deg");
    if (hero) {
      hero.style.setProperty("--mx", "0.6");
      hero.style.setProperty("--my", "-0.3");
      hero.style.setProperty("--sy", "0.3");
    }
  }
})();
