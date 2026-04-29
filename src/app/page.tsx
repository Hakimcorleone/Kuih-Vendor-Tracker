"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { formatMoney } from "@/lib/money";
import { supabase } from "@/lib/supabase";

type Summary = {
  gross_sales_today: number;
  shop_profit_today: number;
  vendor_payout_today: number;
  total_outstanding_balance: number;
};

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    async function loadSummary() {
      const { data } = await supabase.from("today_dashboard_summary").select("*").single();
      setSummary(data as Summary | null);
    }
    loadSummary();
  }, []);

  const today = new Intl.DateTimeFormat("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <PageShell>
      <div>
        <h1 className="text-3xl font-bold">Hari Ini</h1>
        <p className="mt-1 text-neutral-500">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-sm text-neutral-500">Jualan kasar</p><p className="mt-2 text-2xl font-bold">{formatMoney(summary?.gross_sales_today)}</p></Card>
        <Card><p className="text-sm text-neutral-500">Belum ambil</p><p className="mt-2 text-2xl font-bold">{formatMoney(summary?.total_outstanding_balance)}</p></Card>
        <Card><p className="text-sm text-neutral-500">Untung kedai</p><p className="mt-2 text-2xl font-bold">{formatMoney(summary?.shop_profit_today)}</p></Card>
        <Card><p className="text-sm text-neutral-500">Duit vendor hari ini</p><p className="mt-2 text-2xl font-bold">{formatMoney(summary?.vendor_payout_today)}</p></Card>
      </div>

      <div className="space-y-3">
        <Link href="/masuk"><Card><h2 className="text-xl font-bold">+ Tambah Kuih Masuk</h2><p className="mt-2 text-neutral-500">Rekod kuih yang vendor hantar pagi ini.</p></Card></Link>
        <Link href="/baki"><Card><h2 className="text-xl font-bold">Kira Baki</h2><p className="mt-2 text-neutral-500">Isi baki dan pilih sedekah / ambil balik / rosak.</p></Card></Link>
        <Link href="/bayar"><Card><h2 className="text-xl font-bold">Bayar Vendor</h2><p className="mt-2 text-neutral-500">Rekod duit yang vendor sudah ambil.</p></Card></Link>
        <Link href="/duit"><Card><h2 className="text-xl font-bold">Lihat Duit Vendor</h2><p className="mt-2 text-neutral-500">Semak baki duit belum ambil setiap vendor.</p></Card></Link>
      </div>
    </PageShell>
  );
}
