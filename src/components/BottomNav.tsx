"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Home, PackagePlus, Users, Wallet } from "lucide-react";

const items = [
  { href: "/", label: "Hari Ini", icon: Home },
  { href: "/masuk", label: "Masuk", icon: PackagePlus },
  { href: "/baki", label: "Baki", icon: Calculator },
  { href: "/duit", label: "Duit", icon: Wallet },
  { href: "/vendor", label: "Vendor", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-3 text-xs ${
                active ? "text-black" : "text-neutral-400"
              }`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
