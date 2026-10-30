export default {
  // ctx (третий аргумент) для функции waitUntil
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Функция проверки пароля админа (берем из секретов Cloudflare)
    const isAdmin = (req) => {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
      const token = authHeader.split(' ')[1];
      return token === env.ADMIN_PASSWORD; 
    };

    try {
      // ==========================================
      // 1. АДМИНКА: Получение списка заявок (GET)
      // ==========================================
      if (path === '/api/applications' && method === 'GET') {
        if (!isAdmin(request)) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }

        const list = await env.APPLICATIONS.list();
        const applications = [];

        for (const key of list.keys) {
          const data = await env.APPLICATIONS.get(key.name);
          if (data) {
            const parsed = JSON.parse(data);
            applications.push({ id: key.name, ...parsed, status: parsed.status || 'new' });
          }
        }
        // Сортируем от новых к старым
        applications.sort((a, b) => new Date(b.received_at || b.timestamp) - new Date(a.received_at || a.timestamp));
        
        return new Response(JSON.stringify(applications), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // ==========================================
      // 2. АДМИНКА: Обновление статуса (PATCH)
      // ==========================================
      if (path.startsWith('/api/applications/') && method === 'PATCH') {
        if (!isAdmin(request)) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }

        const applicationId = path.split('/').pop();
        const body = await request.json();
        const { status } = body;
        
        if (!['new', 'progress', 'done'].includes(status)) {
          return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }

        const existingData = await env.APPLICATIONS.get(applicationId);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }

        const parsedData = JSON.parse(existingData);
        parsedData.status = status;
        parsedData.updated_at = new Date().toISOString();

        await env.APPLICATIONS.put(applicationId, JSON.stringify(parsedData));
        
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // ==========================================
      // 3. АДМИНКА: Удаление заявки (DELETE)
      // ==========================================
      if (path.startsWith('/api/applications/') && method === 'DELETE') {
        if (!isAdmin(request)) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        
        const applicationId = path.split('/').pop();
        await env.APPLICATIONS.delete(applicationId);
        
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // ==========================================
      // 4. САЙТ: Отправка новой заявки (POST)
      // ==========================================
      if (path === '/' && method === 'POST') {
        const data = await request.json();
        
        // === ПРОВЕРКА CLOUDFLARE TURNSTILE ===
        const turnstileToken = data.turnstileToken;
        
        if (!turnstileToken) {
          return new Response(JSON.stringify({ error: 'Отсутствует токен капчи. Вы робот?' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }

        const turnstileFormData = new FormData();
        turnstileFormData.append('secret', env.TURNSTILE_SECRET);
        turnstileFormData.append('response', turnstileToken);
        // Передаем IP пользователя для доп. проверки (Cloudflare автоматически подставляет CF-Connecting-IP)
        const ip = request.headers.get('CF-Connecting-IP');
        if (ip) turnstileFormData.append('remoteip', ip);

        const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: turnstileFormData,
        });

        const turnstileOutcome = await turnstileResponse.json();

        if (!turnstileOutcome.success) {
          console.error("Turnstile validation failed:", turnstileOutcome['error-codes']);
          return new Response(JSON.stringify({ error: 'Не пройдена проверка на робота' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
        // =====================================

        let username = "🌐 Из браузера (без Telegram)";

        // Валидация Telegram initData
        if (data.initData && data.initData.length > 0) {
          const isValidTG = await validateInitData(data.initData, env.BOT_TOKEN);
          if (isValidTG) {
            const urlParams = new URLSearchParams(data.initData);
            const userStr = urlParams.get("user");
            const user = userStr ? JSON.parse(userStr) : null;
            username = user?.username ? `@${user.username}` : `ID: ${user?.id || 'Неизвестно'}`;
          } else {
            username = "⚠️ Невалидный Telegram";
          }
        }

        // Экранирование HTML (защита от XSS)
        const escapeHTML = (str) => (str || '').replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));

        // Формируем текст для Телеграма
        const text = `☕ <b>НОВАЯ ЗАЯВКА — КОФЕЙНЯ ОМБРЕ</b>

👤 <b>Клиент:</b> ${escapeHTML(data.name)} (${username})
📞 <b>Телефон:</b> ${escapeHTML(data.phone)}
📅 <b>Дата:</b> ${escapeHTML(data.date)}
🕒 <b>Время:</b> ${escapeHTML(data.time)}
👥 <b>Гостей:</b> ${escapeHTML(data.guests)}
💬 <b>Комментарий:</b> ${escapeHTML(data.comment) || '—'}`;

        // Сохраняем в KV структурированные данные
        const applicationId = crypto.randomUUID();
        const dataToSave = {
          raw_data: {
            name: data.name, 
            phone: data.phone, 
            date: data.date, 
            time: data.time, 
            guests: data.guests, 
            comment: data.comment
          },
          text: text,
          status: 'new',
          received_at: new Date().toISOString()
        };
        
        if (env.APPLICATIONS) {
          await env.APPLICATIONS.put(applicationId, JSON.stringify(dataToSave));
        }

        // ОТПРАВЛЯЕМ В TELEGRAM АСИНХРОННО (в фоне)
        ctx.waitUntil((async () => {
          try {
            const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: 'HTML' }),
            });
            const result = await tgRes.json();
            if (!result.ok) {
              console.error("Ошибка Telegram API:", result.description);
            }
          } catch (err) {
            console.error("Сбой сети при отправке в Telegram:", err.message);
          }
        })());

        // МГНОВЕННО возвращаем ответ браузеру
        return new Response(JSON.stringify({ success: true, id: applicationId }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
};

// Функция валидации initData (HMAC-SHA256)
async function validateInitData(initData, botToken) {
  if (!initData) return false;
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return false;
  urlParams.delete('hash');
  const dataCheckString = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey('raw', encoder.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secret = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataCheckString));
  const hexSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hexSignature === hash;
}