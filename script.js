// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuToggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
    });
  });
}

const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
  });
}

function applyProductData() {
  if (typeof PRODUCTS === 'undefined') return;
  const detail = document.querySelector('.product-detail[data-product]');
  if (detail) {
    const key = detail.getAttribute('data-product');
    const p = PRODUCTS[key];
    if (!p) return;
    const title = detail.querySelector('h1');
    const price = detail.querySelector('.detail-price');
    const desc = detail.querySelector('.detail-desc');
    const mainImg = document.getElementById('mainProductImg');
    const thumbs = detail.querySelectorAll('.detail-thumb');
    if (title) title.textContent = p.name;
    if (price) price.textContent = p.price;
    if (desc) desc.textContent = p.desc;
    if (mainImg && p.images && p.images[0]) {
      mainImg.style.backgroundImage = "url('" + p.images[0] + "')";
      mainImg.setAttribute('data-full', p.images[0]);
    }
    thumbs.forEach((thumb, i) => {
      if (p.images[i]) {
        thumb.style.backgroundImage = "url('" + p.images[i] + "')";
        thumb.setAttribute('data-img', p.images[i]);
      }
    });
    const orderBtn = detail.querySelector('a.btn-primary');
    if (orderBtn) {
      const msg = 'Hi MHF SHOP, I want to order ' + p.name + ' (' + p.price + ')';
      orderBtn.href = 'https://wa.me/8801324978737?text=' + encodeURIComponent(msg);
    }
  }
  document.querySelectorAll('[data-product-card]').forEach(card => {
    const key = card.getAttribute('data-product-card');
    const p = PRODUCTS[key];
    if (!p) return;
    const img = card.querySelector('.product-img');
    const name = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    if (img && p.images[0]) img.style.backgroundImage = "url('" + p.images[0] + "')";
    if (name) name.textContent = p.name;
    if (priceEl) priceEl.textContent = p.price;
  });
}
applyProductData();

// ===== Fullscreen lightbox WITH ZOOM BUTTONS =====
let lbScale = 1;
let lbX = 0;
let lbY = 0;

function ensureLightbox() {
  let box = document.getElementById('lightbox');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'lightbox';
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
    <div class="lightbox-stage">
      <img class="lightbox-img" src="" alt="Product" />
    </div>
    <div class="lightbox-controls">
      <button type="button" class="lb-zoom-out" aria-label="Zoom out">−</button>
      <button type="button" class="lb-zoom-in" aria-label="Zoom in">+</button>
    </div>
  `;
  document.body.appendChild(box);

  const img = box.querySelector('.lightbox-img');
  const stage = box.querySelector('.lightbox-stage');

  function applyZoom() {
    img.style.transform = 'translate(' + lbX + 'px,' + lbY + 'px) scale(' + lbScale + ')';
  }
  function resetZoom() {
    lbScale = 1;
    lbX = 0;
    lbY = 0;
    applyZoom();
  }
  function close() {
    box.classList.remove('open');
    resetZoom();
  }

  box.querySelector('.lightbox-close').onclick = close;
  box.addEventListener('click', (e) => { if (e.target === box || e.target === stage) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Zoom buttons
  box.querySelector('.lb-zoom-in').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.min(4, lbScale + 0.5);
    applyZoom();
  };
  box.querySelector('.lb-zoom-out').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.max(1, lbScale - 0.5);
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  };

  // Pinch zoom
  let lastDist = 0;
  let dragging = false;
  let startX = 0, startY = 0;

  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && lbScale > 1) {
      dragging = true;
      startX = e.touches[0].clientX - lbX;
      startY = e.touches[0].clientY - lbY;
    }
  }, { passive: true });

  img.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist > 0) {
        lbScale = Math.min(4, Math.max(1, lbScale * (dist / lastDist)));
        applyZoom();
      }
      lastDist = dist;
    } else if (dragging && e.touches.length === 1) {
      e.preventDefault();
      lbX = e.touches[0].clientX - startX;
      lbY = e.touches[0].clientY - startY;
      applyZoom();
    }
  }, { passive: false });

  img.addEventListener('touchend', () => {
    dragging = false;
    lastDist = 0;
  });

  // Wheel zoom desktop
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    lbScale = Math.min(4, Math.max(1, lbScale + (e.deltaY > 0 ? -0.25 : 0.25)));
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  }, { passive: false });

  // Drag when zoomed (mouse)
  img.addEventListener('mousedown', (e) => {
    if (lbScale <= 1) return;
    dragging = true;
    startX = e.clientX - lbX;
    startY = e.clientY - lbY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    lbX = e.clientX - startX;
    lbY = e.clientY - startY;
    applyZoom();
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  box._resetZoom = resetZoom;
  return box;
}

function openFullscreen(url) {
  if (!url) return;
  const box = ensureLightbox();
  box.querySelector('.lightbox-img').src = url;
  if (box._resetZoom) box._resetZoom();
  box.classList.add('open');
}

const mainImgEl = document.getElementById('mainProductImg');
const thumbEls = document.querySelectorAll('.detail-thumb');
if (mainImgEl && thumbEls.length) {
  thumbEls.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-img');
      if (url) {
        mainImgEl.style.backgroundImage = "url('" + url + "')";
        mainImgEl.setAttribute('data-full', url);
      }
      thumbEls.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  mainImgEl.addEventListener('click', () => {
    const url = mainImgEl.getAttribute('data-full') ||
      (mainImgEl.style.backgroundImage || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    openFullscreen(url);
  });
}
// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuToggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
    });
  });
}

const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
  });
}

function applyProductData() {
  if (typeof PRODUCTS === 'undefined') return;
  const detail = document.querySelector('.product-detail[data-product]');
  if (detail) {
    const key = detail.getAttribute('data-product');
    const p = PRODUCTS[key];
    if (!p) return;
    const title = detail.querySelector('h1');
    const price = detail.querySelector('.detail-price');
    const desc = detail.querySelector('.detail-desc');
    const mainImg = document.getElementById('mainProductImg');
    const thumbs = detail.querySelectorAll('.detail-thumb');
    if (title) title.textContent = p.name;
    if (price) price.textContent = p.price;
    if (desc) desc.textContent = p.desc;
    if (mainImg && p.images && p.images[0]) {
      mainImg.style.backgroundImage = "url('" + p.images[0] + "')";
      mainImg.setAttribute('data-full', p.images[0]);
    }
    thumbs.forEach((thumb, i) => {
      if (p.images[i]) {
        thumb.style.backgroundImage = "url('" + p.images[i] + "')";
        thumb.setAttribute('data-img', p.images[i]);
      }
    });
    const orderBtn = detail.querySelector('a.btn-primary');
    if (orderBtn) {
      const msg = 'Hi MHF SHOP, I want to order ' + p.name + ' (' + p.price + ')';
      orderBtn.href = 'https://wa.me/8801324978737?text=' + encodeURIComponent(msg);
    }
  }
  document.querySelectorAll('[data-product-card]').forEach(card => {
    const key = card.getAttribute('data-product-card');
    const p = PRODUCTS[key];
    if (!p) return;
    const img = card.querySelector('.product-img');
    const name = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    if (img && p.images[0]) img.style.backgroundImage = "url('" + p.images[0] + "')";
    if (name) name.textContent = p.name;
    if (priceEl) priceEl.textContent = p.price;
  });
}
applyProductData();

// ===== Fullscreen lightbox WITH ZOOM BUTTONS =====
let lbScale = 1;
let lbX = 0;
let lbY = 0;

function ensureLightbox() {
  let box = document.getElementById('lightbox');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'lightbox';
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
    <div class="lightbox-stage">
      <img class="lightbox-img" src="" alt="Product" />
    </div>
    <div class="lightbox-controls">
      <button type="button" class="lb-zoom-out" aria-label="Zoom out">−</button>
      <button type="button" class="lb-zoom-in" aria-label="Zoom in">+</button>
    </div>
  `;
  document.body.appendChild(box);

  const img = box.querySelector('.lightbox-img');
  const stage = box.querySelector('.lightbox-stage');

  function applyZoom() {
    img.style.transform = 'translate(' + lbX + 'px,' + lbY + 'px) scale(' + lbScale + ')';
  }
  function resetZoom() {
    lbScale = 1;
    lbX = 0;
    lbY = 0;
    applyZoom();
  }
  function close() {
    box.classList.remove('open');
    resetZoom();
  }

  box.querySelector('.lightbox-close').onclick = close;
  box.addEventListener('click', (e) => { if (e.target === box || e.target === stage) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Zoom buttons
  box.querySelector('.lb-zoom-in').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.min(4, lbScale + 0.5);
    applyZoom();
  };
  box.querySelector('.lb-zoom-out').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.max(1, lbScale - 0.5);
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  };

  // Pinch zoom
  let lastDist = 0;
  let dragging = false;
  let startX = 0, startY = 0;

  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && lbScale > 1) {
      dragging = true;
      startX = e.touches[0].clientX - lbX;
      startY = e.touches[0].clientY - lbY;
    }
  }, { passive: true });

  img.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist > 0) {
        lbScale = Math.min(4, Math.max(1, lbScale * (dist / lastDist)));
        applyZoom();
      }
      lastDist = dist;
    } else if (dragging && e.touches.length === 1) {
      e.preventDefault();
      lbX = e.touches[0].clientX - startX;
      lbY = e.touches[0].clientY - startY;
      applyZoom();
    }
  }, { passive: false });

  img.addEventListener('touchend', () => {
    dragging = false;
    lastDist = 0;
  });

  // Wheel zoom desktop
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    lbScale = Math.min(4, Math.max(1, lbScale + (e.deltaY > 0 ? -0.25 : 0.25)));
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  }, { passive: false });

  // Drag when zoomed (mouse)
  img.addEventListener('mousedown', (e) => {
    if (lbScale <= 1) return;
    dragging = true;
    startX = e.clientX - lbX;
    startY = e.clientY - lbY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    lbX = e.clientX - startX;
    lbY = e.clientY - startY;
    applyZoom();
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  box._resetZoom = resetZoom;
  return box;
}

function openFullscreen(url) {
  if (!url) return;
  const box = ensureLightbox();
  box.querySelector('.lightbox-img').src = url;
  if (box._resetZoom) box._resetZoom();
  box.classList.add('open');
}

const mainImgEl = document.getElementById('mainProductImg');
const thumbEls = document.querySelectorAll('.detail-thumb');
if (mainImgEl && thumbEls.length) {
  thumbEls.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-img');
      if (url) {
        mainImgEl.style.backgroundImage = "url('" + url + "')";
        mainImgEl.setAttribute('data-full', url);
      }
      thumbEls.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  mainImgEl.addEventListener('click', () => {
    const url = mainImgEl.getAttribute('data-full') ||
      (mainImgEl.style.backgroundImage || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    openFullscreen(url);
  });
}
// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuToggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
    });
  });
}

const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
  });
}

function applyProductData() {
  if (typeof PRODUCTS === 'undefined') return;
  const detail = document.querySelector('.product-detail[data-product]');
  if (detail) {
    const key = detail.getAttribute('data-product');
    const p = PRODUCTS[key];
    if (!p) return;
    const title = detail.querySelector('h1');
    const price = detail.querySelector('.detail-price');
    const desc = detail.querySelector('.detail-desc');
    const mainImg = document.getElementById('mainProductImg');
    const thumbs = detail.querySelectorAll('.detail-thumb');
    if (title) title.textContent = p.name;
    if (price) price.textContent = p.price;
    if (desc) desc.textContent = p.desc;
    if (mainImg && p.images && p.images[0]) {
      mainImg.style.backgroundImage = "url('" + p.images[0] + "')";
      mainImg.setAttribute('data-full', p.images[0]);
    }
    thumbs.forEach((thumb, i) => {
      if (p.images[i]) {
        thumb.style.backgroundImage = "url('" + p.images[i] + "')";
        thumb.setAttribute('data-img', p.images[i]);
      }
    });
    const orderBtn = detail.querySelector('a.btn-primary');
    if (orderBtn) {
      const msg = 'Hi MHF SHOP, I want to order ' + p.name + ' (' + p.price + ')';
      orderBtn.href = 'https://wa.me/8801324978737?text=' + encodeURIComponent(msg);
    }
  }
  document.querySelectorAll('[data-product-card]').forEach(card => {
    const key = card.getAttribute('data-product-card');
    const p = PRODUCTS[key];
    if (!p) return;
    const img = card.querySelector('.product-img');
    const name = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    if (img && p.images[0]) img.style.backgroundImage = "url('" + p.images[0] + "')";
    if (name) name.textContent = p.name;
    if (priceEl) priceEl.textContent = p.price;
  });
}
applyProductData();

// ===== Fullscreen lightbox WITH ZOOM BUTTONS =====
let lbScale = 1;
let lbX = 0;
let lbY = 0;

function ensureLightbox() {
  let box = document.getElementById('lightbox');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'lightbox';
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
    <div class="lightbox-stage">
      <img class="lightbox-img" src="" alt="Product" />
    </div>
    <div class="lightbox-controls">
      <button type="button" class="lb-zoom-out" aria-label="Zoom out">−</button>
      <button type="button" class="lb-zoom-in" aria-label="Zoom in">+</button>
    </div>
  `;
  document.body.appendChild(box);

  const img = box.querySelector('.lightbox-img');
  const stage = box.querySelector('.lightbox-stage');

  function applyZoom() {
    img.style.transform = 'translate(' + lbX + 'px,' + lbY + 'px) scale(' + lbScale + ')';
  }
  function resetZoom() {
    lbScale = 1;
    lbX = 0;
    lbY = 0;
    applyZoom();
  }
  function close() {
    box.classList.remove('open');
    resetZoom();
  }

  box.querySelector('.lightbox-close').onclick = close;
  box.addEventListener('click', (e) => { if (e.target === box || e.target === stage) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Zoom buttons
  box.querySelector('.lb-zoom-in').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.min(4, lbScale + 0.5);
    applyZoom();
  };
  box.querySelector('.lb-zoom-out').onclick = (e) => {
    e.stopPropagation();
    lbScale = Math.max(1, lbScale - 0.5);
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  };

  // Pinch zoom
  let lastDist = 0;
  let dragging = false;
  let startX = 0, startY = 0;

  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && lbScale > 1) {
      dragging = true;
      startX = e.touches[0].clientX - lbX;
      startY = e.touches[0].clientY - lbY;
    }
  }, { passive: true });

  img.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist > 0) {
        lbScale = Math.min(4, Math.max(1, lbScale * (dist / lastDist)));
        applyZoom();
      }
      lastDist = dist;
    } else if (dragging && e.touches.length === 1) {
      e.preventDefault();
      lbX = e.touches[0].clientX - startX;
      lbY = e.touches[0].clientY - startY;
      applyZoom();
    }
  }, { passive: false });

  img.addEventListener('touchend', () => {
    dragging = false;
    lastDist = 0;
  });

  // Wheel zoom desktop
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    lbScale = Math.min(4, Math.max(1, lbScale + (e.deltaY > 0 ? -0.25 : 0.25)));
    if (lbScale === 1) { lbX = 0; lbY = 0; }
    applyZoom();
  }, { passive: false });

  // Drag when zoomed (mouse)
  img.addEventListener('mousedown', (e) => {
    if (lbScale <= 1) return;
    dragging = true;
    startX = e.clientX - lbX;
    startY = e.clientY - lbY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    lbX = e.clientX - startX;
    lbY = e.clientY - startY;
    applyZoom();
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  box._resetZoom = resetZoom;
  return box;
}

function openFullscreen(url) {
  if (!url) return;
  const box = ensureLightbox();
  box.querySelector('.lightbox-img').src = url;
  if (box._resetZoom) box._resetZoom();
  box.classList.add('open');
}

const mainImgEl = document.getElementById('mainProductImg');
const thumbEls = document.querySelectorAll('.detail-thumb');
if (mainImgEl && thumbEls.length) {
  thumbEls.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-img');
      if (url) {
        mainImgEl.style.backgroundImage = "url('" + url + "')";
        mainImgEl.setAttribute('data-full', url);
      }
      thumbEls.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  mainImgEl.addEventListener('click', () => {
    const url = mainImgEl.getAttribute('data-full') ||
      (mainImgEl.style.backgroundImage || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    openFullscreen(url);
  });
}
