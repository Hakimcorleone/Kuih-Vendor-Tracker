import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuih Vendor Tracker",
  description: "Mobile-first app for managing kuih vendors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
