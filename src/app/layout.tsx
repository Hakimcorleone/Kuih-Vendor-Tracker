import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuih Vendor Tracker",
  description: "Track vendor kuih, leftovers, payouts and wallet balances.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
