"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { rm } from "@/lib/money";
import { prettyDate } from "@/lib/dates";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Summary = {
  active_vendors_today: number;
  product_types_today: number;
  gross_sales_today: number;
  shop_commission_today: number;
  vendor_payout_today: number;
  total_outstanding_balance: number;
};

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("today_dashboard_summary").select("*").maybeSingle();
      setSummary((data as Summary) || null);
    }
    load();
  }, []);

  return (
    <main className="px-4 py-6">
      <PageHeader title="Hari Ini" subtitle={prettyDate()} />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-neutral-500">Jualan kasar</p>
          <p className="mt-1 text-xl font-bold">{rm(summary?.gross_sales_today)}</p>
        </Card>
        <Card>
          <p className="text-xs text-neutral-500">Belum ambil</p>
          <p className="mt-1 text-xl font-bold">{rm(summary?.total_outstanding_balance)}</p>
        </Card>
        <Card>
          <p className="text-xs text-neutral-500">Komisen kedai</p>
          <p className="mt-1 text-xl font-bold">{rm(summary?.shop_commission_today)}</p>
        </Card>
        <Card>
          <p className="text-xs text-neutral-500">Duit vendor hari ini</p>
          <p className="mt-1 text-xl font-bold">{rm(summary?.vendor_payout_today)}</p>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        <Action href="/masuk" title="+ Tambah Kuih Masuk" desc="Rekod kuih yang vendor hantar pagi ini." />
        <Action href="/baki" title="Kira Baki" desc="Isi baki dan pilih sedekah / ambil balik / rosak." />
        <Action href="/bayar" title="Bayar Vendor" desc="Rekod duit yang vendor sudah ambil." />
        <Action href="/duit" title="Lihat Duit Vendor" desc="Semak baki duit belum ambil setiap vendor." />
      </div>
    </main>
  );
}

function Action({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{desc}</p>
    </Link>
  );
}
