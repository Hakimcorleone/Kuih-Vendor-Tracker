# Kuih Vendor Tracker

Mobile-first web app untuk kedai makan pagi manage vendor kuih titip jual.

## Core logic v2

- Vendor hantar kuih dengan **harga ambil**.
- Kedai jual dengan **harga jual**.
- Duit vendor = quantity terjual x harga ambil.
- Jualan kasar = quantity terjual x harga jual.
- Untung kedai = jualan kasar - duit vendor.
- Kalau baki disedekahkan, vendor tidak dibayar untuk baki tersebut.

## Setup

1. Run SQL dalam `supabase/schema.sql` di Supabase SQL Editor.
2. Set Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
