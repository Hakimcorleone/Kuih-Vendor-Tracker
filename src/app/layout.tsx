"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/money";
import type { Product, Vendor } from "@/lib/types";

export default function MasukPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data: vendorData } = await supabase.from("vendors").select("*").eq("is_active", true).order("name");
    const { data: productData } = await supabase.from("products").select("*").eq("is_active", true).order("name");
    setVendors((vendorData || []) as Vendor[]);
    setProducts((productData || []) as Product[]);
    if (!vendorId && vendorData?.[0]) setVendorId(vendorData[0].id);
  }
  useEffect(() => { load(); }, []);

  const vendorProducts = useMemo(() => products.filter((p) => p.vendor_id === vendorId), [products, vendorId]);
  useEffect(() => { setProductId(vendorProducts[0]?.id || ""); }, [vendorId, products.length]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const product = products.find((p) => p.id === productId);
    if (!vendorId || !product || !qty) return;

    const { data: existingBatch } = await supabase.from("daily_batches").select("id").eq("vendor_id", vendorId).eq("batch_date", todayISO()).maybeSingle();
    let batchId = existingBatch?.id;
    if (!batchId) {
      const { data: newBatch, error } = await supabase.from("daily_batches").insert({ vendor_id: vendorId, batch_date: todayISO(), status: "open" }).select("id").single();
      if (error) { setMessage(error.message); return; }
      batchId = newBatch.id;
    }

    const { error } = await supabase.from("batch_items").insert({
      batch_id: batchId,
      product_id: product.id,
      quantity_sent: Number(qty),
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      leftover_action: vendors.find((v) => v.id === vendorId)?.default_leftover_action || "donated_unpaid",
    });
    if (error) setMessage(error.message); else { setMessage("Kuih masuk berjaya disimpan."); setQty(""); }
  }

  return (
    <PageShell>
      <div><h1 className="text-3xl font-bold">Kuih Masuk</h1><p className="mt-1 text-neutral-500">Rekod kuih yang vendor hantar hari ini.</p></div>
      <Card>
        <form onSubmit={save} className="space-y-4">
          <div><label className="block text-sm font-medium">Vendor</label><select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="mt-1 w-full rounded-2xl border p-4">{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium">Kuih / Produk</label><select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 w-full rounded-2xl border p-4">{vendorProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium">Kuantiti hantar</label><input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="10" className="mt-1 w-full rounded-2xl border p-4" /></div>
          <Button type="submit">Simpan Kuih Masuk</Button>
          {message && <p className="text-sm text-neutral-600">{message}</p>}
        </form>
      </Card>
    </PageShell>
  );
}
