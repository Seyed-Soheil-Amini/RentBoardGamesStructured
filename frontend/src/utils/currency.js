/**
 * Format a number into Iranian Toman price with 3-digit comma separator.
 * e.g. 1500000 -> "1,500,000"
 * 
 * @param {number|string} value - The numerical value to format
 * @returns {string} Formatted number with comma separators
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '0';

  // Round to nearest integer as Toman does not use fractional coins
  const rounded = Math.round(num);
  return rounded.toLocaleString('en-US');
};

/**
 * Format a number with 3-digit separator and Toman currency unit.
 * 
 * @param {number|string} value - The numerical value to format
 * @param {string} [lang='fa'] - Language code ('fa' or 'en')
 * @returns {string} e.g. "1,500,000 تومان" or "1,500,000 Toman"
 */
export const formatCurrency = (value, lang = 'fa') => {
  const formatted = formatPrice(value);
  const unit = lang === 'fa' ? 'تومان' : 'Toman';
  return `${formatted} ${unit}`;
};
