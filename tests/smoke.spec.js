import { expect, test } from '@playwright/test';

test('сайт открывается и прелоадер уходит', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.preloader')).toBeHidden({ timeout: 6000 });
});

test('CTA-кнопка без текста-призрака (наш бывший баг)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-cta')).not.toHaveAttribute('data-text');
});

test('маска телефона работает в живом браузере', async ({ page }) => {
    await page.goto('/');
    await page.fill('#phone', '9991234567');
    await expect(page.locator('#phone')).toHaveValue('+7 (999) 123-45-67');
});

test('форма ругается на пустые поля', async ({ page }) => {
    await page.goto('/');
    await page.locator('.booking-form button[type="submit"]').click();
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