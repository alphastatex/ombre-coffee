import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    page.on('dialog', async dialog => {
        console.log(`[Playwright] Перехвачен алерт: ${dialog.message()}`);
        await dialog.dismiss();
    });

    await page.addInitScript(() => {
        // @ts-ignore
        window.turnstile = { reset: () => {}, render: () => {} };
    });
});

test('сайт открывается и прелоадер уходит', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.preloader')).toBeHidden({ timeout: 6000 });
});

test('CTA-кнопка имеет правильный текст', async ({ page }) => {
    await page.goto('/');
    const ctaBtn = page.locator('.nav-cta');
    await expect(ctaBtn).toContainText(/Забронировать/i);
});

test('маска телефона работает в живом браузере', async ({ page }) => {
    await page.goto('/');
    await page.fill('#phone', '9991234567');
    await expect(page.locator('#phone')).toHaveValue('+7 (999) 123-45-67');
});

test('форма ругается на пустые поля (без прохождения капчи)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#bookingForm');
    
    await page.evaluate(() => {
        const form = document.getElementById('bookingForm');
        if (form) {
            const input = document.createElement('input');
            input.name = 'cf-turnstile-response';
            input.value = 'fake-test-token';
            input.type = 'hidden';
            form.appendChild(input);
        }
    });

    // 🔥 ФИКС: Вызываем событие submit напрямую, чтобы обойти HTML5-валидацию
    await page.evaluate(() => {
        const form = document.getElementById('bookingForm');
        if (form) {
            const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
            form.dispatchEvent(submitEvent);
        }
    });
    
    await expect(page.locator('#phoneError')).toBeVisible();
});

test('лайтбокс открывается и закрывается по Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-lightbox="0"]').click();
    await expect(page.locator('#lightbox')).toHaveClass(/is-active/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/is-active/);
});

test('карусель отзывов переключается', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nextBtn').click();
    await expect(page.locator('.dot').nth(1)).toHaveClass(/active/);
});