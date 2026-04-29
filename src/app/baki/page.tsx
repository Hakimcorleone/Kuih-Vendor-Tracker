"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { formatMoney, todayISO } from "@/lib/money";
import { supabase } from "@/lib/supabase";

type BatchRow = {
  id: string;
  vendor_id: string;
  status: string;
  vendors: { name: string } | null;
  batch_items: Array<{
    id: string;
    quantity_sent: number;
    cost_price: number;
    selling_price: number;
    products: { name: string; unit: string } | null;
  }>;
};

type ClosingInput = { leftover: string; action: "returned" | "donated_unpaid" | "damaged" };

export default function BakiPage() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [inputs, setInputs] = useState<Record<string, ClosingInput>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("daily_batches")
      .select("id,vendor_id,status,vendors(name),batch_items(id,quantity_sent,cost_price,selling_price,products(name,unit))")
      .eq("batch_date", todayISO())
      .eq("status", "open");
    if (error) setMessage(error.message);
    setBatches((data || []) as unknown as BatchRow[]);
  }
  useEffect(() => { load(); }, []);

  async function closeBatch(batch: BatchRow) {
    setMessage("");
    let totalPayout = 0;
    for (const item of batch.batch_items) {
      const input = inputs[item.id] || { leftover: "0", action: "donated_unpaid" };
      const leftover = Math.max(0, Number(input.leftover || 0));
      if (leftover > item.quantity_sent) { setMessage("Baki tidak boleh lebih daripada kuantiti hantar."); return; }
      const returned = input.action === "returned" ? leftover : 0;
      const donated = input.action === "donated_unpaid" ? leftover : 0;
      const damaged = input.action === "damaged" ? leftover : 0;
      const sold = item.quantity_sent - returned - donated - damaged;
      const grossSales = sold * Number(item.selling_price || 0);
      const vendorPayout = sold * Number(item.cost_price || 0);
      const shopProfit = grossSales - vendorPayout;
      totalPayout += vendorPayout;
      const { error } = await supabase.from("batch_items").update({
        quantity_returned: returned,
        quantity_donated: donated,
        quantity_damaged: damaged,
        quantity_sold: sold,
        gross_sales: grossSales,
        vendor_payout: vendorPayout,
        shop_profit: shopProfit,
        leftover_action: input.action,
      }).eq("id", item.id);
      if (error) { setMessage(error.message); return; }
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
    setMessage(`Kiraan ${batch.vendors?.name || "vendor"} selesai. Duit vendor: ${formatMoney(totalPayout)}`);
    await load();
  }

  return (
    <PageShell>
      <div><h1 className="text-3xl font-bold">Kira Baki</h1><p className="mt-1 text-neutral-500">Isi baki dan pilih apa jadi dengan baki itu.</p></div>
      {message && <Card><p>{message}</p></Card>}
      {batches.length === 0 && <Card><p>Tiada kuih masuk yang masih open hari ini.</p></Card>}
      {batches.map((batch) => (
        <Card key={batch.id}>
          <h2 className="text-xl font-bold">{batch.vendors?.name}</h2>
          <div className="mt-4 space-y-4">
            {batch.batch_items.map((item) => {
              const current = inputs[item.id] || { leftover: "0", action: "donated_unpaid" };
              const leftover = Number(current.leftover || 0);
              const sold = Math.max(0, item.quantity_sent - leftover);
              return (
                <div key={item.id} className="rounded-2xl bg-neutral-50 p-4">
                  <p className="font-semibold">{item.products?.name}</p>
                  <p className="text-sm text-neutral-500">Masuk: {item.quantity_sent} {item.products?.unit}</p>
                  <label className="mt-3 block text-sm font-medium">Baki</label>
                  <input type="number" value={current.leftover} onChange={(e) => setInputs({ ...inputs, [item.id]: { ...current, leftover: e.target.value } })} className="mt-1 w-full rounded-2xl border p-3" />
                  <label className="mt-3 block text-sm font-medium">Baki ini nak buat apa?</label>
                  <select value={current.action} onChange={(e) => setInputs({ ...inputs, [item.id]: { ...current, action: e.target.value as ClosingInput["action"] } })} className="mt-1 w-full rounded-2xl border p-3">
                    <option value="donated_unpaid">Sedekah - vendor tak dibayar</option>
                    <option value="returned">Vendor ambil balik</option>
                    <option value="damaged">Rosak / buang</option>
                  </select>
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm">
                    <p>Terjual: <b>{sold}</b></p>
                    <p>Duit vendor: <b>{formatMoney(sold * Number(item.cost_price || 0))}</b></p>
                    <p>Untung kedai: <b>{formatMoney((sold * Number(item.selling_price || 0)) - (sold * Number(item.cost_price || 0)))}</b></p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4"><Button onClick={() => closeBatch(batch)}>Sahkan Kiraan</Button></div>
        </Card>
      ))}
    </PageShell>
  );
}
