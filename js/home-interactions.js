(function () {
  function initHeroParallax() {
    var hero = document.querySelector(".landing");
    var title = document.querySelector(".home-hero-title");
    if (!hero || !title) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      title.classList.add("is-ready");
      return;
    }

    requestAnimationFrame(function () {
      title.classList.add("is-ready");
    });

    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      var heroHeight = Math.max(hero.offsetHeight, 1);
      var progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1);
      var shift = progress * 70;
      var fade = 1 - progress * 1.25;
      title.style.transform = "translate3d(0, " + (-shift) + "px, 0)";
      title.style.opacity = String(Math.max(fade, 0));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function initReveals() {
    var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal-on-scroll"));
    if (!revealItems.length) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function initProgress() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-home-section]"));
    var countEl = document.querySelector(".home-progress-count");
    var labelEl = document.querySelector(".home-progress-label");
    var fillEl = document.querySelector(".home-progress-fill");
    if (!sections.length || !countEl || !labelEl || !fillEl) return;

    var total = sections.length;

    function updateProgress() {
      var nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (nearBottom) {
        var lastIdx = total - 1;
        var lastLabel = sections[lastIdx].getAttribute("data-home-section-label") || "Section";
        countEl.textContent = String(total).padStart(2, "0") + " / " + String(total).padStart(2, "0");
        labelEl.textContent = lastLabel;
        fillEl.style.width = "100%";
        return;
      }

      var targetLine = window.innerHeight * 0.37;
      var activeIdx = 0;
      var closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach(function (section, index) {
        var rect = section.getBoundingClientRect();
        var sectionMid = rect.top + rect.height / 2;
        var distance = Math.abs(sectionMid - targetLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          activeIdx = index;
        }
      });

      var humanIndex = activeIdx + 1;
      var label = sections[activeIdx].getAttribute("data-home-section-label") || "Section";
      countEl.textContent = String(humanIndex).padStart(2, "0") + " / " + String(total).padStart(2, "0");
      labelEl.textContent = label;
      fillEl.style.width = (humanIndex / total) * 100 + "%";
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateProgress();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateProgress();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroParallax();
    initReveals();
    initProgress();
  });
})();
