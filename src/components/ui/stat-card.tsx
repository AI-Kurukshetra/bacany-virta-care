import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="min-h-30">
      <p className="text-[0.73rem] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-[2.25rem] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--color-text)]">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">{helper}</p>
      ) : null}
    </Card>
  );
}
