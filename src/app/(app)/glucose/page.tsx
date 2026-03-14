import { addGlucoseReading } from "@/app/actions/records";
import { GlucoseTrendChart } from "@/components/charts/glucose-trend-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GlucosePage() {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();

  const { data: readings } = await supabase
    .from("glucose_readings")
    .select("*")
    .eq("patient_id", profile.id)
    .order("recorded_at", { ascending: false })
    .limit(30);

  const recentReadings = readings ?? [];
  const chartData = [...recentReadings].reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Glucose
        </p>
        <h1 className="mt-1 text-3xl font-bold">Continuous glucose log</h1>
      </header>

      <Card>
        <h2 className="text-xl font-semibold">Add reading</h2>
        <form action={addGlucoseReading} className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="value_mg_dl">Value (mg/dL)</label>
            <input id="value_mg_dl" name="value_mg_dl" type="number" min="40" max="500" required />
          </div>
          <div>
            <label htmlFor="reading_context">Context</label>
            <select id="reading_context" name="reading_context" defaultValue="fasting">
              <option value="fasting">Fasting</option>
              <option value="pre_meal">Pre meal</option>
              <option value="post_meal">Post meal</option>
              <option value="bedtime">Bedtime</option>
            </select>
          </div>
          <div>
            <label htmlFor="recorded_at">Recorded at</label>
            <input id="recorded_at" name="recorded_at" type="datetime-local" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Save
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Trend</h2>
        {chartData.length > 0 ? (
          <div className="mt-4">
            <GlucoseTrendChart data={chartData} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-muted)]">No readings yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Recent entries</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Recorded</th>
                <th>Context</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {recentReadings.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.recorded_at as string)}</td>
                  <td>{String(entry.reading_context).replace("_", " ")}</td>
                  <td>{entry.value_mg_dl} mg/dL</td>
                </tr>
              ))}
              {recentReadings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-sm text-[var(--color-muted)]">
                    No glucose data available.
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
