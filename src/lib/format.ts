export function formatMoney(n: number): string {
  return '$' + Number(n).toLocaleString('es-AR');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "2026-08-02" -> "Domingo, 2 de agosto" (long weekday + day + month, capitalized) */
export function formatFechaLarga(iso: string): string {
  const dt = new Date(iso + 'T12:00:00');
  const txt = dt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return capitalize(txt);
}

/** "2026-08-02" -> "2 de agosto" */
export function formatFechaCorta(iso: string): string {
  const dt = new Date(iso + 'T12:00:00');
  return dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}
