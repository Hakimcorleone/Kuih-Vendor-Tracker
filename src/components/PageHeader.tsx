export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
    </div>
  );
}
