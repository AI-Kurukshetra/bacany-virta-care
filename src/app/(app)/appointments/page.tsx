import { addAppointment } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssignedProviderId, requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AppointmentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const profile = await requireProfile();
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  const error = getParam(params, "error");
  const assignedProviderId =
    profile.role === "patient" ? await getAssignedProviderId(profile.id) : null;
  const hasAssignedProvider =
    profile.role === "provider" ? true : Boolean(assignedProviderId);

  const query = supabase
    .from("appointments")
    .select("*, patient:profiles!appointments_patient_id_fkey(full_name)")
    .order("starts_at", { ascending: true })
    .limit(25);

  const appointmentsResult =
    profile.role === "provider"
      ? await query.eq("provider_id", profile.id)
      : await query.eq("patient_id", profile.id);

  const appointments = appointmentsResult.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Appointments
        </p>
        <h1 className="mt-1 text-3xl font-bold">
          {profile.role === "provider"
            ? "Upcoming patient sessions"
            : "Care team scheduling"}
        </h1>
      </header>

      {profile.role === "patient" ? (
        <Card className="max-w-3xl">
          <h2 className="text-xl font-semibold">Request appointment</h2>
          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          ) : null}
          {hasAssignedProvider ? (
            <form action={addAppointment} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="starts_at">Requested date/time</label>
                <input id="starts_at" name="starts_at" type="datetime-local" required />
              </div>
              <div>
                <label htmlFor="reason">Reason</label>
                <input
                  id="reason"
                  name="reason"
                  type="text"
                  placeholder="Review glucose spikes after dinner."
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Submit request</Button>
              </div>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-alt)] px-4 py-4 text-sm text-[var(--color-muted)]">
              Appointment requests will be available once a provider is assigned to your care plan.
            </div>
          )}
        </Card>
      ) : null}

      <Card>
        <h2 className="text-xl font-semibold">Schedule</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {profile.role === "provider" ? <th>Patient</th> : null}
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDateTime(String(appointment.starts_at))}</td>
                  {profile.role === "provider" ? (
                    <td>
                      {String(
                        (appointment.patient as { full_name?: string } | null)
                          ?.full_name ?? "Unknown patient",
                      )}
                    </td>
                  ) : null}
                  <td>{String(appointment.status)}</td>
                  <td>{String(appointment.reason)}</td>
                </tr>
              ))}
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={profile.role === "provider" ? 4 : 3}
                    className="py-6 text-sm text-[var(--color-muted)]"
                  >
                    No appointments found.
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
