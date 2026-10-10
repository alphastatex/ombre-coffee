import { formatPhone } from './utils.js';

// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    const hero = document.querySelector('.hero');
    const nav = document.querySelector('nav');
    
    if (preloader) preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    if (hero) hero.classList.add('is-loaded');
    if (nav) nav.classList.add('is-loaded');
    
    setTimeout(() => {
      if (preloader) preloader.remove();
    }, 800);
  }, 1800);
});

// ===== CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (cursorRing) {
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateRing);
}
animateRing();

const hoverTargets = document.querySelectorAll('a, button, .menu-item, .gallery-item, .review-card, input, select, textarea');
hoverTargets.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.classList.add('is-hover');
    if (cursorRing) cursorRing.classList.add('is-hover');
  });
  el.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.classList.remove('is-hover');
    if (cursorRing) cursorRing.classList.remove('is-hover');
  });
});

document.querySelectorAll('.gallery-item').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.classList.add('is-hover');
    if (cursorRing) {
      cursorRing.classList.remove('is-hover');
      cursorRing.classList.add('is-hover-text');
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.classList.remove('is-hover');
    if (cursorRing) cursorRing.classList.remove('is-hover-text');
  });
});

// ===== MAGNETIC =====
const magneticButtons = document.querySelectorAll('[data-magnetic]');
magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => { 
    btn.style.transform = 'translate(0, 0)'; 
  });
});

// ===== SCROLL PROGRESS =====
const scrollProgress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) {
    scrollProgress.style.width = `${(scrolled / maxScroll) * 100}%`;
  }
});

// ===== NAV SCROLL =====
const nav = document.querySelector('nav');
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 50);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', window.scrollY > 500);
});
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  });
}

// ===== REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-line, .about-image, .map-container, .section-label').forEach((el) => {
  revealObserver.observe(el);
});

const galleryReveals = document.querySelectorAll('.gallery-item.reveal');
galleryReveals.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; });

const menuReveals = document.querySelectorAll('.menu-category.reveal');
menuReveals.forEach((el, i) => { el.style.transitionDelay = `${i * 0.15}s`; });

const statReveals = document.querySelectorAll('.stat-item.reveal');
statReveals.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; });

// ===== PARALLAX v3 =====
const parallaxElements = document.querySelectorAll('[data-parallax]');
let parallaxTicking = false;
const baseScrollY = window.scrollY;

function updateParallax() {
  const delta = window.scrollY - baseScrollY;
  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0');
    el.style.transform = `translate3d(0, ${delta * speed}px, 0)`;
  });
  parallaxTicking = false;
}

window.addEventListener('scroll', () => {
  if (!parallaxTicking) {
    requestAnimationFrame(updateParallax);
    parallaxTicking = true;
  }
}, { passive: true });

// ===== COUNTER =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.counter || '0', 10);
      const duration = 2000;
      const start = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
        if (progress < 1) requestAnimationFrame(updateCounter);
        else el.textContent = target.toLocaleString('ru-RU');
      };
      
      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach((el) => { counterObserver.observe(el); });

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxImages = ['images/atm-1.jpg', 'images/atm-2.jpg', 'images/atm-3.jpg', 'images/atm-4.jpg'];
const lightboxCaptions = ['Утренний свет', 'Тихий уголок', 'Свежая выпечка', 'Простор и свет'];
let currentLightboxIndex = 0;

document.querySelectorAll('[data-lightbox]').forEach((item) => {
  item.addEventListener('click', () => {
    currentLightboxIndex = parseInt(item.getAttribute('data-lightbox') || '0', 10);
    lightboxImg.src = lightboxImages[currentLightboxIndex];
    lightboxImg.alt = lightboxCaptions[currentLightboxIndex];
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove('is-active');
  document.body.style.overflow = '';
}

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  lightboxImg.src = lightboxImages[currentLightboxIndex];
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
  lightboxImg.src = lightboxImages[currentLightboxIndex];
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// ===== REVIEWS =====
const reviews = [
  { name: 'Анна К.', avatar: 'https://i.pravatar.cc/150?img=1', text: 'Наконец-то нашла место в нашем районе, где кофе действительно вкусный! Бариста всегда приветливые, а круассаны — просто космос.' },
  { name: 'Дмитрий М.', avatar: 'https://i.pravatar.cc/150?img=3', text: 'Прихожу сюда каждое утро перед работой. Атмосфера потрясающая — спокойно, уютно, никто не торопит.' },
  { name: 'Елена С.', avatar: 'https://i.pravatar.cc/150?img=5', text: 'Обожаю их десерты! Чизкейк просто тает во рту. И очень нравится, что есть своя пекарня.' },
  { name: 'Максим В.', avatar: 'https://i.pravatar.cc/150?img=7', text: 'Отличное место для удаленки. Wi-Fi летает, розетки у каждого стола. Флэт уайт здесь эталонный.' },
  { name: 'София Л.', avatar: 'https://i.pravatar.cc/150?img=9', text: 'Заходили с мужем случайно. Влюбились в интерьер! Очень светло, много дерева, пахнет свежей выпечкой.' },
  { name: 'Игорь П.', avatar: 'https://i.pravatar.cc/150?img=11', text: 'Как кофейный сноб со стажем, могу сказать: зерно у ребят топовое. Бариста Артем вообще красавчик.' },
  { name: 'Мария Т.', avatar: 'https://i.pravatar.cc/150?img=13', text: 'Спасли мой день! Бежала на встречу, забыла про обед. Взяла здесь авокадо-тост и латте с собой.' },
  { name: 'Алексей Р.', avatar: 'https://i.pravatar.cc/150?img=15', text: 'Хорошая кофейня в спальном районе. Цены адекватные для Москвы, порции большие. Сырники детям зашли.' },
  { name: 'Виктория Б.', avatar: 'https://i.pravatar.cc/150?img=16', text: 'Атмосфера 10/10. Идеально, чтобы почитать книгу или поболтать с подругой. Раф с лавандой — мой фаворит.' }
];

const coffeeCupSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="currentColor"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
const cupsHTML = Array(5).fill(coffeeCupSVG).join('');

const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const container = document.getElementById('carouselContainer');
let currentIndex = 0;
let slidesPerView = 3;
let autoPlayInterval;

function getSlidesPerView() {
  if (window.innerWidth <= 968) return 1;
  if (window.innerWidth <= 1200) return 2;
  return 3;
}

function renderReviews() {
  track.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <img src="${r.avatar}" alt="${r.name}" class="review-avatar">
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-cups">${cupsHTML}</div>
        </div>
      </div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
  
  const totalSlides = Math.ceil(reviews.length / slidesPerView);
  dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
    `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}" role="tab" aria-label="Слайд ${i + 1}"></div>`
  ).join('');
}

function updateCarousel() {
  const firstCard = track.children[0];
  const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth + 40 : 0;
  track.style.transform = `translateX(-${currentIndex * slidesPerView * cardWidth}px)`;
  document.querySelectorAll('.dot').forEach((dot, i) => { dot.classList.toggle('active', i === currentIndex); });
}

function nextSlide() {
  const totalSlides = Math.ceil(reviews.length / slidesPerView);
  currentIndex = (currentIndex + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  const totalSlides = Math.ceil(reviews.length / slidesPerView);
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function startAutoPlay() { autoPlayInterval = window.setInterval(nextSlide, 5000); }
function stopAutoPlay() { window.clearInterval(autoPlayInterval); }

renderReviews();
updateCarousel();
startAutoPlay();

nextBtn.addEventListener('click', () => { nextSlide(); stopAutoPlay(); startAutoPlay(); });
prevBtn.addEventListener('click', () => { prevSlide(); stopAutoPlay(); startAutoPlay(); });

dotsContainer.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('dot')) {
    currentIndex = parseInt(target.dataset.index || '0', 10);
    updateCarousel();
    stopAutoPlay();
    startAutoPlay();
  }
});

container.addEventListener('mouseenter', stopAutoPlay);
container.addEventListener('mouseleave', startAutoPlay);
container.setAttribute('tabindex', '0');
container.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { prevSlide(); stopAutoPlay(); startAutoPlay(); }
  if (e.key === 'ArrowRight') { nextSlide(); stopAutoPlay(); startAutoPlay(); }
});

window.addEventListener('resize', () => {
  const newSlidesPerView = getSlidesPerView();
  if (newSlidesPerView !== slidesPerView) {
    slidesPerView = newSlidesPerView;
    currentIndex = 0;
    renderReviews();
    updateCarousel();
  }
});

// ===== FORM =====
const form = document.getElementById('bookingForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const guestsSelect = document.getElementById('guests');

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

function showError(id, show) {
  const message = document.getElementById(id);
  const input = document.getElementById(id.replace('Error', ''));
  if (!message || !input) return;
  message.classList.toggle('show', show);
  input.classList.toggle('error', show);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  
  const name = nameInput.value.trim();
  const phone = phoneInput.value.replace(/\D/g, '');
  const date = dateInput.value;
  const time = timeSelect.value;
  const guests = guestsSelect.value;
  
  if (name.length < 2) { showError('nameError', true); valid = false; } else showError('nameError', false);
  if (phone.length !== 11) { showError('phoneError', true); valid = false; } else showError('phoneError', false);
  if (!date) { showError('dateError', true); valid = false; } else showError('dateError', false);
  if (!time) { showError('timeError', true); valid = false; } else showError('timeError', false);
  if (!guests) { showError('guestsError', true); valid = false; } else showError('guestsError', false);
  
  if (valid) {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('show');
    form.reset();
  }
});

['name', 'phone', 'date', 'time', 'guests'].forEach((id) => {
  const field = document.getElementById(id);
  if (!field) return;
  field.addEventListener('input', () => showError(`${id}Error`, false));
});

const modalClose = document.getElementById('modalClose');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('show');
  });
}

const successModal = document.getElementById('successModal');
if (successModal) {
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.classList.remove('show');
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('show');
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

// ===== REDUCE MOTION =====
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealElements = document.querySelectorAll('.reveal, .reveal-line');
  revealElements.forEach((el) => {
    el.classList.add('is-visible');
    el.style.transition = 'none';
  });
  const hero = document.querySelector('.hero');
  const navEl = document.querySelector('nav');
  const preloader = document.querySelector('.preloader');
  if (hero) hero.classList.add('is-loaded');
  if (navEl) navEl.classList.add('is-loaded');
  if (preloader) preloader.classList.add('is-hidden');
  document.body.classList.remove('is-loading');
}