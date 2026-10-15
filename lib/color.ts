/** "#RRGGBB" plus an alpha of 0..1 as "#RRGGBBAA". */
export function withAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `${hex.slice(0, 7)}${a.toString(16).padStart(2, "0")}`;
}
