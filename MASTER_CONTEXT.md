# 🏆 MASTER CONTEXT: Кофейня Омбре (Ombre Coffee)

## 🌍 Глобальный контекст обучения
- **Цель:** Обучение вайбкодингу, веб-разработке, созданию ботов и маркетингу для выхода на рынок РФ и монетизации.
- **Прогресс:** Сделано 2 полных проекта (сайт кофейни "Омбре" и сайт барбершопа).
- **Текущий статус:** Проект "Омбре" полностью завершён, имеет инженерный пайплайн и 13 автотестов.

---

## 🏗 Архитектура и Пайплайн

Проект использует полный набор инструментов проверки качества:
1. **Prettier** — форматирование.
2. **Biome** — линтинг.
3. **TypeScript (@ts-check)** — проверка типов через JSDoc.
4. **Vitest** — юнит-тесты (7 тестов).
5. **Playwright** — e2e-тесты (6 тестов).

### Структура файлов

ombre-coffee/
├── index.html              # Разметка (с type="module")
├── styles.css              # Все стили
├── app.js                  # Основная логика (с @ts-check и импортом utils)
├── utils.js                # Чистые функции (маска телефона)
├── utils.test.js           # Юнит-тесты для utils.js
── tests/smoke.spec.js     # E2E-тесты для Playwright
├── biome.json              # Конфиг линтера
├── vitest.config.js        # Конфиг Vitest (исключает папку tests/)
├── playwright.config.js    # Конфиг Playwright (запускает serve)
└── package.json            # Зависимости (type: "module")

---

## 📦 Ключевые конфиги и код (для быстрого восстановления)

### 1. package.json (Ключевые поля)

    {
      "name": "ombre-coffee",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "test": "vitest run",
        "e2e": "playwright test"
      },
      "devDependencies": {
        "@biomejs/biome": "^1.x.x",
        "@playwright/test": "^1.63.0",
        "vitest": "^5.0.3",
        "serve": "^14.x.x"
      }
    }

### 2. biome.json

    {
      "formatter": { "enabled": false },
      "linter": {
        "enabled": true,
        "rules": { "recommended": true }
      }
    }

### 3. vitest.config.js

    import { defineConfig } from 'vitest/config';
    export default defineConfig({
        test: {
            include: ['**/*.test.js'],
            exclude: ['node_modules/', 'tests/'],
        },
    });

### 4. utils.js (Чистая функция маски телефона)

    // @ts-check
    /**
     * Форматирует телефон в маску +7 (XXX) XXX-XX-XX
     * Разделители появляются только когда следующая группа цифр начата
     * @param {string} raw - строка с любыми символами
     * @returns {string} отформатированный телефон
     */
    export function formatPhone(raw) {
        let value = raw.replace(/\D/g, '');
        if (value.startsWith('7')) value = value.slice(1);
        if (value.startsWith('8')) value = value.slice(1);
        value = value.slice(0, 10);

        let formatted = '+7';
        if (value.length > 0) formatted +=  (;
        if (value.length > 3) formatted += ) ;
        if (value.length > 6) formatted += -;
        if (value.length > 8) formatted += -;
        return formatted;
    }

### 5. utils.test.js (7 юнит-тестов)

    import { describe, expect, it } from 'vitest';
    import { formatPhone } from './utils.js';

    describe('formatPhone — маска телефона', () => {
        it('форматирует голый номер', () => {
            expect(formatPhone('9991234567')).toBe('+7 (999) 123-45-67');
        });
        it('съедает префикс 7', () => {
            expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67');
        });
        it('съедает префикс 8', () => {
            expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
        });
        it('работает с частичным вводом', () => {
            expect(formatPhone('999123')).toBe('+7 (999) 123');
        });
        it('игнорирует мусор и символы', () => {
            expect(formatPhone('+7 (999) 123-45-67')).toBe('+7 (999) 123-45-67');
        });
        it('пустой ввод = +7', () => {
            expect(formatPhone('')).toBe('+7');
        });
        it('обрезает лишние цифры', () => {
            expect(formatPhone('999123456799999')).toBe('+7 (999) 123-45-67');
        });
    });

### 6. app.js (Краткое описание логики и паттернов)

*(Полный код лежит в файле app.js. Здесь зафиксированы ключевые паттерны для понимания логики).*

- **Содержит:** Preloader, Custom Cursor, Magnetic Buttons, Scroll Progress, Reveal Animations, Parallax v3, Counter, Lightbox, Reviews Carousel, Form Validation (с импортом formatPhone), Smooth Scroll.
- **Ключевые паттерны:**
  - ?. (optional chaining) для безопасных вызовов.
  - JSDoc касты /** @type {HTMLElement} */ (document.querySelector(...)) для TypeScript.
  - Guard-clauses if (!el) return;.
  - window.setInterval (для избежания конфликта типов Node/Browser).

---

## 🐛 История исправленных багов (Критично для контекста!)

1. **CTA-кнопка "Забронировать":** Текст-призрак в углу при hover. *Фикс:* Убран data-text, усилены селекторы CSS (.nav-links a.nav-cta).
2. **Parallax:** Прыгал при первом скролле. *Фикс:* Delta-based формула (window.scrollY - baseScrollY).
3. **Лейблы селектов:** Накладывались на текст. *Фикс:* Отдельные CSS селекторы для <select> и <input type="date">.
4. **Маска телефона:** Висячий дефис на 6 цифрах. *Фикс:* Изменено >= на > в utils.js (поймано красным тестом!).
5. **TypeScript setInterval:** Ошибка ts(2322) из-за типов Node. *Фикс:* window.setInterval().
6. **Biome import:** Ошибка "outside of a module". *Фикс:* "type": "module" в package.json.
7. **Конфликт раннеров:** Vitest хватал Playwright тесты. *Фикс:* exclude: ['tests/**'] в itest.config.js.

---

##  Команды для разработки

    npm test              # Запуск юнит-тестов (Vitest)
    npm run e2e           # Запуск e2e-тестов (Playwright)
    npx @biomejs/biome lint app.js  # Линтинг
    npx prettier --write .          # Форматирование
    npx serve .           # Локальный сервер (или Live Server в VS Code)

---

## 🎯 Следующие шаги (Roadmap)

- [ ] Настройка CI/CD на GitHub Actions (авто-тесты при пуше).
- [ ] Деплой на Netlify/Vercel.
- [ ] Разработка сайта барбершопа (применение того же пайплайна).
- [ ] Создание Telegram Mini Apps для монетизации.
