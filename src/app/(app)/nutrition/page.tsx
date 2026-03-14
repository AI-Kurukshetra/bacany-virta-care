import { addFoodLog } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();

  const { data: foodLogs } = await supabase
    .from("food_logs")
    .select("*")
    .eq("patient_id", profile.id)
    .order("logged_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Nutrition
        </p>
        <h1 className="mt-1 text-3xl font-bold">Meal and carb tracking</h1>
      </header>

      <Card>
        <h2 className="text-xl font-semibold">Log meal</h2>
        <form action={addFoodLog} className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="meal_type">Meal type</label>
            <select id="meal_type" name="meal_type" defaultValue="breakfast">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimated_carbs">Estimated carbs (g)</label>
            <input id="estimated_carbs" name="estimated_carbs" type="number" min="0" max="500" required />
          </div>
          <div>
            <label htmlFor="logged_at">Logged at</label>
            <input id="logged_at" name="logged_at" type="datetime-local" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Save meal
            </Button>
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="notes">Meal notes</label>
            <textarea id="notes" name="notes" rows={3} placeholder="Salmon salad with olive oil dressing." required />
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Recent meals</h2>
        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Meal</th>
                <th>Carbs</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {(foodLogs ?? []).map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.logged_at as string)}</td>
                  <td>{String(entry.meal_type)}</td>
                  <td>{entry.estimated_carbs} g</td>
                  <td>{String(entry.notes)}</td>
                </tr>
              ))}
              {!foodLogs || foodLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-sm text-[var(--color-muted)]">
                    No meal logs available.
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
