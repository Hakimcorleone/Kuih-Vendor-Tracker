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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setError("");
    const { data: vendorData, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (vendorError) {
      setError(`Gagal load vendor: ${vendorError.message}`);
      return;
    }

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (productError) {
      setError(`Gagal load kuih: ${productError.message}`);
      return;
    }

    const vendorList = (vendorData || []) as Vendor[];
    setVendors(vendorList);
    setProducts((productData || []) as Product[]);

    if (!selectedVendor && vendorList.length > 0) {
      setSelectedVendor(vendorList[0].id);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Masukkan nama vendor dulu.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: insertError } = await supabase
      .from("vendors")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        default_leftover_action: leftover,
        is_active: true,
      })
      .select("*")
      .single();

    setLoading(false);

    if (insertError) {
      setError(`Gagal simpan vendor: ${insertError.message}`);
      return;
    }

    const newVendor = data as Vendor;
    setVendors((current) => [newVendor, ...current.filter((v) => v.id !== newVendor.id)]);
    setSelectedVendor(newVendor.id);
    setName("");
    setPhone("");
    setLeftover("donated_unpaid");
    setMessage(`Vendor ${newVendor.name} berjaya disimpan.`);
    await load();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor) {
      setError("Pilih vendor dulu sebelum simpan kuih.");
      return;
    }
    if (!productName.trim()) {
      setError("Masukkan nama kuih dulu.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        vendor_id: selectedVendor,
        name: productName.trim(),
        cost_price: Number(costPrice || 0),
        selling_price: Number(sellingPrice || 0),
        unit: unit.trim() || "pcs",
        category: "Kuih",
        is_active: true,
      })
      .select("*")
      .single();

    setLoading(false);

    if (insertError) {
      setError(`Gagal simpan kuih: ${insertError.message}`);
      return;
    }

    const newProduct = data as Product;
    setProducts((current) => [newProduct, ...current.filter((p) => p.id !== newProduct.id)]);
    setProductName("");
    setCostPrice("");
    setSellingPrice("");
    setUnit("pcs");
    setMessage(`Kuih ${newProduct.name} berjaya disimpan.`);
    await load();
  }

  return (
    <PageShell>
      <div>
        <h1 className="text-3xl font-bold">Vendor</h1>
        <p className="mt-1 text-neutral-500">Tambah vendor dan senarai kuih mereka.</p>
      </div>

      {message && <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">{message}</div>}
      {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Tambah Vendor</h2>
          <button type="button" onClick={load} className="text-sm font-semibold underline">
            Refresh
          </button>
        </div>
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
          <Button type="submit">{loading ? "Menyimpan..." : "Simpan Vendor"}</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Tambah Kuih / Produk</h2>
        <form onSubmit={addProduct} className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Vendor</label>
          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="w-full rounded-2xl border p-4">
            {vendors.length === 0 && <option value="">Tiada vendor lagi</option>}
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
          <Button type="submit">{loading ? "Menyimpan..." : "Simpan Kuih"}</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {vendors.length === 0 && <p className="text-center text-sm text-neutral-500">Belum ada vendor. Tambah vendor dahulu.</p>}
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <h3 className="text-lg font-bold">{vendor.name}</h3>
            <p className="text-sm text-neutral-500">{vendor.phone || "Tiada nombor"}</p>
            <div className="mt-3 space-y-2">
              {products.filter((p) => p.vendor_id === vendor.id).length === 0 && (
                <p className="text-sm text-neutral-500">Belum ada kuih untuk vendor ini.</p>
              )}
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
