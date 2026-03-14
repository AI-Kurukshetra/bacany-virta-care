import { completeOnboarding } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await requireProfile("patient");
  const supabase = await createServerSupabaseClient();

  const { data: onboarding } = await supabase
    .from("onboarding_records")
    .select("*")
    .eq("patient_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Intake
        </p>
        <h1 className="mt-1 text-3xl font-bold">Health onboarding profile</h1>
      </header>

      <Card className="max-w-3xl">
        <form action={completeOnboarding} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="current_weight_kg">Current weight (kg)</label>
            <input
              id="current_weight_kg"
              name="current_weight_kg"
              type="number"
              step="0.1"
              min="30"
              max="300"
              defaultValue={onboarding?.current_weight_kg ?? ""}
              required
            />
          </div>
          <div>
            <label htmlFor="baseline_hba1c">Baseline HbA1c (%)</label>
            <input
              id="baseline_hba1c"
              name="baseline_hba1c"
              type="number"
              step="0.1"
              min="4"
              max="18"
              defaultValue={onboarding?.baseline_hba1c ?? ""}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="primary_goal">Primary goal</label>
            <input
              id="primary_goal"
              name="primary_goal"
              type="text"
              defaultValue={onboarding?.primary_goal ?? ""}
              placeholder="Reduce HbA1c below 6.5 and improve energy."
              required
            />
          </div>
          <div>
            <label htmlFor="dietary_preference">Dietary preference</label>
            <input
              id="dietary_preference"
              name="dietary_preference"
              type="text"
              defaultValue={onboarding?.questionnaire?.dietary_preference ?? ""}
              placeholder="Low carb, vegetarian, etc."
              required
            />
          </div>
          <div>
            <label htmlFor="activity_level">Activity level</label>
            <select
              id="activity_level"
              name="activity_level"
              defaultValue={onboarding?.questionnaire?.activity_level ?? "moderate"}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              Save onboarding profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
