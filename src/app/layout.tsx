import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Kuih Vendor Tracker",
  description: "Track kuih vendors, leftovers, payouts and vendor wallet balances.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>
        <div className="mx-auto min-h-screen max-w-md bg-neutral-50 pb-24">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
