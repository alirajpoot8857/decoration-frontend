/**
 * Validation utilities for Lumière Décor
 * Enforces strict Pakistani phone number validation.
 */

export function isValidPakistaniPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Clean all spaces, dashes, parentheses, dots
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Must match Pakistani mobile (03xx) or landline (02x-09x)
  // Rejects all international numbers outside Pakistan (+1, +44, +91, +971, etc.)
  const pakistaniRegex = /^(\+92|0092|92)?(0?3[0-9]{9}|0?[2-9][0-9]{8,9})$/;
  return pakistaniRegex.test(cleaned);
}

export function formatPakistaniPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+92')) return cleaned;
  if (cleaned.startsWith('0092')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('92')) return '+' + cleaned;
  if (cleaned.startsWith('03')) return '+92' + cleaned.slice(1);
  return phone;
}
