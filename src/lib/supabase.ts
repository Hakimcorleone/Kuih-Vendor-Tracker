"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { formatMoney, todayISO } from "@/lib/money";
import { supabase } from "@/lib/supabase";

type Balance = { vendor_id: string; name: string; outstanding_balance: number };

export default function BayarPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase.from("vendor_outstanding_balances").select("*").order("name");
    const rows = (data || []) as Balance[];
    setBalances(rows);
    if (!vendorId && rows[0]) setVendorId(rows[0].vendor_id);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const selected = balances.find((b) => b.vendor_id === vendorId);
    const paid = Number(amount || 0);
    if (!selected || paid <= 0) return;
    if (paid > Number(selected.outstanding_balance || 0)) { setMessage("Bayaran tidak boleh lebih daripada baki belum ambil."); return; }
    const { error } = await supabase.from("wallet_transactions").insert({
      vendor_id: vendorId,
      transaction_date: todayISO(),
      type: "payment_made",
      direction: "debit",
      amount: paid,
      payment_method: method,
      description: "Bayaran kepada vendor",
    });
    if (error) setMessage(error.message); else { setMessage(`Bayaran ${formatMoney(paid)} berjaya direkod.`); setAmount(""); await load(); }
  }

  const selected = balances.find((b) => b.vendor_id === vendorId);

  return (
    <PageShell>
      <div><h1 className="text-3xl font-bold">Bayar Vendor</h1><p className="mt-1 text-neutral-500">Rekod duit yang vendor sudah ambil.</p></div>
      <Card>
        <form onSubmit={save} className="space-y-4">
          <div><label className="block text-sm font-medium">Vendor</label><select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="mt-1 w-full rounded-2xl border p-4">{balances.map((b) => <option key={b.vendor_id} value={b.vendor_id}>{b.name} - {formatMoney(b.outstanding_balance)}</option>)}</select></div>
          {selected && <div className="rounded-2xl bg-neutral-50 p-4"><p className="text-sm text-neutral-500">Baki belum ambil</p><p className="text-2xl font-bold">{formatMoney(selected.outstanding_balance)}</p></div>}
          <div><label className="block text-sm font-medium">Jumlah dibayar</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.00" className="mt-1 w-full rounded-2xl border p-4" /></div>
          <div><label className="block text-sm font-medium">Cara bayaran</label><select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-2xl border p-4"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="duitnow">DuitNow</option></select></div>
          <Button type="submit">Simpan Bayaran</Button>
          {message && <p className="text-sm text-neutral-600">{message}</p>}
        </form>
      </Card>
    </PageShell>
  );
}
