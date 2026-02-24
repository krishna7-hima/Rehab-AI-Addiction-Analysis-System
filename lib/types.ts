export type AddictionType = "alcohol" | "smoking" | "drugs" | "food"

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical"


export interface AssessmentInput {
  addictionType: AddictionType

  // Usage
  frequencyPerWeek: number
  durationYears: number
  quantityLevel: number
  withdrawalSymptoms: boolean

  // Psychological
  mentalStressLevel: number
  cravingLevel: number
  moodSwings: number
  socialIsolation: number
  triggersControl: number

  // Lifestyle
  sleepHours: number
  physicalActivityLevel: number
  dietQuality: number

  // Behavioral
  failedQuitAttempts: number
  familyHistory: boolean
  workImpact: number
  relationshipImpact: number
  financialImpact: number

  // Physical
  existingHealthIssues: boolean
  energyLevel: number

  age: number
}

export interface OrganRisk {
  liver: number
  lungs: number
  heart: number
  brain: number
}

export interface DiseaseRisk {
  stroke: number
  cancer: number
  heartDisease: number
  diabetes: number
}

export interface AssessmentResult {
  id: string
  date: string
  input: AssessmentInput
  severityScore: number
  severityLevel: SeverityLevel
  organRisk: OrganRisk
  diseaseRisk: DiseaseRisk
  recoveryWeeks: number
}

export interface DailyLog {
  id: string
  date: string
  consumed: boolean
  sleepHours: number
  exerciseMinutes: number
  moodScore: number
  recoveryScore: number
}

// ─── Nutrition Plan Types ───

export interface MealPlan {
  mealTime: "breakfast" | "lunch" | "dinner" | "snack"
  foods: string[]
  benefits: string
}

export interface NutritionPlan {
  phase: "early" | "mid" | "late"
  meals: MealPlan[]
  hydrationTip: string
  avoidFoods: string[]
}

// ─── Recovery Plan Types ───

export interface RecoveryWeek {
  week: number
  goals: string[]
  activities: string[]
  tips: string[]
  nutrition: NutritionPlan
}

export interface RecoveryPlan {
  severity: SeverityLevel
  addictionType: AddictionType
  weeks: RecoveryWeek[]
  rehabRecommended: boolean
}

// ─── Reminder Types ───

export type ReminderCategory = "food" | "exercise" | "medication" | "sleep" | "hydration" | "custom"

export interface Reminder {
  id: string
  label: string
  time: string // HH:mm format
  category: ReminderCategory
  enabled: boolean
}

// ─── Hospital / Booking Types ───

export interface RehabCentre {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  specialties: AddictionType[]
  rating: number
  reviewCount: number
  availableSlots: number
  lat: number
  lng: number
  type: "hospital" | "rehab" | "clinic"
  description: string
  amenities: string[]
}

export interface Booking {
  id: string
  hospitalId: string
  hospitalName: string
  date: string
  timeSlot: string
  patientName: string
  patientPhone: string
  status: "confirmed" | "pending" | "cancelled"
  referenceNumber: string
  createdAt: string
}

// ─── User / App State ───

export interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  gender: "male" | "female" | "other"
  weight: number
  height: number
  isGuest: boolean
}

export interface AppState {
  user: UserProfile | null
  assessments: AssessmentResult[]
  dailyLogs: DailyLog[]
  currentPlan: RecoveryPlan | null
  reminders: Reminder[]
  bookings: Booking[]
}
