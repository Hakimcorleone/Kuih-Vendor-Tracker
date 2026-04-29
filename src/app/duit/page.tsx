"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { rm } from "@/lib/money";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Balance = { vendor_id: string; name: string; phone: string | null; outstanding_balance: number };

export default function DuitPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [selected, setSelected] = useState<Balance | null>(null);
  const [statement, setStatement] = useState("");

  async function load() {
    const { data } = await supabase.from("vendor_outstanding_balances").select("*").order("name");
    setBalances((data as Balance[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function generate(v: Balance) {
    setSelected(v);
    const { data: tx } = await supabase
      .from("wallet_transactions")
      .select("transaction_date,type,direction,amount,description")
      .eq("vendor_id", v.vendor_id)
      .order("created_at", { ascending: false })
      .limit(7);
    const lines = [
      `Salam ${v.name}, ringkasan duit vendor:`,
      "",
      ...(tx || []).map((t: any) => `${t.transaction_date} - ${t.direction === "credit" ? "+" : "-"}${rm(t.amount)} (${t.description || t.type})`),
      "",
      `Jumlah belum ambil terkini: ${rm(v.outstanding_balance)}`,
    ];
    setStatement(lines.join("\n"));
  }

  async function copy() {
    if (statement) await navigator.clipboard.writeText(statement);
  }

  return (
    <main className="px-4 py-6">
      <PageHeader title="Duit Vendor" subtitle="Baki duit vendor yang belum ambil." />
      <div className="space-y-3">
        {balances.map(v => (
          <Card key={v.vendor_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{v.name}</h2>
                <p className="text-sm text-neutral-500">{v.phone || "Tiada nombor"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Belum ambil</p>
                <p className="text-lg font-bold">{rm(v.outstanding_balance)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={`/bayar?vendor=${v.vendor_id}`} className="rounded-xl bg-neutral-950 p-3 text-center text-sm font-semibold text-white">Bayar</Link>
              <button onClick={() => generate(v)} className="rounded-xl border p-3 text-sm font-semibold">Statement</button>
            </div>
          </Card>
        ))}
      </div>

      {selected && <Card className="mt-4">
        <h2 className="font-semibold">WhatsApp Statement</h2>
        <textarea className="mt-3 h-56 w-full rounded-xl border p-3 text-sm" value={statement} readOnly />
        <button onClick={copy} className="mt-3 w-full rounded-xl bg-neutral-950 p-3 font-semibold text-white">Copy WhatsApp</button>
      </Card>}
    </main>
  );
}
