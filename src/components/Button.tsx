import type { ReactNode } from "react";
export function Button({ children, type = "button", className = "", disabled, onClick }: { children: ReactNode; type?: "button" | "submit"; className?: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`w-full rounded-2xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}
