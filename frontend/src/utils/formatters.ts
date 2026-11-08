/**
 * Format tiyin (integer) to UZS formatted string.
 * Example: 50000000 -> "500 000 UZS"
 */
export function formatUZS(tiyinAmount: number): string {
  const sum = tiyinAmount / 100;
  return new Intl.NumberFormat('uz-UZ').format(sum) + ' UZS';
}

/**
 * Format ISO date string into readable Uzbek format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

