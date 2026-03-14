import Link from "next/link";
import { GlucoseTrendChart } from "@/components/charts/glucose-trend-chart";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { requireProfile } from "@/lib/auth";
import { getPatientDashboardData, getProviderDashboardData } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toPercentage(taken: number, total: number): string {
  if (!total) {
    return "0%";
  }
  return `${Math.round((taken / total) * 100)}%`;
}

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (profile.role === "provider") {
    const data = await getProviderDashboardData(profile.id);

    return (
      <div className="space-y-6 animate-fade-in">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-muted)]">
            Provider Command Center
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-[-0.03em]">Today&apos;s care snapshot</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Assigned Patients" value={String(data.patients.length)} />
          <StatCard label="Upcoming Appointments" value={String(data.appointments.length)} />
          <StatCard label="Potential Risk Flags" value={String(data.highRiskPatients)} />
          <StatCard label="Recent Patient Messages" value={String(data.unreadMessages)} />
        </section>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Assigned patient panel</h2>
            <Link
              href="/provider/patients"
              className="rounded-xl bg-[var(--color-accent-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--color-accent-strong)] transition-all hover:-translate-y-px hover:brightness-[0.98]"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Timezone</th>
                  <th>Open profile</th>
                </tr>
              </thead>
              <tbody>
                {data.patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.full_name}</td>
                    <td>{patient.timezone ?? "Unknown"}</td>
                    <td>
                      <Link
                        href={`/provider/patients/${patient.id}`}
                        className="text-sm font-semibold text-[var(--color-accent-strong)]"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.patients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-sm text-[var(--color-muted)]">
                      No assigned patients yet. Seed data will populate this after setup.
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

  const data = await getPatientDashboardData(profile.id);
  const takenCount = data.medicationLogs.filter((entry) => entry.status === "taken").length;
  const adherence = toPercentage(takenCount, data.medicationLogs.length);
  const hba1c = data.biomarkers.find((entry) => entry.metric_type === "hba1c");
  const weight = data.biomarkers.find((entry) => entry.metric_type === "weight_kg");

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--color-muted)]">
            Patient Dashboard
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-[-0.03em]">Your metabolic progress</h1>
        </div>
        <Link
          href="/onboarding"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-strong)] shadow-[0_18px_40px_-34px_rgba(12,82,73,0.8)] transition-all hover:-translate-y-px hover:bg-[var(--color-panel-alt)]"
        >
          Update onboarding
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Latest HbA1c"
          value={hba1c ? `${hba1c.value.toFixed(1)} ${hba1c.unit}` : "N/A"}
        />
        <StatCard
          label="Latest Weight"
          value={weight ? `${weight.value.toFixed(1)} ${weight.unit}` : "N/A"}
        />
        <StatCard label="Medication Adherence" value={adherence} />
        <StatCard
          label="Next Appointment"
          value={data.nextAppointment ? formatDateTime(data.nextAppointment.starts_at) : "Not scheduled"}
        />
      </section>

      <Card>
        <h2 className="text-xl font-semibold">7-day glucose trend</h2>
        {data.glucose.length > 0 ? (
          <div className="mt-4">
            <GlucoseTrendChart data={data.glucose} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            No glucose entries found yet. Add one from the Glucose page.
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Active medications</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.medications.map((medication) => (
              <li key={medication.id} className="rounded-lg bg-[var(--color-panel-alt)] p-3">
                <p className="font-semibold">{medication.name}</p>
                <p className="text-[var(--color-muted)]">
                  {`${medication.dosage} - ${medication.frequency}`}
                </p>
              </li>
            ))}
            {data.medications.length === 0 ? (
              <li className="text-[var(--color-muted)]">No active medications logged.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Latest message</h2>
          {data.latestMessage ? (
            <article className="mt-4 rounded-xl bg-[var(--color-panel-alt)] p-4">
              <p className="text-sm leading-6">{data.latestMessage.body}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                {formatDateTime(data.latestMessage.sent_at)}
              </p>
            </article>
          ) : (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              No messages yet. Start a conversation with your care team.
            </p>
          )}
          <Link
            href="/messages"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent-strong)]"
          >
            Open messages
          </Link>
        </Card>
      </div>
    </div>
  );
}


