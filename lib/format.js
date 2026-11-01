export const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

export const num = (n) => Number(n || 0).toLocaleString('en-PK');

export function ticketNo(n) {
  return String(n || 0).padStart(6, '0');
}

export function timeLeft(iso, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'Closed';
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m % 60}m left`;
  return `${Math.max(1, m)}m left`;
}

export function dateTime(iso) {
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' });
}

export const METHODS = { easypaisa: 'Easypaisa', jazzcash: 'JazzCash', bank: 'Bank transfer' };
