import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="min-h-30">
      <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)]">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-xs text-[var(--color-muted)]">{helper}</p>
      ) : null}
    </Card>
  );
}
