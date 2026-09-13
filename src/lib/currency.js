/**
 * LUMIÈRE DÉCOR - Pakistani Rupee (PKR) Currency Utility
 * Handles consistent currency formatting across all frontend modules and components.
 */

export const DEFAULT_CURRENCY = 'PKR';

/**
 * Formats numeric amounts in Pakistani Rupees (PKR).
 * Example: formatPKR(5000) => "PKR 5,000"
 * Example: formatPKR(16.5, { decimals: 2 }) => "PKR 16.50"
 */
export function formatPKR(amount, options = {}) {
  const num = Number(amount) || 0;
  const {
    showSymbol = true,
    symbol = 'PKR',
    decimals = 0,
  } = options;

  const formattedNum = num.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!showSymbol) return formattedNum;
  return `${symbol} ${formattedNum}`;
}

/**
 * Shorthand helper for standard pricing displays.
 */
export function formatPrice(amount, decimals = 0) {
  return formatPKR(amount, { decimals });
}

export default formatPKR;
