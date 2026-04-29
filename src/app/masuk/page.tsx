"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { todayISO, yesterdayISO } from "@/lib/dates";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import type { Vendor, Product } from "@/types/app";

export default function MasukPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const vendor = useMemo(() => vendors.find(v => v.id === vendorId), [vendors, vendorId]);
  const vendorProducts = products.filter(p => p.vendor_id === vendorId);
  const product = products.find(p => p.id === productId);

  async function load() {
    const [v, p] = await Promise.all([
      supabase.from("vendors").select("*").eq("is_active", true).order("name"),
      supabase.from("products").select("*").eq("is_active", true).order("name"),
    ]);
    const vv = (v.data as Vendor[]) || [];
    const pp = (p.data as Product[]) || [];
    setVendors(vv); setProducts(pp);
    if (!vendorId && vv[0]) setVendorId(vv[0].id);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const first = vendorProducts[0];
    if (first && !vendorProducts.some(p => p.id === productId)) {
      setProductId(first.id);
      setPrice(String(first.default_price));
    }
  }, [vendorId, products.length]);

  useEffect(() => { if (product) setPrice(String(product.default_price)); }, [productId]);

  async function getOrCreateBatch() {
    const date = todayISO();
    const existing = await supabase.from("daily_batches").select("id,status").eq("vendor_id", vendorId).eq("batch_date", date).maybeSingle();
    if (existing.data) return existing.data.id;
    const created = await supabase.from("daily_batches").insert({ vendor_id: vendorId, batch_date: date, status: "open" }).select("id").single();
    if (created.error) throw created.error;
    return created.data.id;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!vendor || !product || Number(qty) <= 0) return setMessage("Pilih vendor, kuih dan kuantiti dulu.");
    const batchId = await getOrCreateBatch();
    const { error } = await supabase.from("batch_items").insert({
      batch_id: batchId,
      product_id: product.id,
      quantity_sent: Number(qty),
      selling_price: Number(price || 0),
      commission_type: vendor.default_commission_type,
      commission_value: vendor.default_commission_value,
      leftover_action: vendor.default_leftover_action,
    });
    if (error) setMessage(error.message);
    else { setQty(""); setMessage("Kuih masuk berjaya disimpan."); }
  }

  async function repeatYesterday() {
    setMessage("");
    if (!vendorId || !vendor) return;
    const y = yesterdayISO();
    const { data, error } = await supabase
      .from("daily_batches")
      .select("id, batch_items(*)")
      .eq("vendor_id", vendorId)
      .eq("batch_date", y)
      .maybeSingle();
    if (error || !data) return setMessage("Tiada rekod semalam untuk vendor ini.");
    const batchId = await getOrCreateBatch();
    const items = ((data as any).batch_items || []).map((item: any) => ({
      batch_id: batchId,
      product_id: item.product_id,
      quantity_sent: item.quantity_sent,
      selling_price: item.selling_price,
      commission_type: item.commission_type,
      commission_value: item.commission_value,
      leftover_action: item.leftover_action,
    }));
    if (!items.length) return setMessage("Tiada item untuk diulang.");
    const insert = await supabase.from("batch_items").insert(items);
    setMessage(insert.error ? insert.error.message : "Rekod semalam berjaya diulang untuk hari ini.");
  }

  return (
    <main className="px-4 py-6">
      <PageHeader title="Tambah Kuih Masuk" subtitle="Pagi-pagi rekod vendor hantar apa dan berapa." />
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <select className="w-full rounded-xl border p-3" value={vendorId} onChange={e => setVendorId(e.target.value)}>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button type="button" onClick={repeatYesterday} className="w-full rounded-xl border border-neutral-300 p-3 font-medium">Repeat Semalam</button>
          <select className="w-full rounded-xl border p-3" value={productId} onChange={e => setProductId(e.target.value)}>
            {vendorProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border p-3" placeholder="Kuantiti hantar" type="number" value={qty} onChange={e => setQty(e.target.value)} />
            <input className="rounded-xl border p-3" placeholder="Harga jual" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <button className="w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Simpan Kuih Masuk</button>
        </form>
      </Card>
      {message && <p className="mt-4 rounded-xl bg-white p-3 text-sm text-neutral-700 shadow-sm">{message}</p>}
    </main>
  );
}
