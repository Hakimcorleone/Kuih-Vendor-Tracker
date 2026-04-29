"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { formatMoney } from "@/lib/money";
import { supabase } from "@/lib/supabase";

type Balance = { vendor_id: string; name: string; phone: string | null; outstanding_balance: number };
type Tx = { id: string; vendor_id: string; transaction_date: string; type: string; direction: string; amount: number; description: string | null };

export default function DuitPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    async function load() {
      const { data: b } = await supabase.from("vendor_outstanding_balances").select("*").order("name");
      const { data: t } = await supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(20);
      setBalances((b || []) as Balance[]);
      setTxs((t || []) as Tx[]);
    }
    load();
  }, []);

  function makeStatement(vendor: Balance) {
    return `Salam ${vendor.name}, baki duit belum ambil terkini ialah ${formatMoney(vendor.outstanding_balance)}. Terima kasih.`;
  }

  return (
    <PageShell>
      <div><h1 className="text-3xl font-bold">Duit Vendor</h1><p className="mt-1 text-neutral-500">Semak baki duit vendor yang belum ambil.</p></div>
      <div className="space-y-3">
        {balances.map((b) => (
          <Card key={b.vendor_id}>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold">{b.name}</h2><p className="text-sm text-neutral-500">{b.phone || "Tiada nombor"}</p></div>
              <div className="text-right"><p className="text-sm text-neutral-500">Belum ambil</p><p className="text-xl font-bold">{formatMoney(b.outstanding_balance)}</p></div>
            </div>
            <textarea readOnly value={makeStatement(b)} className="mt-4 h-24 w-full rounded-2xl border bg-neutral-50 p-3 text-sm" />
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-xl font-bold">Rekod Duit Terkini</h2>
        <div className="mt-3 space-y-2">
          {txs.map((tx) => (
            <div key={tx.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
              <p className="font-medium">{tx.description || tx.type}</p>
              <p className="text-neutral-500">{tx.transaction_date} • {tx.direction === "credit" ? "+" : "-"}{formatMoney(tx.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
