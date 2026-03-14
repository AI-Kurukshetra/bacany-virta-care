import { addMedication, addMedicationLog } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MedicationsPage() {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();

  const [medicationsResult, logsResult] = await Promise.all([
    supabase
      .from("medications")
      .select("*")
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("medication_logs")
      .select("*, medications(name)")
      .eq("patient_id", profile.id)
      .order("logged_at", { ascending: false })
      .limit(30),
  ]);

  const medications = medicationsResult.data ?? [];
  const logs = logsResult.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Medications
        </p>
        <h1 className="mt-1 text-3xl font-bold">Medication and adherence tracking</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Add medication</h2>
          <form action={addMedication} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name">Medication name</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div>
              <label htmlFor="dosage">Dosage</label>
              <input id="dosage" name="dosage" type="text" placeholder="500 mg" required />
            </div>
            <div>
              <label htmlFor="frequency">Frequency</label>
              <input id="frequency" name="frequency" type="text" placeholder="Twice daily" required />
            </div>
            <Button type="submit">Save medication</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Log adherence</h2>
          <form action={addMedicationLog} className="mt-4 space-y-4">
            <div>
              <label htmlFor="medication_id">Medication</label>
              <select id="medication_id" name="medication_id" required>
                <option value="">Select medication</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="taken">
                <option value="taken">Taken</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div>
              <label htmlFor="logged_at">Logged at</label>
              <input id="logged_at" name="logged_at" type="datetime-local" required />
            </div>
            <Button type="submit">Save log</Button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Medication list</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication) => (
                <tr key={medication.id}>
                  <td>{medication.name}</td>
                  <td>{medication.dosage}</td>
                  <td>{medication.frequency}</td>
                  <td>{medication.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {medications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-sm text-[var(--color-muted)]">
                    No medications available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Recent adherence entries</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Medication</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(String(entry.logged_at))}</td>
                  <td>{String((entry.medications as { name?: string } | null)?.name ?? "-")}</td>
                  <td>{String(entry.status)}</td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-sm text-[var(--color-muted)]">
                    No adherence logs available.
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
