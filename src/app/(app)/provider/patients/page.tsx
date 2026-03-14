import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProviderPatientsPage() {
  const profile = await requireProfile("provider");
  const supabase = await createServerSupabaseClient();

  const assignmentsResult = await supabase
    .from("patient_provider_assignments")
    .select("patient_id")
    .eq("provider_id", profile.id);

  const patientIds =
    assignmentsResult.data?.map((assignment) => assignment.patient_id as string) ?? [];

  const patientsResult =
    patientIds.length > 0
      ? await supabase.from("profiles").select("*").in("id", patientIds)
      : { data: [] };

  const patients = patientsResult.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Provider
        </p>
        <h1 className="mt-1 text-3xl font-bold">Assigned patients</h1>
      </header>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Timezone</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.full_name}</td>
                  <td>{patient.timezone ?? "N/A"}</td>
                  <td>
                    <Link
                      href={`/provider/patients/${patient.id}`}
                      className="text-sm font-semibold text-[var(--color-accent-strong)]"
                    >
                      View profile
                    </Link>
                  </td>
                </tr>
              ))}
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-sm text-[var(--color-muted)]">
                    No patients assigned yet.
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
