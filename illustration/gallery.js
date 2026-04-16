(function () {
  const configuredItems = Array.isArray(window.ILL_GALLERY_ITEMS) ? window.ILL_GALLERY_ITEMS : [];
  const discoveryCfg = window.ILL_GALLERY_DISCOVERY || {};

  const startIndex = typeof discoveryCfg.startIndex === "number" ? discoveryCfg.startIndex : 1;
  const maxIndex = typeof discoveryCfg.maxIndex === "number" ? discoveryCfg.maxIndex : 120;
  const consecutiveMissingStop =
    typeof discoveryCfg.consecutiveMissingStop === "number" ? discoveryCfg.consecutiveMissingStop : 8;
  const exts = Array.isArray(discoveryCfg.exts) && discoveryCfg.exts.length
    ? discoveryCfg.exts
    : ["jpg", "jpeg", "png", "webp"];
  const loadTimeoutMs = typeof discoveryCfg.loadTimeoutMs === "number" ? discoveryCfg.loadTimeoutMs : 900;

  function mediaPath(file, preview) {
    return (preview ? '../illustration/images/' : 'images/') + file;
  }

  function imageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const timeout = window.setTimeout(() => {
        if (done) return;
        done = true;
        resolve(false);
      }, loadTimeoutMs);

      img.onload = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timeout);
        resolve(false);
      };

      img.src = src;
    });
  }

  async function discoverItems() {
    const discovered = [];
    let missingStreak = 0;

    for (let n = startIndex; n <= maxIndex; n++) {
      const checks = exts.map(function (ext) {
        const file = String(n) + "." + ext;
        return imageExists(mediaPath(file, false)).then(function (ok) {
          return ok ? file : null;
        });
      });

      const results = await Promise.all(checks);
      const foundFile = results.find(function (f) { return !!f; }) || null;

      if (foundFile) {
        discovered.push({ file: foundFile, alt: "Illustration " + n });
        missingStreak = 0;
      } else {
        missingStreak++;
        if (missingStreak >= consecutiveMissingStop) break;
      }
    }

    return discovered;
  }

  function mergeItems(curated, discovered) {
    const merged = [];
    const seen = Object.create(null);

    curated.forEach(function (item) {
      if (!item || !item.file) return;
      const key = String(item.file).toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      merged.push(item);
    });

    discovered.forEach(function (item) {
      const key = String(item.file).toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      merged.push(item);
    });

    return merged;
  }

  function buildPreview(root, items) {
    root.classList.add('ill-masonry-preview');
    items.forEach((item, index) => {
      const a = document.createElement('a');
      a.className = 'ill-tile-link';
      a.href = '../illustration/index.html';
      const img = document.createElement('img');
      img.src = mediaPath(item.file, true);
      img.alt = item.alt || '';
      img.loading = 'lazy';
      a.appendChild(img);
      root.appendChild(a);
    });
  }

  function buildFullPage(root, items) {
    const wrap = document.createElement('div');
    wrap.className = 'ill-masonry';

    const lbCtrl = window.IllLightbox.create({
      ariaLabel: 'Full size illustration',
      itemsLength: items.length,
      onRender: ({ imgEl, index }) => {
        const item = items[index];
        imgEl.src = mediaPath(item.file, false);
        imgEl.alt = item.alt || '';
      },
    });
    const { open } = lbCtrl;

    items.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ill-tile-btn';
      btn.setAttribute('aria-label', 'View larger: ' + (item.alt || 'illustration'));
      const im = document.createElement('img');
      im.src = mediaPath(item.file, false);
      im.alt = item.alt || '';
      im.loading = index < 4 ? 'eager' : 'lazy';
      btn.appendChild(im);
      btn.addEventListener('click', () => open(index));
      wrap.appendChild(btn);
    });

    root.appendChild(wrap);
    root.appendChild(lbCtrl.lb);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const discoveredItems = await discoverItems();
    const items = mergeItems(configuredItems, discoveredItems);
    if (!items.length) return;

    const preview = document.getElementById('ill-preview-root');
    const full = document.getElementById('ill-gallery-root');
    if (preview) buildPreview(preview, items);
    if (full) buildFullPage(full, items);
  });
})();
