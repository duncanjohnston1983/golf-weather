export function formatHour(h: number): string {
  const hours = Math.floor(h);
  const mins = h % 1 >= 0.5 ? '30' : '00';
  return `${String(hours).padStart(2, '0')}:${mins}`;
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
