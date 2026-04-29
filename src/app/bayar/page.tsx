"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { rm } from "@/lib/money";
import { todayISO } from "@/lib/dates";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Balance = { vendor_id: string; name: string; phone: string | null; outstanding_balance: number };

function BayarContent() {
  const params = useSearchParams();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [vendorId, setVendorId] = useState(params.get("vendor") || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [message, setMessage] = useState("");

  const selected = useMemo(() => balances.find(v => v.vendor_id === vendorId), [balances, vendorId]);

  async function load() {
    const { data } = await supabase.from("vendor_outstanding_balances").select("*").order("name");
    const rows = (data as Balance[]) || [];
    setBalances(rows);
    if (!vendorId && rows[0]) setVendorId(rows[0].vendor_id);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const paid = Number(amount || 0);
    if (!selected || paid <= 0) return setMessage("Masukkan jumlah bayaran.");
    if (paid > Number(selected.outstanding_balance || 0)) return setMessage("Bayaran tidak boleh lebih daripada baki belum ambil.");
    const { error } = await supabase.from("wallet_transactions").insert({
      vendor_id: selected.vendor_id,
      transaction_date: todayISO(),
      type: "payment_made",
      direction: "debit",
      amount: paid,
      payment_method: method,
      description: "Bayaran kepada vendor",
    });
    if (error) setMessage(error.message);
    else { setAmount(""); setMessage("Bayaran berjaya direkod."); await load(); }
  }

  return (
    <main className="px-4 py-6">
      <PageHeader title="Bayar Vendor" subtitle="Rekod duit yang vendor sudah ambil." />
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <select className="w-full rounded-xl border p-3" value={vendorId} onChange={e => setVendorId(e.target.value)}>
            {balances.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
          </select>
          <div className="rounded-xl bg-neutral-100 p-3">
            <p className="text-xs text-neutral-500">Baki belum ambil</p>
            <p className="text-xl font-bold">{rm(selected?.outstanding_balance)}</p>
          </div>
          <input className="w-full rounded-xl border p-3" placeholder="Jumlah bayar" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          <select className="w-full rounded-xl border p-3" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="duitnow">DuitNow</option>
          </select>
          <button className="w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Simpan Bayaran</button>
        </form>
      </Card>
      {message && <p className="mt-4 rounded-xl bg-white p-3 text-sm shadow-sm">{message}</p>}
    </main>
  );
}

export default function BayarPage() {
  return <Suspense><BayarContent /></Suspense>;
}
