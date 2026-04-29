"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { formatMoney } from "@/lib/money";
import { supabase } from "@/lib/supabase";
import type { Product, Vendor } from "@/lib/types";

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [leftover, setLeftover] = useState("donated_unpaid");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("pcs");

  async function load() {
    const { data: vendorData } = await supabase.from("vendors").select("*").eq("is_active", true).order("created_at", { ascending: false });
    const { data: productData } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
    setVendors((vendorData || []) as Vendor[]);
    setProducts((productData || []) as Product[]);
    if (!selectedVendor && vendorData?.[0]) setSelectedVendor(vendorData[0].id);
  }

  useEffect(() => { load(); }, []);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from("vendors").insert({ name, phone, default_leftover_action: leftover });
    setName(""); setPhone(""); setLeftover("donated_unpaid");
    await load();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor || !productName.trim()) return;
    await supabase.from("products").insert({
      vendor_id: selectedVendor,
      name: productName,
      cost_price: Number(costPrice || 0),
      selling_price: Number(sellingPrice || 0),
      unit,
      category: "Kuih",
    });
    setProductName(""); setCostPrice(""); setSellingPrice(""); setUnit("pcs");
    await load();
  }

  return (
    <PageShell>
      <div><h1 className="text-3xl font-bold">Vendor</h1><p className="mt-1 text-neutral-500">Tambah vendor dan senarai kuih mereka.</p></div>

      <Card>
        <h2 className="text-xl font-bold">Tambah Vendor</h2>
        <form onSubmit={addVendor} className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Nama vendor</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kak Ani" className="w-full rounded-2xl border p-4" />
          <label className="block text-sm font-medium">No telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0123456789" className="w-full rounded-2xl border p-4" />
          <label className="block text-sm font-medium">Baki tak habis biasanya</label>
          <select value={leftover} onChange={(e) => setLeftover(e.target.value)} className="w-full rounded-2xl border p-4">
            <option value="donated_unpaid">Sedekah - vendor tak dibayar</option>
            <option value="returned">Vendor ambil balik</option>
            <option value="damaged">Rosak / buang</option>
          </select>
          <Button type="submit">Simpan Vendor</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Tambah Kuih / Produk</h2>
        <form onSubmit={addProduct} className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Vendor</label>
          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="w-full rounded-2xl border p-4">
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <label className="block text-sm font-medium">Nama kuih</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Karipap" className="w-full rounded-2xl border p-4" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium">Harga ambil</label><input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.70" className="w-full rounded-2xl border p-4" /></div>
            <div><label className="block text-sm font-medium">Harga jual</label><input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="1.00" className="w-full rounded-2xl border p-4" /></div>
          </div>
          <label className="block text-sm font-medium">Unit</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs / pek / bungkus" className="w-full rounded-2xl border p-4" />
          <Button type="submit">Simpan Kuih</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <h3 className="text-lg font-bold">{vendor.name}</h3>
            <p className="text-sm text-neutral-500">{vendor.phone || "Tiada nombor"}</p>
            <div className="mt-3 space-y-2">
              {products.filter((p) => p.vendor_id === vendor.id).map((p) => (
                <div key={p.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-neutral-500">Ambil {formatMoney(p.cost_price)} • Jual {formatMoney(p.selling_price)} / {p.unit}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
