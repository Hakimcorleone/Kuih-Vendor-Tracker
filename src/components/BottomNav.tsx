import Link from "next/link";
import { Calculator, Home, PackagePlus, Users, Wallet } from "lucide-react";

const items = [
  { href: "/", label: "Hari Ini", icon: Home },
  { href: "/masuk", label: "Masuk", icon: PackagePlus },
  { href: "/baki", label: "Baki", icon: Calculator },
  { href: "/duit", label: "Duit", icon: Wallet },
  { href: "/vendor", label: "Vendor", icon: Users },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-2 py-3 text-xs text-neutral-600">
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
