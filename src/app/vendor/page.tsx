"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import type { Product, Vendor } from "@/lib/types";

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [message, setMessage] = useState("");

  async function loadData() {
    setMessage("");

    const vendorResult = await supabase
      .from("vendors")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (vendorResult.error) {
      setMessage("Gagal load vendor: " + vendorResult.error.message);
      return;
    }

    const productResult = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (productResult.error) {
      setMessage("Gagal load produk: " + productResult.error.message);
      return;
    }

    setVendors((vendorResult.data || []) as Vendor[]);
    setProducts((productResult.data || []) as Product[]);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveVendor(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!vendorName.trim()) {
      setMessage("Nama vendor wajib diisi.");
      return;
    }

    const result = await supabase
      .from("vendors")
      .insert({
        name: vendorName.trim(),
        phone: phone.trim() || null,
        default_leftover_action: "donated_unpaid",
        is_active: true,
      })
      .select()
      .single();

    if (result.error) {
      setMessage("Gagal simpan vendor: " + result.error.message);
      return;
    }

    setVendorName("");
    setPhone("");
    setSelectedVendorId(result.data.id);
    setMessage("Vendor berjaya disimpan.");
    await loadData();
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!selectedVendorId) {
      setMessage("Pilih vendor dulu.");
      return;
    }

    if (!productName.trim()) {
      setMessage("Nama kuih wajib diisi.");
      return;
    }

    const result = await supabase.from("products").insert({
      vendor_id: selectedVendorId,
      name: productName.trim(),
      cost_price: Number(costPrice || 0),
      selling_price: Number(sellingPrice || 0),
      unit: unit.trim() || "pcs",
      category: "Kuih",
      is_active: true,
    });

    if (result.error) {
      setMessage("Gagal simpan kuih: " + result.error.message);
      return;
    }

    setProductName("");
    setCostPrice("");
    setSellingPrice("");
    setUnit("pcs");
    setMessage("Kuih berjaya disimpan.");
    await loadData();
  }

  return (
    <PageShell title="Vendor" subtitle="Tambah vendor dan senarai kuih mereka.">
      {message ? (
        <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
          {message}
        </div>
      ) : null}

      <Card>
        <h2 className="mb-4 text-xl font-bold">Tambah Vendor</h2>
        <form onSubmit={saveVendor} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-neutral-200 p-4"
            placeholder="Nama vendor, contoh: Kak Ani"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-neutral-200 p-4"
            placeholder="No telefon"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <Button type="submit">Simpan Vendor</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Tambah Kuih / Produk</h2>
        <form onSubmit={saveProduct} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Vendor</span>
            <select
              className="w-full rounded-2xl border border-neutral-200 p-4"
              value={selectedVendorId}
              onChange={(event) => setSelectedVendorId(event.target.value)}
            >
              <option value="">Pilih vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>

          <input
            className="w-full rounded-2xl border border-neutral-200 p-4"
            placeholder="Nama kuih, contoh: Karipap"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full rounded-2xl border border-neutral-200 p-4"
              placeholder="Harga ambil"
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(event) => setCostPrice(event.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-neutral-200 p-4"
              placeholder="Harga jual"
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
            />
          </div>

          <input
            className="w-full rounded-2xl border border-neutral-200 p-4"
            placeholder="Unit, contoh: pcs / pek / bungkus"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          />

          <Button type="submit">Simpan Kuih</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Senarai Vendor</h2>
        <div className="space-y-3">
          {vendors.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada vendor.</p>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="rounded-2xl border border-neutral-100 p-4">
                <p className="font-bold">{vendor.name}</p>
                <p className="text-sm text-neutral-500">{vendor.phone || "Tiada nombor"}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Senarai Kuih</h2>
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada kuih.</p>
          ) : (
            products.map((product) => {
              const vendor = vendors.find((item) => item.id === product.vendor_id);

              return (
                <div key={product.id} className="rounded-2xl border border-neutral-100 p-4">
                  <p className="font-bold">{product.name}</p>
                  <p className="text-sm text-neutral-500">
                    {vendor?.name || "Vendor"} · Ambil RM{Number(product.cost_price).toFixed(2)} · Jual RM{Number(product.selling_price).toFixed(2)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </PageShell>
  );
}
