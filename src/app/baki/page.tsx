"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/dates";
import { calculateItem, LeftoverAction } from "@/lib/calculations";
import { rm } from "@/lib/money";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Batch = any;

type ItemState = { leftover: string; action: LeftoverAction };

export default function BakiPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [state, setState] = useState<Record<string, ItemState>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase
      .from("daily_batches")
      .select("id, vendor_id, batch_date, status, vendors(name), batch_items(id, quantity_sent, selling_price, commission_type, commission_value, products(name, unit))")
      .eq("batch_date", todayISO())
      .eq("status", "open")
      .order("created_at");
    setBatches(data || []);
    const initial: Record<string, ItemState> = {};
    (data || []).forEach((b: any) => b.batch_items?.forEach((i: any) => { initial[i.id] = { leftover: "0", action: "donated_unpaid" }; }));
    setState(initial);
  }

  useEffect(() => { load(); }, []);

  function updateItem(id: string, partial: Partial<ItemState>) {
    setState(prev => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  }

  async function closeBatch(batch: Batch) {
    setMessage("");
    let totalPayout = 0;
    for (const item of batch.batch_items || []) {
      const itemState = state[item.id] || { leftover: "0", action: "donated_unpaid" };
      const calc = calculateItem({
        quantitySent: item.quantity_sent,
        leftoverQty: Number(itemState.leftover || 0),
        leftoverAction: itemState.action,
        sellingPrice: Number(item.selling_price || 0),
        commissionType: item.commission_type,
        commissionValue: Number(item.commission_value || 0),
      });
      totalPayout += calc.vendorPayout;
      const { error } = await supabase.from("batch_items").update({
        quantity_returned: calc.quantityReturned,
        quantity_donated: calc.quantityDonated,
        quantity_damaged: calc.quantityDamaged,
        quantity_sold: calc.quantitySold,
        gross_sales: calc.grossSales,
        shop_commission: calc.shopCommission,
        vendor_payout: calc.vendorPayout,
        leftover_action: itemState.action,
        updated_at: new Date().toISOString(),
      }).eq("id", item.id);
      if (error) return setMessage(error.message);
    }

    await supabase.from("daily_batches").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", batch.id);
    if (totalPayout > 0) {
      await supabase.from("wallet_transactions").insert({
        vendor_id: batch.vendor_id,
        batch_id: batch.id,
        transaction_date: todayISO(),
        type: "payout_earned",
        direction: "credit",
        amount: totalPayout,
        description: `Duit jualan ${todayISO()}`,
      });
    }
    setMessage(`Kiraan ${batch.vendors?.name} selesai. Duit vendor: ${rm(totalPayout)}`);
    await load();
  }

  return (
    <main className="px-4 py-6">
      <PageHeader title="Kira Baki" subtitle="Isi baki. Kalau sedekah, vendor tidak dibayar untuk baki itu." />
      <div className="space-y-4">
        {batches.length === 0 && <Card>Tiada batch terbuka hari ini.</Card>}
        {batches.map(batch => (
          <Card key={batch.id}>
            <h2 className="text-lg font-semibold">{batch.vendors?.name}</h2>
            <div className="mt-3 space-y-4">
              {batch.batch_items?.map((item: any) => {
                const s = state[item.id] || { leftover: "0", action: "donated_unpaid" };
                const calc = calculateItem({
                  quantitySent: item.quantity_sent,
                  leftoverQty: Number(s.leftover || 0),
                  leftoverAction: s.action,
                  sellingPrice: Number(item.selling_price || 0),
                  commissionType: item.commission_type,
                  commissionValue: Number(item.commission_value || 0),
                });
                return (
                  <div key={item.id} className="rounded-xl border p-3">
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-neutral-500">Masuk: {item.quantity_sent} · Harga: {rm(item.selling_price)}</p>
                    <input className="mt-3 w-full rounded-xl border p-3" type="number" min="0" max={item.quantity_sent} value={s.leftover} onChange={e => updateItem(item.id, { leftover: e.target.value })} placeholder="Baki" />
                    <select className="mt-2 w-full rounded-xl border p-3" value={s.action} onChange={e => updateItem(item.id, { action: e.target.value as LeftoverAction })}>
                      <option value="returned">Vendor Ambil Balik</option>
                      <option value="donated_unpaid">Sedekah</option>
                      <option value="damaged">Rosak/Buang</option>
                    </select>
                    <div className="mt-2 text-sm text-neutral-600">
                      Terjual: <b>{calc.quantitySold}</b> · Duit vendor: <b>{rm(calc.vendorPayout)}</b>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => closeBatch(batch)} className="mt-4 w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Sahkan Kiraan</button>
          </Card>
        ))}
      </div>
      {message && <p className="mt-4 rounded-xl bg-white p-3 text-sm shadow-sm">{message}</p>}
    </main>
  );
}
