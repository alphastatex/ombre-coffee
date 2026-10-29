# 🏆 MASTER CONTEXT: Кофейня Омбре (Ombre Coffee)

## 🌍 Глобальный контекст
- **Статус:** Production-ready. Безопасная архитектура (Zero Trust), CRM-админка, KV-база.
- **Проект:** Сайт + Telegram Mini App + Cloudflare Worker (прокси и база данных).
- **Пайплайн:** Vitest (юнит), Playwright (E2E), Biome, Wrangler.

---

## 🏗 Архитектура и Безопасность

1. **Frontend (GitHub Pages):** 
   - Сайт: `index.html` + `main.js` (бывший `app.js`). 
   - Админка: `admin.html` (тоже на GitHub Pages, защищена паролем).
2. **Backend (Cloudflare Worker: `tg-ombre-proxy`):**
   - **API:** 
     - `POST /` — создание заявки (валидация `initData`, XSS-защита, сохранение в KV, фоновая отправка в TG).
     - `GET /api/applications` — список заявок для админки (требует `Authorization: Bearer`).
     - `PATCH /api/applications/:id` — обновление статуса.
     - `DELETE /api/applications/:id` — удаление заявки.
   - **База данных:** Cloudflare KV (`env.APPLICATIONS`). Формат: `{ raw_data: {...}, text: "...", status: "new", received_at: "..." }`.
   - **Секреты (wrangler secret):** `BOT_TOKEN`, `CHAT_ID`, `ADMIN_PASSWORD`.

---

## 📦 Ключевые конфиги и структура

```text
ombre-coffee/
├── index.html              # Разметка сайта
├── admin.html              # Админ-панель (деплоится на GitHub Pages)
├── main.js                 # Логика фронтенда (бывший app.js, чтобы сбросить кэш)
├── styles.css              # Стили
├── utils.js                # Чистые функции
├── tests/smoke.spec.js     # E2E-тесты
└── tg-ombre-proxy/         # Бэкенд (Cloudflare Worker)
    ├── src/index.js        # Безопасный код воркера
    ├── .gitignore          # Игнорируем node_modules
    └── wrangler.toml       # Конфиг (KV биндинг)
```

---

## 🐛 История исправленных багов (Критично!)
1. **Open Relay:** Убрали пароль `asswecan1310` из кода в `wrangler secret`.
2. **XSS:** Внедрили `escapeHTML` на сервере.
3. **Подделка данных:** Внедрили валидацию `initData` (HMAC-SHA256).
4. **CORS:** Добавили `Authorization` в `Access-Control-Allow-Headers`.
5. **Таймаут Telegram:** Внедрили `ctx.waitUntil()` для фоновой отправки (форма отвечает моментально).
6. **Кэш `app.js`:** Переименовали в `main.js`, чтобы браузеры подтянули новую логику.

---

## 🎯 Roadmap
- [ ] Добавить Rate Limiting (защита от спама с сайта).
- [ ] Добавить Cloudflare Turnstile (капча).
- [ ] Обновить портфолио (добавить кейс с безопасной CRM).