export type Vendor = {
  id: string;
  name: string;
  phone: string | null;
  default_commission_type: "percentage" | "fixed_per_item";
  default_commission_value: number;
  default_leftover_action: "returned" | "donated_unpaid" | "damaged";
  notes: string | null;
  is_active: boolean;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  default_price: number;
  unit: string;
  category: string | null;
  is_active: boolean;
};
