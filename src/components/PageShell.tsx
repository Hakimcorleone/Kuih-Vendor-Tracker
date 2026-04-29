import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 pb-28 pt-6 text-neutral-950">
      <section className="mx-auto max-w-xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-base text-neutral-500">{subtitle}</p>
          ) : null}
        </header>

        {children}
      </section>

      <BottomNav />
    </main>
  );
}
