export type UserRole = "patient" | "provider";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
};

export type GlucoseReading = {
  id: string;
  patient_id: string;
  value_mg_dl: number;
  reading_context: "fasting" | "pre_meal" | "post_meal" | "bedtime";
  recorded_at: string;
  created_at: string;
};

export type BiomarkerEntry = {
  id: string;
  patient_id: string;
  metric_type: "hba1c" | "weight_kg" | "blood_pressure_sys" | "blood_pressure_dia";
  value: number;
  unit: string;
  measured_at: string;
  created_at: string;
};

export type FoodLog = {
  id: string;
  patient_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  notes: string;
  estimated_carbs: number;
  logged_at: string;
  created_at: string;
};

export type Medication = {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicationLog = {
  id: string;
  patient_id: string;
  medication_id: string;
  status: "taken" | "missed";
  logged_at: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  provider_id: string;
  starts_at: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  reason: string;
  created_at: string;
};

export type MessageThread = {
  id: string;
  patient_id: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  created_at: string;
};
