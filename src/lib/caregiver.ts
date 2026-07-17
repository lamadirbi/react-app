export const CAREGIVER_RELATIONSHIPS = [
  { value: "son", label: "ابن" },
  { value: "daughter", label: "ابنة" },
  { value: "spouse", label: "زوج/ة" },
  { value: "father", label: "أب" },
  { value: "mother", label: "أم" },
  { value: "brother", label: "أخ" },
  { value: "sister", label: "أخت" },
] as const;

export type CaregiverRelationship = (typeof CAREGIVER_RELATIONSHIPS)[number]["value"];

export function caregiverRelationshipLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return CAREGIVER_RELATIONSHIPS.find((r) => r.value === value)?.label ?? null;
}

export type CaregiverPatientInfo = {
  name: string;
  caregiver_mode_enabled?: boolean;
  caregiver_relationship?: string | null;
};

export function formatPatientWithRelationship(patient: CaregiverPatientInfo): string {
  if (patient.caregiver_mode_enabled && patient.caregiver_relationship) {
    const label = caregiverRelationshipLabel(patient.caregiver_relationship);
    if (label) return `${patient.name} (${label})`;
  }
  return patient.name;
}
