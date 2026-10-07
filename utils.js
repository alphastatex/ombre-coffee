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
    if (value.length > 0) formatted += ` (${value.slice(0, 3)}`;
    if (value.length > 3) formatted += `) ${value.slice(3, 6)}`;
    if (value.length > 6) formatted += `-${value.slice(6, 8)}`;
    if (value.length > 8) formatted += `-${value.slice(8, 10)}`;
    return formatted;
}