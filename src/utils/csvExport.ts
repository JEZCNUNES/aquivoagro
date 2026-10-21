// Utilitário de exportação CSV funcional compatível com Excel e LibreOffice (pt-BR)

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  const sanitize = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(sanitize).join(';');
  const dataLines = rows
    .map((row) => row.map(sanitize).join(';'))
    .join('\r\n');

  // Adiciona BOM UTF-8 para o Excel reconhecer acentuação em português
  const csvContent = '\uFEFF' + headerLine + '\r\n' + dataLines;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
