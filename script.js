// Mobile menu toggle
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

// Header shadow
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
  });
}

// Apply product data from products-data.js
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

// ===== Fullscreen + Zoom lightbox =====
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let lastTap = 0;

function ensureLightbox() {
  let box = document.getElementById('lightbox');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'lightbox';
  box.className = 'lightbox';
  box.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt="Product" />';
  document.body.appendChild(box);

  const img = box.querySelector('img');

  function resetZoom() {
    scale = 1;
    posX = 0;
    posY = 0;
    img.style.transform = 'translate(0,0) scale(1)';
    img.classList.remove('zoomed');
  }

  function applyTransform() {
    img.style.transform = 'translate(' + posX + 'px,' + posY + 'px) scale(' + scale + ')';
    if (scale > 1) img.classList.add('zoomed');
    else img.classList.remove('zoomed');
  }

  function close() {
    box.classList.remove('open');
    resetZoom();
  }

  box.querySelector('.lightbox-close').addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Double-tap / double-click to zoom
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap < 300) {
      if (scale === 1) {
        scale = 2.5;
        applyTransform();
      } else {
        resetZoom();
      }
    }
    lastTap = now;
  });

  // Mouse wheel zoom (desktop)
  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    scale = Math.min(4, Math.max(1, scale + delta));
    if (scale === 1) { posX = 0; posY = 0; }
    applyTransform();
  }, { passive: false });

  // Pinch zoom (mobile)
  let lastDist = 0;
  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
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
        scale = Math.min(4, Math.max(1, scale * (dist / lastDist)));
        applyTransform();
      }
      lastDist = dist;
    } else if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      applyTransform();
    }
  }, { passive: false });

  img.addEventListener('touchend', () => {
    isDragging = false;
    lastDist = 0;
    if (scale < 1.05) resetZoom();
  });

  // Drag when zoomed (desktop)
  img.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    img.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    if (img) img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  });

  box._resetZoom = resetZoom;
  return box;
}

function openFullscreen(url) {
  if (!url) return;
  const box = ensureLightbox();
  const img = box.querySelector('img');
  img.src = url;
  if (box._resetZoom) box._resetZoom();
  box.classList.add('open');
}

// Gallery thumbs + open fullscreen
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
