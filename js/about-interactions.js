(function () {
  function initAboutFadeUps() {
    var root = document.querySelector(".about-page");
    if (!root) return;

    var items = root.querySelectorAll(".about-fade-up");
    if (!items.length) return;

    var hero = root.querySelector(".about-landing");
    var heroFades = hero ? hero.querySelectorAll(".about-fade-up") : null;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var staggerMs = 55;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = 0;
          if (heroFades && hero.contains(el)) {
            var idx = Array.prototype.indexOf.call(heroFades, el);
            if (idx >= 0) delay = idx * staggerMs;
          }
          window.setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  function initReveals() {
    var revealItems = document.querySelectorAll(".about-page .reveal-on-scroll");
    if (!revealItems.length) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      Array.prototype.forEach.call(revealItems, function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    Array.prototype.forEach.call(revealItems, function (item) {
      observer.observe(item);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAboutFadeUps();
    initReveals();
  });
})();
