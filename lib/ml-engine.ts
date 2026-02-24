import type {
  AssessmentInput,
  AssessmentResult,
  SeverityLevel,
  OrganRisk,
  DiseaseRisk,
  DailyLog,
  RecoveryPlan,
  RecoveryWeek,
  NutritionPlan,
  MealPlan,
} from "./types"

// ─── Severity Scoring (weighted algorithm mimicking ML classification) ───
const WEIGHTS = {
  frequency: 0.12,
  duration: 0.08,
  quantity: 0.1,
  withdrawal: 0.08,

  stress: 0.1,
  craving: 0.08,
  mood: 0.06,
  isolation: 0.06,
  triggerControl: 0.06,

  sleep: 0.07,
  physicalActivity: 0.05,
  diet: 0.05,

  quitAttempts: 0.05,
  workImpact: 0.04,
  relationshipImpact: 0.04,
  financialImpact: 0.04,

  healthIssues: 0.06,
  energy: 0.06,
}

function normalizeSleep(hours: number): number {
  // 7-9 hours is optimal; deviation increases risk
  if (hours >= 7 && hours <= 9) return 0
  if (hours >= 5 && hours < 7) return 0.4
  if (hours > 9 && hours <= 11) return 0.3
  return 0.8
}

export function calculateSeverityScore(input: AssessmentInput): number {
  const freqScore = Math.min(input.frequencyPerWeek / 7, 1) * 100
  const durScore = Math.min(input.durationYears / 20, 1) * 100
  const qtyScore = (input.quantityLevel / 5) * 100
  const withdrawalScore = input.withdrawalSymptoms ? 100 : 0
  const stressScore = (input.mentalStressLevel / 5) * 100
  const sleepScore = normalizeSleep(input.sleepHours) * 100

  const weighted =
    freqScore * WEIGHTS.frequency +
    durScore * WEIGHTS.duration +
    qtyScore * WEIGHTS.quantity +
    withdrawalScore * WEIGHTS.withdrawal +
    stressScore * WEIGHTS.stress +
    sleepScore * WEIGHTS.sleep

  return Math.round(Math.min(Math.max(weighted, 0), 100))
}

export function classifySeverity(score: number): SeverityLevel {
  if (score <= 25) return "Low"
  if (score <= 50) return "Moderate"
  if (score <= 75) return "High"
  return "Critical"
}

// ─── Organ Risk Prediction (hybrid rule-based + probability scaling) ───

const ORGAN_BASE_RISK: Record<string, OrganRisk> = {
  alcohol: { liver: 0.8, lungs: 0.2, heart: 0.5, brain: 0.6 },
  smoking: { liver: 0.2, lungs: 0.9, heart: 0.6, brain: 0.4 },
  drugs: { liver: 0.5, lungs: 0.4, heart: 0.7, brain: 0.9 },
  food: { liver: 0.4, lungs: 0.1, heart: 0.7, brain: 0.3 },
}

export function calculateOrganRisk(
  addictionType: string,
  severityScore: number
): OrganRisk {
  const base = ORGAN_BASE_RISK[addictionType] || ORGAN_BASE_RISK.alcohol
  const scale = severityScore / 100

  return {
    liver: Math.round(base.liver * scale * 100),
    lungs: Math.round(base.lungs * scale * 100),
    heart: Math.round(base.heart * scale * 100),
    brain: Math.round(base.brain * scale * 100),
  }
}

// ─── Disease Risk Prediction (logistic-style formula) ───

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

const DISEASE_COEFFICIENTS: Record<string, Record<string, number>> = {
  alcohol: { stroke: 0.6, cancer: 0.5, heartDisease: 0.7, diabetes: 0.4 },
  smoking: { stroke: 0.7, cancer: 0.9, heartDisease: 0.8, diabetes: 0.3 },
  drugs: { stroke: 0.8, cancer: 0.4, heartDisease: 0.6, diabetes: 0.3 },
  food: { stroke: 0.5, cancer: 0.3, heartDisease: 0.8, diabetes: 0.9 },
}

export function calculateDiseaseRisk(
  addictionType: string,
  severityScore: number,
  durationYears: number
): DiseaseRisk {
  const coefficients =
    DISEASE_COEFFICIENTS[addictionType] || DISEASE_COEFFICIENTS.alcohol
  const normalizedSeverity = severityScore / 100
  const normalizedDuration = Math.min(durationYears / 20, 1)

  const compute = (coef: number) => {
    const logit = -2 + 4 * coef * normalizedSeverity + 2 * normalizedDuration
    return Math.round(sigmoid(logit) * 100) / 100
  }

  return {
    stroke: compute(coefficients.stroke),
    cancer: compute(coefficients.cancer),
    heartDisease: compute(coefficients.heartDisease),
    diabetes: compute(coefficients.diabetes),
  }
}

// ─── Recovery Time Estimation (regression-style formula) ───

export function estimateRecoveryWeeks(
  severityScore: number,
  age: number,
  durationYears: number
): number {
  const base = severityScore * 0.3
  const ageFactor = age > 40 ? (age - 40) * 0.2 : 0
  const durationFactor = durationYears * 0.5
  const weeks = base + ageFactor + durationFactor + 4
  return Math.round(Math.min(weeks, 104)) // cap at 2 years
}

// ─── Full Assessment ───

export function runAssessment(input: AssessmentInput): AssessmentResult {
  const severityScore = calculateSeverityScore(input)
  const severityLevel = classifySeverity(severityScore)
  const organRisk = calculateOrganRisk(input.addictionType, severityScore)
  const diseaseRisk = calculateDiseaseRisk(
    input.addictionType,
    severityScore,
    input.durationYears
  )
  const recoveryWeeks = estimateRecoveryWeeks(
    severityScore,
    input.age,
    input.durationYears
  )

  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    input,
    severityScore,
    severityLevel,
    organRisk,
    diseaseRisk,
    recoveryWeeks,
  }
}

// ─── Daily Recovery Score ───

export function calculateDailyRecoveryScore(log: Omit<DailyLog, "id" | "date" | "recoveryScore">): number {
  let score = 50

  if (!log.consumed) score += 25
  else score -= 20

  // Sleep quality
  if (log.sleepHours >= 7 && log.sleepHours <= 9) score += 10
  else if (log.sleepHours < 5 || log.sleepHours > 11) score -= 10

  // Exercise
  if (log.exerciseMinutes >= 30) score += 10
  else if (log.exerciseMinutes >= 15) score += 5

  // Mood
  score += (log.moodScore - 3) * 5

  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function calculateWeeklyImprovement(logs: DailyLog[]): number {
  if (logs.length < 2) return 0
  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const recent = sorted.slice(-7)
  const older = sorted.slice(-14, -7)

  if (older.length === 0) return 0

  const recentAvg =
    recent.reduce((s, l) => s + l.recoveryScore, 0) / recent.length
  const olderAvg =
    older.reduce((s, l) => s + l.recoveryScore, 0) / older.length

  if (olderAvg === 0) return 0
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
}

export function calculateRelapseRisk(logs: DailyLog[]): number {
  if (logs.length === 0) return 50
  const recent = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const consumedDays = recent.filter((l) => l.consumed).length
  const avgMood =
    recent.reduce((s, l) => s + l.moodScore, 0) / recent.length
  const avgSleep =
    recent.reduce((s, l) => s + l.sleepHours, 0) / recent.length

  let risk = (consumedDays / Math.max(recent.length, 1)) * 50
  if (avgMood < 3) risk += 20
  if (avgSleep < 6) risk += 15
  if (avgSleep > 10) risk += 10

  return Math.min(Math.max(Math.round(risk), 0), 100)
}

// ─── Nutrition Plan Generator ───

const NUTRITION_DB: Record<string, Record<string, MealPlan[]>> = {
  alcohol: {
    early: [
      { mealTime: "breakfast", foods: ["Oatmeal with blueberries", "Scrambled eggs with spinach", "Green tea"], benefits: "B-vitamins and antioxidants to repair liver damage" },
      { mealTime: "lunch", foods: ["Grilled salmon with quinoa", "Steamed broccoli", "Lemon water"], benefits: "Omega-3 fatty acids reduce inflammation and support brain repair" },
      { mealTime: "dinner", foods: ["Chicken soup with vegetables", "Brown rice", "Herbal tea"], benefits: "Easy-to-digest meals help restore gut health" },
      { mealTime: "snack", foods: ["Greek yogurt with walnuts", "Apple slices", "Chamomile tea"], benefits: "Probiotics and healthy fats for nutrient absorption" },
    ],
    mid: [
      { mealTime: "breakfast", foods: ["Whole grain toast with avocado", "Poached eggs", "Fresh orange juice"], benefits: "Healthy fats and folate to rebuild liver cells" },
      { mealTime: "lunch", foods: ["Lean turkey wrap with leafy greens", "Sweet potato soup", "Water with lemon"], benefits: "Lean protein and complex carbs for sustained energy" },
      { mealTime: "dinner", foods: ["Baked cod with asparagus", "Wild rice pilaf", "Beetroot salad"], benefits: "Beetroot supports liver detoxification pathways" },
      { mealTime: "snack", foods: ["Mixed berries smoothie", "Almonds", "Turmeric milk"], benefits: "Anti-inflammatory compounds accelerate healing" },
    ],
    late: [
      { mealTime: "breakfast", foods: ["Acai bowl with granola", "Boiled eggs", "Matcha latte"], benefits: "Sustained energy and antioxidant protection" },
      { mealTime: "lunch", foods: ["Mediterranean salad with chickpeas", "Whole grain bread", "Kombucha"], benefits: "Fermented foods restore healthy gut microbiome" },
      { mealTime: "dinner", foods: ["Grilled chicken with roasted vegetables", "Lentil soup", "Mint tea"], benefits: "Complete protein for long-term tissue maintenance" },
      { mealTime: "snack", foods: ["Dark chocolate (70%+)", "Trail mix", "Coconut water"], benefits: "Magnesium and potassium for nerve function" },
    ],
  },
  smoking: {
    early: [
      { mealTime: "breakfast", foods: ["Citrus fruit salad", "Whole grain cereal with milk", "Ginger tea"], benefits: "Vitamin C repairs lung tissue damaged by smoking" },
      { mealTime: "lunch", foods: ["Carrot and ginger soup", "Grilled chicken breast", "Steamed kale"], benefits: "Beta-carotene and vitamin A help regenerate respiratory cells" },
      { mealTime: "dinner", foods: ["Baked sweet potato", "Steamed fish with turmeric", "Garlic sauteed greens"], benefits: "Anti-inflammatory compounds reduce airway swelling" },
      { mealTime: "snack", foods: ["Orange slices", "Celery with hummus", "Green smoothie"], benefits: "Crunchy vegetables reduce oral cravings" },
    ],
    mid: [
      { mealTime: "breakfast", foods: ["Pomegranate yogurt bowl", "Whole wheat toast", "Berry smoothie"], benefits: "Polyphenols protect lung cells from oxidative stress" },
      { mealTime: "lunch", foods: ["Tomato and lentil soup", "Spinach and feta wrap", "Apple cider water"], benefits: "Lycopene and iron boost oxygen-carrying capacity" },
      { mealTime: "dinner", foods: ["Salmon with garlic butter", "Roasted Brussels sprouts", "Quinoa"], benefits: "Omega-3s reduce lung inflammation and improve breathing" },
      { mealTime: "snack", foods: ["Carrot sticks with guacamole", "Pineapple chunks", "Peppermint tea"], benefits: "Healthy fats improve nutrient absorption" },
    ],
    late: [
      { mealTime: "breakfast", foods: ["Chia seed pudding with mango", "Almond butter toast", "Warm lemon water"], benefits: "Omega-3 rich seeds for long-term lung health" },
      { mealTime: "lunch", foods: ["Grilled vegetable and halloumi salad", "Bone broth", "Kiwi"], benefits: "Collagen-building nutrients strengthen airways" },
      { mealTime: "dinner", foods: ["Turkey stir-fry with bell peppers", "Brown rice noodles", "Jasmine tea"], benefits: "Vitamin C-rich peppers maintain respiratory immunity" },
      { mealTime: "snack", foods: ["Brazil nuts", "Grapefruit", "Golden milk"], benefits: "Selenium and antioxidants for cellular repair" },
    ],
  },
  drugs: {
    early: [
      { mealTime: "breakfast", foods: ["Banana and peanut butter smoothie", "Whole grain toast", "Warm milk with honey"], benefits: "Tryptophan and potassium support neurotransmitter recovery" },
      { mealTime: "lunch", foods: ["Lentil and vegetable stew", "Brown rice", "Fresh fruit"], benefits: "Complex carbs stabilize blood sugar for steady mood" },
      { mealTime: "dinner", foods: ["Baked chicken thigh", "Mashed sweet potato", "Steamed green beans"], benefits: "Amino acids from protein rebuild depleted neurotransmitters" },
      { mealTime: "snack", foods: ["Hard-boiled eggs", "Handful of cashews", "Chamomile tea"], benefits: "Choline and magnesium support brain chemistry balance" },
    ],
    mid: [
      { mealTime: "breakfast", foods: ["Eggs benedict with smoked salmon", "Avocado toast", "Green juice"], benefits: "DHA and healthy fats rebuild brain cell membranes" },
      { mealTime: "lunch", foods: ["Chicken and avocado bowl", "Black beans", "Fermented vegetables"], benefits: "Gut-brain axis support with probiotics and fiber" },
      { mealTime: "dinner", foods: ["Grilled steak with roasted garlic", "Baked potato", "Sauteed mushrooms"], benefits: "Iron and B12 reverse cognitive fatigue" },
      { mealTime: "snack", foods: ["Dark chocolate squares", "Walnuts", "Turmeric latte"], benefits: "Flavonoids improve blood flow to the brain" },
    ],
    late: [
      { mealTime: "breakfast", foods: ["Overnight oats with berries and flax", "Greek yogurt", "Matcha tea"], benefits: "Sustained-release energy supports stable neurotransmitter levels" },
      { mealTime: "lunch", foods: ["Tuna and white bean salad", "Sourdough bread", "Olive oil dressing"], benefits: "Omega-3 rich fish maintains cognitive function" },
      { mealTime: "dinner", foods: ["Herb-crusted salmon", "Roasted root vegetables", "Quinoa tabbouleh"], benefits: "Complete nutrition for long-term brain health maintenance" },
      { mealTime: "snack", foods: ["Pumpkin seeds", "Blueberry muffin (whole grain)", "Ginkgo tea"], benefits: "Zinc and antioxidants for memory and focus" },
    ],
  },
  food: {
    early: [
      { mealTime: "breakfast", foods: ["1/2 cup steel-cut oats", "1 small banana", "Black coffee or tea"], benefits: "Portion-controlled complex carbs prevent blood sugar spikes" },
      { mealTime: "lunch", foods: ["4oz grilled chicken", "Large mixed salad", "1 tbsp olive oil dressing"], benefits: "High-protein, high-fiber meal promotes lasting satiety" },
      { mealTime: "dinner", foods: ["4oz baked fish", "1 cup roasted vegetables", "1/2 cup brown rice"], benefits: "Balanced macronutrients prevent binge triggers" },
      { mealTime: "snack", foods: ["10 almonds", "1 small apple", "Herbal tea"], benefits: "Pre-portioned snacks build mindful eating habits" },
    ],
    mid: [
      { mealTime: "breakfast", foods: ["Veggie egg white omelette", "1 slice whole grain toast", "Green tea"], benefits: "High-protein start reduces mid-morning cravings" },
      { mealTime: "lunch", foods: ["Turkey lettuce wraps", "Cucumber and tomato salad", "Sparkling water"], benefits: "Low-calorie-density foods help relearn hunger signals" },
      { mealTime: "dinner", foods: ["Grilled shrimp skewers", "Cauliflower rice", "Steamed edamame"], benefits: "Satisfying textures without excess calories" },
      { mealTime: "snack", foods: ["Cottage cheese with berries", "Celery sticks", "Water with mint"], benefits: "Protein-rich snacks stabilize appetite hormones" },
    ],
    late: [
      { mealTime: "breakfast", foods: ["Smoothie bowl with protein powder", "Fresh fruit topping", "Matcha"], benefits: "Customizable yet portion-aware meal building" },
      { mealTime: "lunch", foods: ["Buddha bowl with tofu", "Mixed grains", "Tahini dressing"], benefits: "Intuitive eating with balanced, colorful plates" },
      { mealTime: "dinner", foods: ["Lean beef stir-fry", "Zucchini noodles", "Miso soup"], benefits: "Satisfying meals that maintain healthy relationship with food" },
      { mealTime: "snack", foods: ["Rice cakes with avocado", "Cherry tomatoes", "Rooibos tea"], benefits: "Mindful snacking as a sustainable lifelong habit" },
    ],
  },
}

const AVOID_FOODS: Record<string, string[]> = {
  alcohol: ["All alcoholic beverages", "Foods cooked with alcohol", "Sugary drinks (trigger cravings)", "Processed foods high in sugar", "Excessive caffeine"],
  smoking: ["Spicy foods (increase oral irritation)", "Excessive caffeine", "Highly processed snacks", "Sugary foods (blood sugar crashes)", "Red meat in excess"],
  drugs: ["Excessive sugar and candy", "Highly caffeinated energy drinks", "Processed junk food", "Alcohol", "Foods with artificial stimulants"],
  food: ["Trigger foods (personal list)", "Ultra-processed snacks", "Sugary beverages", "Large portions of refined carbs", "Eating directly from packages"],
}

const HYDRATION_TIPS: Record<string, Record<string, string>> = {
  alcohol: {
    early: "Drink at least 10 glasses of water daily. Add electrolyte drinks to restore mineral balance depleted by alcohol.",
    mid: "Maintain 8-10 glasses of water. Try herbal teas like dandelion root for liver support.",
    late: "Keep hydrated with 8 glasses daily. Infused water with cucumber or berries makes a great alcohol-free ritual.",
  },
  smoking: {
    early: "Drink 8-12 glasses of water to flush nicotine. Add honey-lemon water to soothe throat irritation.",
    mid: "Stay with 8-10 glasses daily. Green tea and warm water with ginger help clear respiratory congestion.",
    late: "Maintain 8 glasses. Herbal teas like peppermint and eucalyptus support clear breathing.",
  },
  drugs: {
    early: "Hydrate heavily with 10+ glasses. Water helps flush toxins and supports kidney recovery.",
    mid: "Keep at 8-10 glasses. Coconut water helps restore electrolytes and supports brain hydration.",
    late: "Maintain 8 glasses. Bone broth and herbal teas provide minerals alongside hydration.",
  },
  food: {
    early: "Drink a glass of water 20 minutes before each meal. Aim for 8 glasses to distinguish thirst from hunger.",
    mid: "Continue pre-meal water habit. Sparkling water can satisfy oral fixation without calories.",
    late: "Maintain intuitive hydration. Listen to your body and sip water throughout the day.",
  },
}

export function generateNutritionPlan(
  addictionType: string,
  phase: "early" | "mid" | "late"
): NutritionPlan {
  const meals = NUTRITION_DB[addictionType]?.[phase] || NUTRITION_DB.alcohol[phase]
  const avoidFoods = AVOID_FOODS[addictionType] || AVOID_FOODS.alcohol
  const hydrationTip = HYDRATION_TIPS[addictionType]?.[phase] || "Drink at least 8 glasses of water daily."

  return {
    phase,
    meals,
    hydrationTip,
    avoidFoods,
  }
}

// ─── Recovery Plan Generator ───

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking",
  drugs: "Substance",
  food: "Food/Eating",
}

function generateWeeklyPlan(
  severity: SeverityLevel,
  addictionType: string,
  totalWeeks: number
): RecoveryWeek[] {
  const label = ADDICTION_LABELS[addictionType] || "Addiction"
  const weeks: RecoveryWeek[] = []
  const planWeeks = Math.min(totalWeeks, 12)

  for (let i = 1; i <= planWeeks; i++) {
    const phase =
      i <= Math.ceil(planWeeks * 0.3)
        ? "early"
        : i <= Math.ceil(planWeeks * 0.7)
        ? "mid"
        : "late"

    const nutrition = generateNutritionPlan(addictionType, phase)
    const week: RecoveryWeek = { week: i, goals: [], activities: [], tips: [], nutrition }

    if (phase === "early") {
      week.goals = [
        `Reduce ${label.toLowerCase()} intake by ${Math.min(i * 15, 50)}%`,
        "Establish daily routine",
        "Identify triggers",
      ]
      week.activities = [
        "Morning meditation (10 min)",
        "Evening journaling",
        "Light walking (20 min)",
        "Deep breathing exercises",
      ]
      week.tips = [
        "Remove triggers from your environment",
        "Stay hydrated throughout the day",
        "Reach out to a support person daily",
      ]
    } else if (phase === "mid") {
      week.goals = [
        `Maintain reduced ${label.toLowerCase()} usage`,
        "Build healthy coping mechanisms",
        "Strengthen social connections",
      ]
      week.activities = [
        "Exercise (30 min)",
        "Hobby or creative activity (1 hr)",
        "Support group meeting",
        "Mindfulness practice",
      ]
      week.tips = [
        "Celebrate small victories",
        "Practice saying no in low-pressure situations",
        "Eat balanced, nutritious meals",
      ]
    } else {
      week.goals = [
        `Work toward full ${label.toLowerCase()} abstinence`,
        "Establish long-term relapse prevention",
        "Plan for independent maintenance",
      ]
      week.activities = [
        "Vigorous exercise (45 min)",
        "Volunteer or community engagement",
        "Weekly progress review",
        "Stress management workshop",
      ]
      week.tips = [
        "Create a relapse prevention plan",
        "Identify and avoid high-risk situations",
        "Build a long-term support network",
      ]
    }

    weeks.push(week)
  }

  return weeks
}

export function generateRecoveryPlan(
  severity: SeverityLevel,
  addictionType: string,
  recoveryWeeks: number
): RecoveryPlan {
  const rehabRecommended = severity === "High" || severity === "Critical"
  const weeks = generateWeeklyPlan(severity, addictionType, recoveryWeeks)

  return {
    severity,
    addictionType: addictionType as RecoveryPlan["addictionType"],
    weeks,
    rehabRecommended,
  }
}
