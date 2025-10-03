export function computePercent(h: number, a: number, s: number, i: number) {
  const total = h + a + s + i;
  if (!total) return 0;
  return +(Math.round(((h / total) * 100) * 100) / 100).toFixed(2);
}
