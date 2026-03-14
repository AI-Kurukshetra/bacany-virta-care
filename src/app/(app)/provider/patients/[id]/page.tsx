import Link from "next/link";
import { notFound } from "next/navigation";
import { GlucoseTrendChart } from "@/components/charts/glucose-trend-chart";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { getPatientDeepView } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProviderPatientDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ProviderPatientDetailPage({
  params,
}: ProviderPatientDetailProps) {
  const profile = await requireProfile("provider");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: assignment } = await supabase
    .from("patient_provider_assignments")
    .select("id")
    .eq("provider_id", profile.id)
    .eq("patient_id", id)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const detail = await getPatientDeepView(id);
  if (!detail.profile) {
    notFound();
  }

  const threadResult = await supabase
    .from("message_threads")
    .select("id")
    .eq("patient_id", id)
    .eq("provider_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Patient Detail
          </p>
          <h1 className="mt-1 text-3xl font-bold">{detail.profile.full_name}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Timezone: {detail.profile.timezone ?? "N/A"}
          </p>
        </div>
        <Link
          href="/provider/patients"
          className="rounded-xl bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-strong)]"
        >
          Back to patients
        </Link>
        <Link
          href={`/messages${threadResult.data?.id ? `?thread=${threadResult.data.id}` : ""}`}
          className="rounded-xl bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-strong)]"
        >
          Open thread
        </Link>
      </header>

      <Card>
        <h2 className="text-xl font-semibold">Glucose trajectory</h2>
        {detail.glucose.length > 0 ? (
          <div className="mt-4">
            <GlucoseTrendChart data={[...detail.glucose].reverse()} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-muted)]">No glucose data available.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Recent biomarkers</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {detail.biomarkers.map((entry) => (
              <li key={entry.id} className="rounded-lg bg-[var(--color-panel-alt)] p-3">
                <p className="font-semibold">
                  {entry.metric_type}: {entry.value} {entry.unit}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{formatDate(entry.measured_at)}</p>
              </li>
            ))}
            {detail.biomarkers.length === 0 ? (
              <li className="text-[var(--color-muted)]">No biomarker records.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Active medications</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {detail.medications.map((medication) => (
              <li key={medication.id} className="rounded-lg bg-[var(--color-panel-alt)] p-3">
                <p className="font-semibold">{medication.name}</p>
                <p className="text-[var(--color-muted)]">
                  {medication.dosage} • {medication.frequency}
                </p>
              </li>
            ))}
            {detail.medications.length === 0 ? (
              <li className="text-[var(--color-muted)]">No medications logged.</li>
            ) : null}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Recent food logs</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Logged At</th>
                <th>Meal</th>
                <th>Carbs</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {detail.food.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.logged_at)}</td>
                  <td>{entry.meal_type}</td>
                  <td>{entry.estimated_carbs} g</td>
                  <td>{entry.notes}</td>
                </tr>
              ))}
              {detail.food.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-sm text-[var(--color-muted)]">
                    No food logs available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

