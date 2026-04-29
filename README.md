# Kuih Vendor Tracker

Mobile-first web app untuk kedai makan pagi manage vendor kuih titip jual.

## Core features
- Add vendor dan produk
- Rekod kuih masuk setiap pagi
- Kira baki petang: vendor ambil balik / sedekah / rosak
- Sedekah tidak dibayar kepada vendor
- Auto kira jualan, komisen, payout vendor
- Vendor wallet / duit belum ambil
- Bayar vendor secara partial/full
- Generate WhatsApp statement

## Setup ringkas

1. Upload project ini ke GitHub.
2. Buat Supabase project.
3. Run SQL dalam `supabase/schema.sql` di Supabase SQL Editor.
4. Copy `.env.example` kepada `.env.local` dan isi Supabase URL + anon key.
5. Install dan run:

```bash
npm install
npm run dev
```

## Deploy Vercel

Import repo ke Vercel, kemudian masukkan environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Nota keselamatan
MVP ini belum ada login. Sesuai untuk demo/portfolio. Untuk production, aktifkan Supabase Auth + RLS policies.
