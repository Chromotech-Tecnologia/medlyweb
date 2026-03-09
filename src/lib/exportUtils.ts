/**
 * Export data to CSV and trigger download
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv(
  data: any[],
  filename: string,
  columns?: { key: string; label: string }[]
): void {
  if (data.length === 0) return;

  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));
  
  const header = cols.map((c) => `"${c.label}"`).join(',');
  
  const rows = data.map((row) =>
    cols
      .map((c) => {
        const value = row[c.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
