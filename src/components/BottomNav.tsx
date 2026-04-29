"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackagePlus, Calculator, Wallet, Users } from "lucide-react";

const items = [
  { href: "/", label: "Hari Ini", icon: Home },
  { href: "/masuk", label: "Masuk", icon: PackagePlus },
  { href: "/baki", label: "Baki", icon: Calculator },
  { href: "/duit", label: "Duit", icon: Wallet },
  { href: "/vendor", label: "Vendor", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-3 text-xs ${active ? "text-neutral-950" : "text-neutral-400"}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
