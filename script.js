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

// Header shadow on scroll
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}

// Product multi-image gallery
const mainImg = document.getElementById('mainProductImg');
const thumbs = document.querySelectorAll('.detail-thumb');

if (mainImg && thumbs.length) {
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-img');
      if (url) {
        mainImg.style.backgroundImage = "url('" + url + "')";
      }
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// WhatsApp order buttons (if present)
document.querySelectorAll('.order-whatsapp').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const name = this.getAttribute('data-name') || 'Product';
    const price = this.getAttribute('data-price') || '';
    const image = this.getAttribute('data-image') || '';
    const pageUrl = window.location.href;

    let message = 'Hi MHF SHOP, I want to order this product:\n\n*' + name + '*';
    if (price) message += '\nPrice: ' + price;
    message += '\n\nProduct page:\n' + pageUrl;
    if (image) message += '\n\nProduct picture:\n' + image;

    window.open('https://wa.me/8801324978737?text=' + encodeURIComponent(message), '_blank');
  });
});
