// === ИМПОРТЫ ===
import { formatPhone } from './utils.js';

// === ОПРЕДЕЛЕНИЕ TELEGRAM MINI APP ===
function isTelegramMiniApp() {
  return !!(window.Telegram?.WebApp || 
            navigator.userAgent.includes('Telegram') ||
            window.location.hash.includes('tgWebAppData'));
}

const IS_TG_APP = isTelegramMiniApp();

// === БЫСТРАЯ ИНИЦИАЛИЗАЦИЯ ===
function removePreloader() {
  document.body.classList.remove('is-loading');
  const preloader = document.querySelector('.preloader');
  const hero = document.querySelector('.hero');
  const nav = document.querySelector('nav');
  
  if (preloader) preloader.classList.add('is-hidden');
  if (hero) hero.classList.add('is-loaded');
  if (nav) nav.classList.add('is-loaded');
  
  setTimeout(() => {
    if (preloader) preloader.remove();
  }, 800);
}

setTimeout(removePreloader, 2500);

// === TELEGRAM MINI APP ===
if (IS_TG_APP) {
  document.body.classList.add('telegram-mini-app');
  
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    const nameInput = document.getElementById('name');
    if (tg.initDataUnsafe?.user?.first_name && nameInput) {
      nameInput.value = tg.initDataUnsafe.user.first_name;
      nameInput.readOnly = true;
    }
    
    tg.MainButton.setText('ОТПРАВИТЬ ЗАЯВКУ');
    tg.MainButton.setTextColor('#ffffff');
    tg.MainButton.setColor('#8b6f47');
    tg.MainButton.hide();
    tg.MainButton.onClick(() => {
      const submitBtn = document.querySelector('#bookingForm button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
  }
}

// === BLUR-UP АНИМАЦИЯ ===
function initHeroBlurUp() {
  const heroImages = document.querySelectorAll('.hero-image-main, .hero-image-accent');
  
  heroImages.forEach((img, index) => {
    const showImage = () => {
      setTimeout(() => img.classList.add('is-loaded'), 200 + (index * 200));
    };
    
    if (img.complete) {
      showImage();
    } else {
      img.addEventListener('load', showImage);
      img.addEventListener('error', showImage);
    }
  });
}

// === CURSOR ===
if (!IS_TG_APP) {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let cursorHidden = false;
  
  document.addEventListener('mousemove', (e) => {
    if (cursorHidden) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }
  });
  
  function animateRing() {
    if (!cursorHidden) {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (cursorRing) {
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
    }
    requestAnimationFrame(animateRing);
  }
  animateRing();
  
  const hoverTargets = document.querySelectorAll('a, button, .menu-item, .gallery-item, .review-card');
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
  
  const formElements = document.querySelectorAll('select, input[type="date"], input[type="time"]');
  formElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorHidden = true;
      document.body.classList.add('cursor-hidden');
    });
    el.addEventListener('mouseleave', () => {
      cursorHidden = false;
      document.body.classList.remove('cursor-hidden');
    });
    el.addEventListener('blur', () => {
      cursorHidden = false;
      document.body.classList.remove('cursor-hidden');
    });
  });
  
  document.addEventListener('mousemove', (e) => {
    const isOverForm = e.target.closest('select, input[type="date"], input[type="time"]');
    if (!isOverForm && cursorHidden) {
      cursorHidden = false;
      document.body.classList.remove('cursor-hidden');
    }
  });
}

// === PRELOADER ===
window.addEventListener('load', () => {
  removePreloader();
  initHeroBlurUp();
});

// === SCROLL PROGRESS ===
const scrollProgress = document.querySelector('.scroll-progress');
const nav = document.querySelector('nav');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) {
    scrollProgress.style.width = `${(scrolled / maxScroll) * 100}%`;
  }
  if (nav) nav.classList.toggle('is-scrolled', scrolled > 50);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', scrolled > 500);
});

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

// === COUNTER ===
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

document.querySelectorAll('[data-counter]').forEach((el) => {
  counterObserver.observe(el);
});

// === LIGHTBOX ===
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

// === REVIEWS CAROUSEL ===
const reviews = [
  { name: 'Анна К.', avatar: 'https://i.pravatar.cc/80?img=1', text: 'Наконец-то нашла место в нашем районе, где кофе действительно вкусный!' },
  { name: 'Дмитрий М.', avatar: 'https://i.pravatar.cc/80?img=3', text: 'Прихожу сюда каждое утро перед работой. Атмосфера потрясающая.' },
  { name: 'Елена С.', avatar: 'https://i.pravatar.cc/80?img=5', text: 'Обожаю их десерты! Чизкейк просто тает во рту.' },
  { name: 'Максим В.', avatar: 'https://i.pravatar.cc/80?img=7', text: 'Отличное место для удаленки. Wi-Fi летает.' },
  { name: 'София Л.', avatar: 'https://i.pravatar.cc/80?img=9', text: 'Заходили с мужем случайно. Влюбились в интерьер!' },
  { name: 'Игорь П.', avatar: 'https://i.pravatar.cc/80?img=11', text: 'Как кофейный сноб со стажем, зерно у ребят топовое.' },
  { name: 'Мария Т.', avatar: 'https://i.pravatar.cc/80?img=13', text: 'Спасли мой день! Взяла здесь авокадо-тост и латте.' },
  { name: 'Алексей Р.', avatar: 'https://i.pravatar.cc/80?img=15', text: 'Хорошая кофейня в спальном районе. Цены адекватные.' },
  { name: 'Виктория Б.', avatar: 'https://i.pravatar.cc/80?img=16', text: 'Атмосфера 10/10. Раф с лавандой — мой фаворит.' }
];

const coffeeCupSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="currentColor"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
const cupsHTML = Array(5).fill(coffeeCupSVG).join('');

const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const container = document.getElementById('carouselContainer');

let currentIndex = 0;
let slidesPerView = IS_TG_APP ? 1 : 3;
let autoPlayInterval;

function getSlidesPerView() {
  if (IS_TG_APP) return 1;
  if (window.innerWidth <= 968) return 1;
  if (window.innerWidth <= 1200) return 2;
  return 3;
}

function renderReviews() {
  track.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <img src="${r.avatar}" alt="${r.name}" class="review-avatar" loading="lazy">
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-cups">${cupsHTML}</div>
        </div>
      </div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
  
  updateDots();
}

function updateDots() {
  const totalSlides = Math.ceil(reviews.length / slidesPerView);
  dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
    `<div class="dot ${i === currentIndex ? 'active' : ''}" data-index="${i}"></div>`
  ).join('');
}

function updateCarousel() {
  const firstCard = track.children[0];
  const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth + 40 : 0;
  track.style.transform = `translateX(-${currentIndex * slidesPerView * cardWidth}px)`;
  updateDots();
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

function startAutoPlay() { 
  stopAutoPlay();
  autoPlayInterval = window.setInterval(nextSlide, 5000); 
}

function stopAutoPlay() { 
  window.clearInterval(autoPlayInterval); 
}

renderReviews();

if (IS_TG_APP) {
  setTimeout(() => {
    slidesPerView = 1;
    updateCarousel();
  }, 600);
} else {
  updateCarousel();
  startAutoPlay();
}

nextBtn.addEventListener('click', () => { nextSlide(); if (!IS_TG_APP) { stopAutoPlay(); startAutoPlay(); } });
prevBtn.addEventListener('click', () => { prevSlide(); if (!IS_TG_APP) { stopAutoPlay(); startAutoPlay(); } });

dotsContainer.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('dot')) {
    currentIndex = parseInt(target.dataset.index || '0', 10);
    updateCarousel();
    if (!IS_TG_APP) { stopAutoPlay(); startAutoPlay(); }
  }
});

if (!IS_TG_APP) {
  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);
}

window.addEventListener('resize', () => {
  const newSlidesPerView = getSlidesPerView();
  if (newSlidesPerView !== slidesPerView) {
    slidesPerView = newSlidesPerView;
    currentIndex = 0;
    renderReviews();
    updateCarousel();
  }
});

// === FORM ===
const form = document.getElementById('bookingForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const guestsSelect = document.getElementById('guests');
const PROXY_URL = 'https://tg-ombre-proxy.alphastatex.workers.dev';

phoneInput.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

function showError(id, show) {
  const message = document.getElementById(id);
  const input = document.getElementById(id.replace('Error', ''));
  if (message && input) {
    message.classList.toggle('show', show);
    input.classList.toggle('error', show);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  let valid = true;
  const name = nameInput.value.trim();
  const phone = phoneInput.value.replace(/\D/g, '');
  const date = dateInput.value;
  const time = timeSelect.value;
  const guests = guestsSelect.value;
  const comment = document.getElementById('comment').value.trim();
  
  if (name.length < 2) { showError('nameError', true); valid = false; } else showError('nameError', false);
  if (phone.length !== 11) { showError('phoneError', true); valid = false; } else showError('phoneError', false);
  if (!date) { showError('dateError', true); valid = false; } else showError('dateError', false);
  if (!time) { showError('timeError', true); valid = false; } else showError('timeError', false);
  if (!guests) { showError('guestsError', true); valid = false; } else showError('guestsError', false);
  
  if (!valid) return;
  
  const messageText = `🆕 НОВАЯ ЗАЯВКА — ОМБРЕ\n👤 ${name}\n📞 +${phone}\n📅 ${date} ${time}\n ${guests}\n💬 ${comment || '—'}`;
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ text: messageText }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      document.getElementById('successModal').classList.add('show');
      form.reset();
      if (IS_TG_APP && window.Telegram?.WebApp?.MainButton) {
        window.Telegram.WebApp.MainButton.hide();
      }
    } else {
      alert('Ошибка при отправке. Позвоните нам: +7 (495) 123-45-67');
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Ошибка сети. Позвоните нам: +7 (495) 123-45-67');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

['name', 'phone', 'date', 'time', 'guests'].forEach((id) => {
  const field = document.getElementById(id);
  if (field) {
    field.addEventListener('input', () => showError(`${id}Error`, false));
  }
});

const successModal = document.getElementById('successModal');
document.getElementById('modalClose')?.addEventListener('click', () => {
  successModal?.classList.remove('show');
});

successModal?.addEventListener('click', (e) => {
  if (e.target === successModal) successModal.classList.remove('show');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') successModal?.classList.remove('show');
});