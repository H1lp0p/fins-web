/** Период сбора процентов и т.п.: секунды → короткая строка. */
export function formatDurationFromSeconds(total: number | undefined): string {
  if (total == null || Number.isNaN(total) || total < 0) return "—";
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const restMin = minutes % 60;
  if (restMin === 0) return `${hours} h`;
  return `${hours} h ${restMin} min`;
}
