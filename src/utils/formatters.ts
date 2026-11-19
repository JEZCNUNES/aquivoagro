// Utilitários de formatação para AgroArquivo (BRL, datas brasileiras, arquivos)

export function formatCurrency(cents: number | undefined | null): string {
  if (cents === undefined || cents === null || isNaN(cents)) {
    return 'R$ 0,00';
  }
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const reais = Math.floor(absCents / 100);
  const remainingCents = absCents % 100;

  const reaisFormatted = reais.toLocaleString('pt-BR');
  const centsFormatted = remainingCents.toString().padStart(2, '0');

  return `${isNegative ? '-' : ''}R$ ${reaisFormatted},${centsFormatted}`;
}

export function parseCurrencyToCents(val: string | number): number {
  if (typeof val === 'number') {
    return Math.round(val * 100);
  }
  if (!val) return 0;
  // Remove R$, espaços, e substitui pontos por nada e vírgula por ponto
  const clean = val
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  // Aceita YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToIso(baseIso: string, days: number): string {
  const [y, m, d] = baseIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDiff(targetDateIso: string, fromDateIso?: string): number {
  const from = fromDateIso ? fromDateIso : getTodayIso();
  const [y1, m1, d1] = targetDateIso.split('-').map(Number);
  const [y2, m2, d2] = from.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1).getTime();
  const date2 = new Date(y2, m2 - 1, d2).getTime();
  const diffTime = date1 - date2;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


export const formatCurrencyBRL = formatCurrency;
export const formatDateBR = formatDate;
