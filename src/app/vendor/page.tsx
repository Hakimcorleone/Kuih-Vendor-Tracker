"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import { rm } from "@/lib/money";
import type { Vendor, Product } from "@/types/app";

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [commissionValue, setCommissionValue] = useState("20");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("pcs");

  async function load() {
    const [v, p] = await Promise.all([
      supabase.from("vendors").select("*").eq("is_active", true).order("name"),
      supabase.from("products").select("*").eq("is_active", true).order("name"),
    ]);
    setVendors((v.data as Vendor[]) || []);
    setProducts((p.data as Product[]) || []);
    if (!selectedVendor && v.data?.[0]) setSelectedVendor(v.data[0].id);
  }

  useEffect(() => { load(); }, []);

  async function addVendor(e: FormEvent) {
    e.preventDefault();
    if (!vendorName.trim()) return;
    setLoading(true);
    await supabase.from("vendors").insert({
      name: vendorName.trim(),
      phone: phone.trim() || null,
      default_commission_type: "percentage",
      default_commission_value: Number(commissionValue || 0),
      default_leftover_action: "donated_unpaid",
    });
    setVendorName(""); setPhone(""); setCommissionValue("20");
    await load(); setLoading(false);
  }

  async function addProduct(e: FormEvent) {
    e.preventDefault();
    if (!selectedVendor || !productName.trim()) return;
    setLoading(true);
    await supabase.from("products").insert({
      vendor_id: selectedVendor,
      name: productName.trim(),
      default_price: Number(price || 0),
      unit: unit || "pcs",
      category: "Kuih",
    });
    setProductName(""); setPrice(""); setUnit("pcs");
    await load(); setLoading(false);
  }

  return (
    <main className="px-4 py-6">
      <PageHeader title="Vendor" subtitle="Tambah vendor dan senarai kuih mereka." />

      <Card>
        <h2 className="font-semibold">Tambah Vendor</h2>
        <form onSubmit={addVendor} className="mt-3 space-y-3">
          <input className="w-full rounded-xl border p-3" placeholder="Nama vendor, contoh Kak Ani" value={vendorName} onChange={e => setVendorName(e.target.value)} />
          <input className="w-full rounded-xl border p-3" placeholder="No telefon" value={phone} onChange={e => setPhone(e.target.value)} />
          <input className="w-full rounded-xl border p-3" placeholder="Komisen %, contoh 20" type="number" value={commissionValue} onChange={e => setCommissionValue(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Simpan Vendor</button>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Tambah Kuih / Produk</h2>
        <form onSubmit={addProduct} className="mt-3 space-y-3">
          <select className="w-full rounded-xl border p-3" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input className="w-full rounded-xl border p-3" placeholder="Nama kuih, contoh Karipap" value={productName} onChange={e => setProductName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border p-3" placeholder="Harga" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
            <input className="rounded-xl border p-3" placeholder="Unit" value={unit} onChange={e => setUnit(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Simpan Kuih</button>
        </form>
      </Card>

      <div className="mt-5 space-y-3">
        {vendors.map(v => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{v.name}</h3>
                <p className="text-sm text-neutral-500">{v.phone || "Tiada nombor"}</p>
                <p className="text-xs text-neutral-500">Komisen: {v.default_commission_value}%</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {products.filter(p => p.vendor_id === v.id).map(p => (
                <span key={p.id} className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{p.name} · {rm(p.default_price)}/{p.unit}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
