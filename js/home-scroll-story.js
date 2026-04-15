(function () {
  function parseGapPx(track) {
    var g = getComputedStyle(track).gap;
    if (g && g.endsWith("px")) return parseFloat(g);
    return 12;
  }

  function centerOffset(viewport, items, index, gap) {
    var vw = viewport.clientWidth;
    var widths = items.map(function (el) {
      return el.getBoundingClientRect().width;
    });
    if (widths.some(function (w) { return w < 1; })) return null;

    var left = 0;
    for (var j = 0; j < index; j++) {
      left += widths[j] + gap;
    }
    var itemCenter = left + widths[index] / 2;
    return vw / 2 - itemCenter;
  }

  function init() {
    var desktop = window.matchMedia("(min-width: 992px)");
    var sections = Array.prototype.slice.call(document.querySelectorAll(".scroll-story-section"));
    if (!sections.length) return;

    var stories = sections
      .map(function (section) {
        var viewport = section.querySelector(".home-card-strip-viewport");
        var track = section.querySelector(".home-card-strip-track");
        if (!viewport || !track) return null;
        var items = Array.prototype.slice.call(track.querySelectorAll(".home-card-slide"));
        if (!items.length) return null;
        return {
          section: section,
          viewport: viewport,
          track: track,
          items: items,
          title: section.querySelector(".scroll-story-title"),
          currentIndex: -1,
        };
      })
      .filter(Boolean);

    if (!stories.length) return;

    function setIndex(story, index) {
      var clamped = Math.max(0, Math.min(index, story.items.length - 1));
      if (clamped === story.currentIndex) return;
      story.currentIndex = clamped;
      var gap = parseGapPx(story.track);
      var tx = clamped === 0 ? 0 : centerOffset(story.viewport, story.items, clamped, gap);
      if (tx === null) return;
      story.track.style.transform = "translateX(" + tx + "px)";

      if (story.title) {
        if (clamped >= 1) {
          story.title.style.opacity = "0";
          story.title.style.transform = "translateY(-8px)";
        } else {
          story.title.style.opacity = "1";
          story.title.style.transform = "translateY(0)";
        }
      }
    }

    function applyLayoutAndScroll() {
      if (!desktop.matches) {
        stories.forEach(function (story) {
          story.section.style.minHeight = "";
          story.track.style.transform = "";
          if (story.title) {
            story.title.style.opacity = "";
            story.title.style.transform = "";
          }
          story.currentIndex = -1;
        });
        return;
      }

      stories.forEach(function (story) {
        story.section.style.minHeight = (story.items.length * window.innerHeight) + "px";
      });

      stories.forEach(function (story) {
        var rect = story.section.getBoundingClientRect();
        var sectionHeight = story.section.offsetHeight;
        var maxTravel = Math.max(sectionHeight - window.innerHeight, 1);
        var traveled = Math.min(Math.max(-rect.top, 0), maxTravel);
        var progress = traveled / maxTravel;
        var index = Math.round(progress * (story.items.length - 1));
        setIndex(story, index);
      });
    }

    var ticking = false;
    function onScroll() {
      if (!desktop.matches) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        applyLayoutAndScroll();
        ticking = false;
      });
    }

    var imagePromises = [];
    stories.forEach(function (story) {
      story.items.forEach(function (item) {
        var img = item.querySelector("img");
        if (!img || img.complete) return;
        imagePromises.push(
          new Promise(function (resolve) {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
        );
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", applyLayoutAndScroll);
    desktop.addEventListener("change", applyLayoutAndScroll);

    Promise.all(imagePromises).then(function () {
      applyLayoutAndScroll();
      requestAnimationFrame(applyLayoutAndScroll);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
