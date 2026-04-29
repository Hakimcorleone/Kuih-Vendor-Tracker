export function rm(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}
