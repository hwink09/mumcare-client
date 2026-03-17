const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) return vndFormatter.format(0);
  return vndFormatter.format(Math.round(amount));
}
