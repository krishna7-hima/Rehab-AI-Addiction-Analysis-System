"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardList, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2, Zap, ThumbsUp, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type { AddictionType, AssessmentInput } from "@/lib/types"
import {
  runAssessment,
  generateRecoveryPlan,
  classifySeverity,
  calculateOrganRisk,
  calculateDiseaseRisk,
  estimateRecoveryWeeks,
} from "@/lib/ml-engine"
import { store } from "@/lib/store"

const ADDICTION_TYPES = [
  { value: "alcohol", emoji: "🍺", label: "Alcohol", desc: "Beer, wine, spirits" },
  { value: "smoking", emoji: "🚬", label: "Smoking / Tobacco", desc: "Cigarettes, vaping" },
  { value: "drugs", emoji: "💊", label: "Drugs", desc: "Prescription or illicit" },
  { value: "food", emoji: "🍔", label: "Food", desc: "Binge eating" },
]

const EASY_STEPS = ["Profile", "Usage & Health", "Lifestyle"]
const ADVANCED_STEPS = [
  "Type & Profile",
  "Usage Pattern",
  "Physical Health",
  "Mental & Emotional",
  "Social & Background",
  "Review & Feedback",
]

const DEFAULT_FORM = {
  addictionType: [] as string[],
  primarySubstance: "", // For ML engine (main focus)
  age: "",
  gender: "",
  height: "", // cm
  weight: "", // kg
  frequencyPerWeek: "",
  durationYears: "",
  quantityLevel: 3,
  dailyFirstUseMinutes: 60,
  previousQuitAttempts: 0,
  
  // Advanced DSM-5 Criteria Questions
  withdrawalSymptoms: 0,
  toleranceWithdrawal: false,
  cravingIntensity: 3,
  unableToControl: false,
  continuesDespiteHarm: false,
  neglectedActivities: false,
  riskySituations: false,
  tolerance: false,
  timeSpentObtaining: 3,
  
  // Health
  physicalHealthRating: 3,
  chronicIllness: false,
  bmiCategory: "", // Will be calculated from height/weight
  
  // Mental
  mentalStress: 3,
  sleepHours: 7,
  anxietyLevel: 3,
  depressionScreening: 3,
  
  // Social
  socialSupport: 3,
  peerInfluence: false,
  employmentStatus: "",
  familyHistory: false,
  
  // Feedback
  feedback: "",
  assessmentDifficulty: "appropriate" as "easy" | "appropriate" | "difficult",
  accuracy: 5,
}

interface ModeSelectionProps {
  onSelect: (mode: "easy" | "advanced") => void
}

function ModeSelection({ onSelect }: ModeSelectionProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary/5 via-background to-cyan-50/20 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Addiction Assessment</h1>
          <p className="text-muted-foreground mt-2">Choose your assessment style</p>
        </div>

        <div className="space-y-3">
          <Card
            onClick={() => onSelect("easy")}
            className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <CardTitle className="text-lg">Quick Assessment</CardTitle>
                <CardDescription>15 essential questions · 2-3 minutes · Best for quick screening</CardDescription>
                <p className="text-sm text-muted-foreground mt-2">✓ Basic severity evaluation</p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => onSelect("advanced")}
            className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <CardTitle className="text-lg">Comprehensive Assessment</CardTitle>
                <CardDescription>20+ detailed questions · 5-7 minutes · Complete health analysis</CardDescription>
                <p className="text-sm text-muted-foreground mt-2">✓ In-depth evaluation with recovery plan</p>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          You can retake assessments anytime from your dashboard
        </p>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"easy" | "advanced" | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateForm(key, e.target.type === "checkbox" ? e.target.checked : e.target.value)
  }

  const STEPS = mode === "easy" ? EASY_STEPS : ADVANCED_STEPS

  const canNext = () => {
  if (!mode) return true

  const age = Number(form.age)
  const height = Number(form.height)
  const weight = Number(form.weight)

  if (mode === "easy") {

    if (step === 0) {
      return (
        form.addictionType.length > 0 &&
        age > 0 &&
        form.gender !== "" &&
        height > 0 &&
        weight > 0
      )
    }

    if (step === 1) {
      return (
        form.frequencyPerWeek !== "" &&
        form.durationYears !== "" &&
        form.bmiCategory !== "" &&
        form.unableToControl !== null &&
        form.continuesDespiteHarm !== null &&
        form.tolerance !== null
      )
    }

    if (step === 2) {
      return (
        form.cravingIntensity > 0 &&
        form.anxietyLevel > 0 &&
        form.depressionScreening > 0 &&
        form.employmentStatus !== ""
      )
    }

    return true
  }

  // ADVANCED MODE
  if (mode === "advanced") {

    if (step === 0) {
      return (
        form.addictionType.length > 0 &&
        form.primarySubstance !== "" &&
        age > 0 &&
        form.gender !== "" &&
        height > 0 &&
        weight > 0
      )
    }

    if (step === 1)
      return form.frequencyPerWeek !== "" && form.durationYears !== ""

    if (step === 2)
      return form.bmiCategory !== ""

    if (step === 4)
      return form.employmentStatus !== ""

    return true
  }

  return false
}
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Use primary substance for ML engine
      const primarySubstance = form.primarySubstance || form.addictionType[0]

      const input: AssessmentInput = {
        addictionType: primarySubstance as AddictionType,
        frequencyPerWeek: parseFloat(form.frequencyPerWeek),
        durationYears: parseFloat(form.durationYears),
        quantityLevel: parseInt(String(form.quantityLevel)),
        withdrawalSymptoms: form.toleranceWithdrawal || false,
        mentalStressLevel: parseInt(String(form.mentalStress)),
        sleepHours: parseFloat(String(form.sleepHours)),
        age: parseInt(form.age),
        cravingLevel: parseInt(String(form.cravingIntensity)) || 3,
        moodSwings: form.continuesDespiteHarm ? 1 : 0,
        socialIsolation: form.peerInfluence ? 1 : 0,
        triggersControl: form.unableToControl ? 0 : 1,
        physicalActivityLevel: form.physicalHealthRating,
        dietQuality: 3,
        failedQuitAttempts: form.previousQuitAttempts,
        familyHistory: form.familyHistory,
        workImpact: form.employmentStatus === "unemployed" ? 1 : 0,
        relationshipImpact: form.neglectedActivities ? 1 : 0,
        financialImpact: form.chronicIllness ? 1 : 0,
        existingHealthIssues: form.chronicIllness,
        energyLevel: form.physicalHealthRating,
      }

      const base = runAssessment(input)

      let extra = 0
      extra += form.cravingIntensity * 3  // Craving intensity
      extra += form.anxietyLevel * 2
      extra += form.depressionScreening * 2
      if (form.toleranceWithdrawal) extra += 30  // Withdrawal
      if (form.unableToControl) extra += 25  // Loss of control
      if (form.continuesDespiteHarm) extra += 20  // Despite harm
      if (form.neglectedActivities) extra += 15  // Neglected activities
      if (form.riskySituations) extra += 15  // Risky situations
      if (form.tolerance) extra += 12  // Increased tolerance
      if (form.previousQuitAttempts > 0) extra += 8
      if (form.chronicIllness) extra += 15
      if (form.socialSupport < 3) extra += 10
      if (form.peerInfluence) extra += 10
      if (form.familyHistory) extra += 8

      const combinedScore = Math.min(Math.max(base.severityScore + Math.round(extra), 0), 100)
      const combinedSeverity = classifySeverity(combinedScore)

      const organRisk = calculateOrganRisk(primarySubstance, combinedScore)
      const diseaseRisk = calculateDiseaseRisk(primarySubstance, combinedScore, input.durationYears)
      const recoveryWeeks = estimateRecoveryWeeks(combinedScore, input.age, input.durationYears)

      const adjustedResult = {
        ...base,
        severityScore: combinedScore,
        severityLevel: combinedSeverity,
        organRisk,
        diseaseRisk,
        recoveryWeeks,
      }

      try {
        await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...adjustedResult,
            feedback: form.feedback,
            assessmentDifficulty: form.assessmentDifficulty,
            accuracy: form.accuracy,
            mode: mode,
            substancesUsed: form.addictionType,
          }),
        })
      } catch (err) {
        // ignore network errors
      }

      store.addAssessment(adjustedResult)
      const plan = generateRecoveryPlan(adjustedResult.severityLevel, primarySubstance, adjustedResult.recoveryWeeks)
      store.setRecoveryPlan(plan)

      toast.success("Assessment complete! Viewing your results.")
      router.push("/dashboard")
    } catch (err) {
      toast.error("Assessment failed. Please check your answers.")
    } finally {
      setLoading(false)
    }
  }

  const SliderQuestion = ({ label, name, min, max, step: st = 1, lowLabel, highLabel, qNum }: any) => {
    const currentValue = form[name as keyof typeof form]
    return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">
          <span className="text-primary font-bold mr-2">Q{qNum}</span>
          {label}
        </Label>
        <span className="text-primary font-bold text-lg">{currentValue}</span>
      </div>
      <Slider
        value={[currentValue as number]}
        onValueChange={([v]) => updateForm(name, v)}
        min={min}
        max={max}
        step={st}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} — {lowLabel}</span>
        <span>{max} — {highLabel}</span>
      </div>
    </div>
  )
  }

  const YesNoButtons = ({ label, name, qNum }: any) => {
    const currentValue = form[name as keyof typeof form]
    return (
    <div>
      <p className="text-sm font-medium mb-3">
        <span className="text-primary font-bold mr-2">Q{qNum}</span>
        {label}
      </p>
      <div className="flex gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => updateForm(name, value)}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all ${
              currentValue === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {value ? "✅ Yes" : "❌ No"}
          </button>
        ))}
      </div>
    </div>
    )
  }

  if (!mode) {
    return <ModeSelection onSelect={setMode} />
  }

  const isEasy = mode === "easy"
  const maxSteps = STEPS.length
  const progressPercent = ((step + 1) / maxSteps) * 100

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary/5 via-background to-cyan-50/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Addiction Assessment</h1>
          <p className="text-muted-foreground mt-1">
            {isEasy ? "Quick assessment · 15 questions · ~3 minutes" : "Comprehensive assessment · 20+ questions · ~5-7 minutes"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Step {step + 1} of {maxSteps}: {STEPS[step]}
            </span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* ─── EASY MODE ─── */}

            {/* EASY STEP 0: Profile */}
            {isEasy && step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Let's start with you</h2>

                <div>
                  <p className="text-sm font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q1</span>
                    Which substances are you addressing? (Select all that apply)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ADDICTION_TYPES.map(({ value, emoji, label, desc }) => (
                      <div
                        key={value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          form.addictionType.includes(value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => {
                          if (form.addictionType.includes(value)) {
                            updateForm("addictionType", form.addictionType.filter((t) => t !== value))
                          } else {
                            updateForm("addictionType", [...form.addictionType, value])
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={form.addictionType.includes(value)}
                            onChange={() => {}}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-2xl">{emoji}</span>
                            <div className="font-semibold text-sm mt-1">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.addictionType.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">✓ Selected: {form.addictionType.map(t => ADDICTION_TYPES.find(a => a.value === t)?.label).join(", ")}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q2</span>
                    Your current age *
                  </Label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="e.g. 28"
                    value={form.age}
                    onChange={handleInputChange("age")}
                    className="mt-2"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q3</span>
                    Gender
                  </p>
                  <div className="flex gap-3">
                    {[
                      ["male", "👨 Male"],
                      ["female", "👩 Female"],
                      ["other", "⚧ Other"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateForm("gender", value)}
                        className={`flex-1 py-2.5 rounded-lg font-medium text-sm border-2 transition-all ${
                          form.gender === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">
                      <span className="text-primary font-bold mr-2">Q4</span>
                      Height (cm) *
                    </Label>
                    <Input
                      type="number"
                      min="100"
                      max="250"
                      placeholder="e.g. 175"
                      value={form.height}
                      onChange={handleInputChange("height")}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., 170-180 cm</p>
                  </div>
                  <div>
                    <Label className="text-sm">
                      <span className="text-primary font-bold mr-2">Q5</span>
                      Weight (kg) *
                    </Label>
                    <Input
                      type="number"
                      min="30"
                      max="200"
                      step="0.5"
                      placeholder="e.g. 75"
                      value={form.weight}
                      onChange={handleInputChange("weight")}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., 60-90 kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* EASY STEP 1: Usage & Health */}
            {isEasy && step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Usage & Health</h2>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q6</span>
                    Days per week *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    step="0.5"
                    placeholder="0–7"
                    value={form.frequencyPerWeek}
                    onChange={handleInputChange("frequencyPerWeek")}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">0 = rarely, 7 = daily</p>
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q7</span>
                    Years of use *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    value={form.durationYears}
                    onChange={handleInputChange("durationYears")}
                    className="mt-2"
                  />
                </div>

                <SliderQuestion
                  label="Amount per session"
                  name="quantityLevel"
                  min={1}
                  max={5}
                  lowLabel="Very little"
                  highLabel="Very large"
                  qNum={8}
                />

                <YesNoButtons
                  label="Do you experience withdrawal symptoms?"
                  name="withdrawalSymptoms"
                  qNum={9}
                />

                <SliderQuestion
                  label="Overall physical health"
                  name="physicalHealthRating"
                  min={1}
                  max={5}
                  lowLabel="Very poor"
                  highLabel="Excellent"
                  qNum={10}
                />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q11</span>
                    Your BMI category *
                  </Label>
                  <Select value={form.bmiCategory} onValueChange={(v) => updateForm("bmiCategory", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="underweight">Underweight (BMI &lt; 18.5)</SelectItem>
                      <SelectItem value="normal">Normal (BMI 18.5–24.9)</SelectItem>
                      <SelectItem value="overweight">Overweight (BMI 25–29.9)</SelectItem>
                      <SelectItem value="obese">Obese (BMI ≥ 30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <YesNoButtons
                  label="Do you feel unable to control or stop your use?"
                  name="unableToControl"
                  qNum={12}
                />

                <YesNoButtons
                  label="Have you continued using despite knowing it causes problems?"
                  name="continuesDespiteHarm"
                  qNum={13}
                />

                <YesNoButtons
                  label="Do you require more of the substance to achieve the same effect?"
                  name="tolerance"
                  qNum={14}
                />
              </div>
            )}

            {/* EASY STEP 2: Lifestyle */}
            {isEasy && step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Lifestyle & Support</h2>

                <SliderQuestion
                  label="Craving intensity"
                  name="cravingIntensity"
                  min={1}
                  max={5}
                  lowLabel="Mild cravings"
                  highLabel="Extreme cravings"
                  qNum={15}
                />

                <SliderQuestion
                  label="Anxiety level"
                  name="anxietyLevel"
                  min={1}
                  max={5}
                  lowLabel="No anxiety"
                  highLabel="Severe anxiety"
                  qNum={16}
                />

                <SliderQuestion
                  label="Depression/mood symptoms"
                  name="depressionScreening"
                  min={1}
                  max={5}
                  lowLabel="None"
                  highLabel="Severe"
                  qNum={17}
                />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q18</span>
                    Previous quit attempts *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 3"
                    value={form.previousQuitAttempts}
                    onChange={handleInputChange("previousQuitAttempts")}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">How many times have you tried to quit?</p>
                </div>

                <YesNoButtons
                  label="Do you have any chronic health issues?"
                  name="chronicIllness"
                  qNum={19}
                />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q20</span>
                    Employment status
                  </Label>
                  <Select value={form.employmentStatus} onValueChange={(v) => updateForm("employmentStatus", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed (full-time)</SelectItem>
                      <SelectItem value="part-time">Part-time employment</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired/Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Feedback for Easy Mode */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    Quick Feedback (Optional)
                  </h3>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Was this assessment helpful?</p>
                    <div className="flex gap-2">
                      {[
                        { value: "yes", label: "Yes 😊" },
                        { value: "somewhat", label: "Somewhat 😐" },
                        { value: "no", label: "No 😕" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateForm("assessmentDifficulty", value)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                            form.assessmentDifficulty === value
                              ? "border-green-600 bg-green-100 text-green-900"
                              : "border-green-200 text-muted-foreground hover:border-green-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✓ Assessment complete! Click <strong>Submit</strong> to get your results.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* ─── ADVANCED MODE ─── */}

            {/* ADVANCED STEP 0: Type & Profile */}
            {!isEasy && step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Your Profile & Primary Substance</h2>

                <div>
                  <p className="text-sm font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q1</span>
                    Which substances are you currently using? (Select all that apply)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ADDICTION_TYPES.map(({ value, emoji, label, desc }) => (
                      <div
                        key={value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          form.addictionType.includes(value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => {
                          if (form.addictionType.includes(value)) {
                            updateForm("addictionType", form.addictionType.filter((t) => t !== value))
                          } else {
                            updateForm("addictionType", [...form.addictionType, value])
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={form.addictionType.includes(value)}
                            onChange={() => {}}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-2xl">{emoji}</span>
                            <div className="font-semibold text-sm mt-1">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.addictionType.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">✓ Selected: {form.addictionType.map(t => ADDICTION_TYPES.find(a => a.value === t)?.label).join(", ")}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q2</span>
                    Which is your PRIMARY/MAIN addiction? *
                  </Label>
                  <Select value={form.primarySubstance} onValueChange={(v) => updateForm("primarySubstance", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select primary substance..." />
                    </SelectTrigger>
                    <SelectContent>
                      {form.addictionType.map(value => {
                        const substance = ADDICTION_TYPES.find(a => a.value === value)
                        return (
                          <SelectItem key={value} value={value}>
                            {substance?.emoji} {substance?.label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q3</span>
                    Your current age *
                  </Label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="e.g. 28"
                    value={form.age}
                    onChange={handleInputChange("age")}
                    className="mt-2"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q4</span>
                    Gender
                  </p>
                  <div className="flex gap-3">
                    {[
                      ["male", "👨 Male"],
                      ["female", "👩 Female"],
                      ["other", "⚧ Other"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateForm("gender", value)}
                        className={`flex-1 py-2.5 rounded-lg font-medium text-sm border-2 transition-all ${
                          form.gender === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">
                      <span className="text-primary font-bold mr-2">Q5</span>
                      Height (cm) *
                    </Label>
                    <Input
                      type="number"
                      min="100"
                      max="250"
                      placeholder="e.g. 175"
                      value={form.height}
                      onChange={handleInputChange("height")}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., 170-180 cm</p>
                  </div>
                  <div>
                    <Label className="text-sm">
                      <span className="text-primary font-bold mr-2">Q6</span>
                      Weight (kg) *
                    </Label>
                    <Input
                      type="number"
                      min="30"
                      max="200"
                      step="0.5"
                      placeholder="e.g. 75"
                      value={form.weight}
                      onChange={handleInputChange("weight")}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., 60-90 kg</p>
                  </div>
                </div>

                {form.height && form.weight && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm">
                      <span className="font-semibold">Your BMI:</span> {(parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)} 
                      <span className="text-xs text-muted-foreground ml-2">
                        {(() => {
                          const bmi = parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)
                          if (bmi < 18.5) return "Underweight"
                          if (bmi < 25) return "Normal"
                          if (bmi < 30) return "Overweight"
                          return "Obese"
                        })()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ADVANCED STEP 1: Clinical Addiction Criteria */}
            {!isEasy && step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Addiction Severity (Clinical Assessment)</h2>
                <p className="text-xs text-muted-foreground mb-3">Based on DSM-5 Diagnostic Criteria</p>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q5</span>
                    Usage Frequency (Days per week) *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    step="0.5"
                    placeholder="0–7"
                    value={form.frequencyPerWeek}
                    onChange={handleInputChange("frequencyPerWeek")}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q6</span>
                    How long have you been using? (Years) *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    value={form.durationYears}
                    onChange={handleInputChange("durationYears")}
                    className="mt-2"
                  />
                </div>

                <SliderQuestion
                  label="Amount per session"
                  name="quantityLevel"
                  min={1}
                  max={5}
                  lowLabel="Very little"
                  highLabel="Excessive amounts"
                  qNum={7}
                />

                <SliderQuestion
                  label="How strong are your cravings?"
                  name="cravingIntensity"
                  min={1}
                  max={5}
                  lowLabel="Minimal/No cravings"
                  highLabel="Overwhelming cravings"
                  qNum={8}
                />

                <YesNoButtons
                  label="Do you experience withdrawal symptoms when you try to stop? (shaking, sweating, anxiety, pain)"
                  name="toleranceWithdrawal"
                  qNum={9}
                />

                <YesNoButtons
                  label="Can you control or cut down your use when you want to?"
                  name="unableToControl"
                  qNum={10}
                />

                <YesNoButtons
                  label="Do you continue using despite knowing it causes problems in your life?"
                  name="continuesDespiteHarm"
                  qNum={11}
                />
              </div>
            )}

            {/* ADVANCED STEP 2: Behavioral & Social Impact */}
            {!isEasy && step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Usage Impact on Life (DSM-5 Criteria)</h2>

                <YesNoButtons
                  label="Have you given up or reduced important activities (work, hobbies, social) because of use?"
                  name="neglectedActivities"
                  qNum={12}
                />

                <YesNoButtons
                  label="Do you use in situations where it's physically hazardous? (driving, operating machinery)"
                  name="riskySituations"
                  qNum={13}
                />

                <YesNoButtons
                  label="Have you developed tolerance? (Need to use more to get the same effect)"
                  name="tolerance"
                  qNum={14}
                />

                <SliderQuestion
                  label="How much time do you spend obtaining, using, or recovering from use?"
                  name="timeSpentObtaining"
                  min={1}
                  max={5}
                  lowLabel="Very little time"
                  highLabel="Most of my time"
                  qNum={15}
                />

                <p className="text-xs bg-blue-50 p-3 rounded-lg text-blue-900">
                  <strong>Note:</strong> 3+ criteria = Mild, 4-5 criteria = Moderate, 6+ criteria = Severe addiction disorder
                </p>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q16</span>
                    Your BMI category *
                  </Label>
                  <Select value={form.bmiCategory} onValueChange={(v) => updateForm("bmiCategory", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="underweight">Underweight (BMI &lt; 18.5)</SelectItem>
                      <SelectItem value="normal">Normal (BMI 18.5–24.9)</SelectItem>
                      <SelectItem value="overweight">Overweight (BMI 25–29.9)</SelectItem>
                      <SelectItem value="obese">Obese (BMI ≥ 30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ADVANCED STEP 3: Physical & Mental Health */}
            {!isEasy && step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Physical & Mental Health</h2>

                <SliderQuestion
                  label="How is your overall physical health?"
                  name="physicalHealthRating"
                  min={1}
                  max={5}
                  lowLabel="Very poor"
                  highLabel="Excellent"
                  qNum={17}
                />

                <YesNoButtons
                  label="Diagnosed with chronic illness? (diabetes, hypertension, liver disease, etc.)"
                  name="chronicIllness"
                  qNum={18}
                />

                <SliderQuestion
                  label="How stressed do you feel?"
                  name="mentalStress"
                  min={1}
                  max={5}
                  lowLabel="Very calm"
                  highLabel="Extremely stressed"
                  qNum={19}
                />

                <SliderQuestion
                  label="Average hours of sleep per night"
                  name="sleepHours"
                  min={0}
                  max={12}
                  step={0.5}
                  lowLabel="0 hrs"
                  highLabel="12 hrs"
                  qNum={20}
                />

                <SliderQuestion
                  label="How often do you experience anxiety?"
                  name="anxietyLevel"
                  min={1}
                  max={5}
                  lowLabel="Never"
                  highLabel="Always"
                  qNum={21}
                />

                <SliderQuestion
                  label="How often do you feel depressed?"
                  name="depressionScreening"
                  min={1}
                  max={5}
                  lowLabel="Never"
                  highLabel="Every day"
                  qNum={22}
                />
              </div>
            )}

            {/* ADVANCED STEP 4: Social & Background */}
            {!isEasy && step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Social & Background Factors</h2>

                <SliderQuestion
                  label="Social support system strength"
                  name="socialSupport"
                  min={1}
                  max={5}
                  lowLabel="Alone/No support"
                  highLabel="Strong support network"
                  qNum={23}
                />

                <YesNoButtons
                  label="Do close friends/family also use the same substance?"
                  name="peerInfluence"
                  qNum={24}
                />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q25</span>
                    Employment status *
                  </Label>
                  <Select value={form.employmentStatus} onValueChange={(v) => updateForm("employmentStatus", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed (full-time/part-time)</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <YesNoButtons
                  label="Family history of addiction or substance abuse?"
                  name="familyHistory"
                  qNum={26}
                />
              </div>
            )}

            {/* ADVANCED STEP 5: Review & Feedback */}
            {!isEasy && step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Review & Feedback</h2>
                  <p className="text-sm text-muted-foreground">Please review your answers and provide feedback on this assessment</p>
                </div>

                {/* Summary Card */}
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your answers will be securely saved and used to generate a personalized recovery plan.
                  </AlertDescription>
                </Alert>

                {/* Key Profile Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Your Assessment Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Substance(s)</p>
                      <p className="font-semibold capitalize">{form.addictionType.map(t => ADDICTION_TYPES.find(a => a.value === t)?.label).join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Primary Focus</p>
                      <p className="font-semibold capitalize">{ADDICTION_TYPES.find(a => a.value === form.primarySubstance)?.label}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Age</p>
                      <p className="font-semibold">{form.age} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Usage Frequency</p>
                      <p className="font-semibold">{form.frequencyPerWeek} days/week</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Duration</p>
                      <p className="font-semibold">{form.durationYears} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Craving Intensity</p>
                      <p className="font-semibold">{form.cravingIntensity}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Mental Stress</p>
                      <p className="font-semibold">{form.mentalStress}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Sleep</p>
                      <p className="font-semibold">{form.sleepHours}h/night</p>
                    </div>
                  </div>
                </div>

                {/* Health Insights */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-amber-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    DSM-5 Addiction Criteria Detected
                  </h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {form.toleranceWithdrawal && <li>✓ Withdrawal symptoms present</li>}
                    {form.unableToControl && <li>✓ Unable to control use</li>}
                    {form.continuesDespiteHarm && <li>✓ Continues despite harm</li>}
                    {form.neglectedActivities && <li>✓ Neglected important activities</li>}
                    {form.riskySituations && <li>✓ Risky/hazardous use situations</li>}
                    {form.tolerance && <li>✓ Increased tolerance</li>}
                    {form.chronicIllness && <li>✓ Chronic health conditions</li>}
                    {form.anxietyLevel >= 4 && <li>✓ High anxiety levels</li>}
                    {form.depressionScreening >= 4 && <li>✓ Depressive symptoms</li>}
                    {form.sleepHours < 6 && <li>✓ Insufficient sleep</li>}
                    {form.socialSupport < 3 && <li>✓ Limited support system</li>}
                    {form.peerInfluence && <li>✓ Peer influence present</li>}
                    {!form.toleranceWithdrawal && !form.unableToControl && !form.continuesDespiteHarm && !form.neglectedActivities && form.anxietyLevel < 4 && form.depressionScreening < 4 && form.sleepHours >= 6 && form.socialSupport >= 3 && !form.peerInfluence && (
                      <li>✓ No critical risk factors identified - Early intervention opportunity</li>
                    )}
                  </ul>
                </div>

                {/* Assessment Quality Feedback */}
                <div className="space-y-3 border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h3 className="font-semibold text-sm">How was this assessment?</h3>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Assessment difficulty level</p>
                    <div className="flex gap-2">
                      {[
                        { value: "easy", label: "Too Easy", icon: "😌" },
                        { value: "appropriate", label: "Just Right", icon: "👍" },
                        { value: "difficult", label: "Too Hard", icon: "😓" },
                      ].map(({ value, label, icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateForm("assessmentDifficulty", value)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                            form.assessmentDifficulty === value
                              ? "border-purple-600 bg-purple-100 text-purple-900"
                              : "border-purple-200 text-muted-foreground hover:border-purple-400"
                          }`}
                        >
                          <div className="text-lg">{icon}</div>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">How accurate do you feel this assessment is? (1=Not accurate, 5=Very accurate)</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateForm("accuracy", num)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                            form.accuracy === num
                              ? "border-pink-600 bg-pink-100 text-pink-900"
                              : "border-pink-200 text-muted-foreground hover:border-pink-400"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback Text Box */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Optional Feedback (Help us improve)
                  </Label>
                  <Textarea
                    placeholder="Share your thoughts... Any questions you found confusing? Suggestions for improvement? (Optional)"
                    value={form.feedback}
                    onChange={(e) => updateForm("feedback", e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Your feedback is valuable and helps us improve the assessment for everyone.</p>
                </div>

                {/* Next Steps */}
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Next:</strong> Click Submit to complete the assessment. You'll get a detailed recovery plan and personalized recommendations.
                  </AlertDescription>
                </Alert>
              </div>
            )}


            {/* Navigation */}
<div className="flex justify-between mt-8 pt-6 border-t border-border gap-3">
  <Button
    variant="outline"
    onClick={() => setStep((s) => s - 1)}
    disabled={step === 0}
  >
    <ChevronLeft className="w-4 h-4 mr-2" />
    Back
  </Button>

  <div className="flex gap-3">
    <Button
      variant="ghost"
      onClick={() => {
        setMode(null)
        setStep(0)
      }}
    >
      Change Mode
    </Button>

    <Button
      onClick={() => {
        if (step >= maxSteps - 1) {
          handleSubmit()
        } else {
          setStep((s) => s + 1)
        }
      }}
      disabled={loading}
    >
      {step >= maxSteps - 1 ? "🔬 Submit Assessment" : "Continue"}
      {step < maxSteps - 1 && (
        <ChevronRight className="w-4 h-4 ml-2" />
      )}
    </Button>
  </div>
</div>

  )
}
