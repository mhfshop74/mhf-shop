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

// Multi-image gallery
const mainImgEl = document.getElementById('mainProductImg');
const thumbEls = document.querySelectorAll('.detail-thumb');
if (mainImgEl && thumbEls.length) {
  thumbEls.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-img');
      if (url) mainImgEl.style.backgroundImage = "url('" + url + "')";
      thumbEls.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}
