export type CommissionType = "percentage" | "fixed_per_item";
export type LeftoverAction = "returned" | "donated_unpaid" | "damaged";

export function calculateItem(input: {
  quantitySent: number;
  leftoverQty: number;
  leftoverAction: LeftoverAction;
  sellingPrice: number;
  commissionType: CommissionType;
  commissionValue: number;
}) {
  const quantitySent = Math.max(0, Number(input.quantitySent || 0));
  const leftoverQty = Math.min(quantitySent, Math.max(0, Number(input.leftoverQty || 0)));

  const quantityReturned = input.leftoverAction === "returned" ? leftoverQty : 0;
  const quantityDonated = input.leftoverAction === "donated_unpaid" ? leftoverQty : 0;
  const quantityDamaged = input.leftoverAction === "damaged" ? leftoverQty : 0;
  const quantitySold = Math.max(0, quantitySent - quantityReturned - quantityDonated - quantityDamaged);
  const grossSales = quantitySold * Number(input.sellingPrice || 0);
  const shopCommission =
    input.commissionType === "percentage"
      ? grossSales * (Number(input.commissionValue || 0) / 100)
      : quantitySold * Number(input.commissionValue || 0);
  const vendorPayout = Math.max(0, grossSales - shopCommission);

  return {
    quantityReturned,
    quantityDonated,
    quantityDamaged,
    quantitySold,
    grossSales,
    shopCommission,
    vendorPayout,
  };
}
