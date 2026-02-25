"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardList, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2, Zap, MessageSquare } from "lucide-react"
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
] as const

const STEPS = [
  "Type & Profile",
  "Usage Pattern",
  "Physical Health",
  "Mental & Emotional",
  "Social & Background",
  "Review & Feedback",
] as const

const DEFAULT_FORM = {
  addictionType: [] as string[],
  primarySubstance: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  frequencyPerWeek: "",
  durationYears: "",
  quantityLevel: 3,

  // DSM / Criteria
  toleranceWithdrawal: null as boolean | null,
  unableToControl: null as boolean | null,
  continuesDespiteHarm: null as boolean | null,
  neglectedActivities: null as boolean | null,
  riskySituations: null as boolean | null,
  tolerance: null as boolean | null,
  timeSpentObtaining: 3,

  // Health
  physicalHealthRating: 3,
  chronicIllness: null as boolean | null,
  bmiCategory: "",

  // Mental
  mentalStress: 3,
  sleepHours: 7,
  anxietyLevel: 3,
  depressionScreening: 3,
  cravingIntensity: 3,

  // Social
  socialSupport: 3,
  peerInfluence: null as boolean | null,
  employmentStatus: "",
  familyHistory: null as boolean | null,

  // Feedback
  feedback: "",
  assessmentDifficulty: "appropriate" as "easy" | "appropriate" | "difficult",
  accuracy: 5,
}

function ModeSelection({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary/5 via-background to-cyan-50/20 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Addiction Assessment</h1>
          <p className="text-muted-foreground mt-2">Comprehensive Assessment only</p>
        </div>

        <Card onClick={onStart} className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all border-primary/20">
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

        <p className="text-center text-xs text-muted-foreground mt-8">You can retake assessments anytime from your dashboard</p>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  const updateForm = (key: keyof typeof DEFAULT_FORM, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleInputChange =
    (key: keyof typeof DEFAULT_FORM) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateForm(key, e.target.value)
    }

  const answered = (v: any) => v !== null && v !== undefined && v !== ""
  const numOk = (v: any) => answered(v) && Number.isFinite(Number(v))

  // ✅ Simple, strict step validation (no hidden blocks)
  const canNext = () => {
    if (step === 0) {
      return (
        form.addictionType.length > 0 &&
        answered(form.primarySubstance) &&
        numOk(form.age) &&
        answered(form.gender) &&
        numOk(form.height) &&
        numOk(form.weight)
      )
    }
    if (step === 1) return numOk(form.frequencyPerWeek) && numOk(form.durationYears)
    if (step === 2) return answered(form.bmiCategory)
    if (step === 4) return answered(form.employmentStatus)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const primarySubstance = (form.primarySubstance || form.addictionType[0]) as AddictionType

      const input: AssessmentInput = {
        addictionType: primarySubstance,
        frequencyPerWeek: parseFloat(String(form.frequencyPerWeek || 0)),
        durationYears: parseFloat(String(form.durationYears || 0)),
        quantityLevel: parseInt(String(form.quantityLevel), 10),
        withdrawalSymptoms: !!form.toleranceWithdrawal,

        mentalStressLevel: parseInt(String(form.mentalStress), 10),
        sleepHours: parseFloat(String(form.sleepHours)),
        age: parseInt(String(form.age), 10),

        cravingLevel: parseInt(String(form.cravingIntensity), 10) || 3,
        moodSwings: form.continuesDespiteHarm ? 1 : 0,
        socialIsolation: form.peerInfluence ? 1 : 0,
        triggersControl: form.unableToControl ? 0 : 1,

        physicalActivityLevel: Number(form.physicalHealthRating),
        dietQuality: 3,
        failedQuitAttempts: 0,

        familyHistory: !!form.familyHistory,
        workImpact: form.employmentStatus === "unemployed" ? 1 : 0,
        relationshipImpact: form.neglectedActivities ? 1 : 0,
        financialImpact: form.chronicIllness ? 1 : 0,
        existingHealthIssues: !!form.chronicIllness,
        energyLevel: Number(form.physicalHealthRating),
      }

      const base = runAssessment(input)

      let extra = 0
      extra += Number(form.cravingIntensity) * 3
      extra += Number(form.anxietyLevel) * 2
      extra += Number(form.depressionScreening) * 2
      if (form.toleranceWithdrawal) extra += 30
      if (form.unableToControl) extra += 25
      if (form.continuesDespiteHarm) extra += 20
      if (form.neglectedActivities) extra += 15
      if (form.riskySituations) extra += 15
      if (form.tolerance) extra += 12
      if (form.chronicIllness) extra += 15
      if (Number(form.socialSupport) < 3) extra += 10
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
            mode: "advanced",
            substancesUsed: form.addictionType,
            bmiCategory: form.bmiCategory,
          }),
        })
      } catch {
        // ignore
      }

      store.addAssessment(adjustedResult)
      const plan = generateRecoveryPlan(adjustedResult.severityLevel, primarySubstance, adjustedResult.recoveryWeeks)
      store.setRecoveryPlan(plan)

      toast.success("Assessment complete! Viewing your results.")
      router.push("/dashboard")
    } catch {
      toast.error("Assessment failed. Please check your answers.")
    } finally {
      setLoading(false)
    }
  }

  const SliderQuestion = ({ label, name, min, max, step: st = 1, lowLabel, highLabel, qNum }: any) => {
    const currentValue = form[name as keyof typeof form] as number
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm">
            <span className="text-primary font-bold mr-2">Q{qNum}</span>
            {label}
          </Label>
          <span className="text-primary font-bold text-lg">{currentValue}</span>
        </div>
        <Slider value={[currentValue]} onValueChange={([v]) => updateForm(name, v)} min={min} max={max} step={st} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {min} — {lowLabel}
          </span>
          <span>
            {max} — {highLabel}
          </span>
        </div>
      </div>
    )
  }

  const YesNoButtons = ({ label, name, qNum }: any) => {
    const currentValue = form[name as keyof typeof form] as boolean | null
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
                currentValue === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {value ? "✅ Yes" : "❌ No"}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!started) return <ModeSelection onStart={() => setStarted(true)} />

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
          <p className="text-muted-foreground mt-1">Comprehensive assessment · 20+ questions · ~5-7 minutes</p>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Step {step + 1} of {maxSteps}: {STEPS[step]}
            </span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* STEP 0 */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Your Profile & Primary Substance</h2>

                <div>
                  <p className="text-sm font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q1</span>
                    Which substances are you currently using? (Select all that apply)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ADDICTION_TYPES.map(({ value, emoji, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (form.addictionType.includes(value)) {
                            updateForm(
                              "addictionType",
                              form.addictionType.filter((t) => t !== value)
                            )
                            if (form.primarySubstance === value) updateForm("primarySubstance", "")
                          } else {
                            updateForm("addictionType", [...form.addictionType, value])
                          }
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          form.addictionType.includes(value) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            <input type="checkbox" readOnly checked={form.addictionType.includes(value)} />
                          </div>
                          <div className="flex-1">
                            <span className="text-2xl">{emoji}</span>
                            <div className="font-semibold text-sm mt-1">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
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
                      {form.addictionType.map((value) => {
                        const substance = ADDICTION_TYPES.find((a) => a.value === value)
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
                  <Input type="number" value={form.age} onChange={handleInputChange("age")} className="mt-2" />
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
                          form.gender === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
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
                    <Input type="number" value={form.height} onChange={handleInputChange("height")} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm">
                      <span className="text-primary font-bold mr-2">Q6</span>
                      Weight (kg) *
                    </Label>
                    <Input type="number" value={form.weight} onChange={handleInputChange("weight")} className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Addiction Severity (Clinical Assessment)</h2>
                <p className="text-xs text-muted-foreground mb-3">Based on DSM-5 Diagnostic Criteria</p>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q7</span>
                    Usage Frequency (Days per week) *
                  </Label>
                  <Input type="number" min="0" max="7" step="0.5" value={form.frequencyPerWeek} onChange={handleInputChange("frequencyPerWeek")} className="mt-2" />
                </div>

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q8</span>
                    How long have you been using? (Years) *
                  </Label>
                  <Input type="number" min="0" max="60" step="0.5" value={form.durationYears} onChange={handleInputChange("durationYears")} className="mt-2" />
                </div>

                <SliderQuestion label="Amount per session" name="quantityLevel" min={1} max={5} lowLabel="Very little" highLabel="Excessive amounts" qNum={9} />
                <SliderQuestion label="How strong are your cravings?" name="cravingIntensity" min={1} max={5} lowLabel="Minimal/No cravings" highLabel="Overwhelming cravings" qNum={10} />

                <YesNoButtons label="Do you experience withdrawal symptoms when you try to stop?" name="toleranceWithdrawal" qNum={11} />
                <YesNoButtons label="Are you unable to control/cut down when you want to?" name="unableToControl" qNum={12} />
                <YesNoButtons label="Do you continue using despite knowing it causes problems?" name="continuesDespiteHarm" qNum={13} />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Physical Health</h2>

                <YesNoButtons label="Have you given up/reduced important activities because of use?" name="neglectedActivities" qNum={14} />
                <YesNoButtons label="Do you use in risky situations (driving/machinery)?" name="riskySituations" qNum={15} />
                <YesNoButtons label="Have you developed tolerance (need more to feel same)?" name="tolerance" qNum={16} />

                <SliderQuestion label="How much time do you spend obtaining/using/recovering?" name="timeSpentObtaining" min={1} max={5} lowLabel="Very little" highLabel="Most of my time" qNum={17} />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q18</span>
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

                <SliderQuestion label="Overall physical health" name="physicalHealthRating" min={1} max={5} lowLabel="Very poor" highLabel="Excellent" qNum={19} />
                <YesNoButtons label="Diagnosed with chronic illness?" name="chronicIllness" qNum={20} />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Mental & Emotional</h2>

                <SliderQuestion label="How stressed do you feel?" name="mentalStress" min={1} max={5} lowLabel="Very calm" highLabel="Extremely stressed" qNum={21} />
                <SliderQuestion label="Average hours of sleep per night" name="sleepHours" min={0} max={12} step={0.5} lowLabel="0 hrs" highLabel="12 hrs" qNum={22} />
                <SliderQuestion label="How often do you experience anxiety?" name="anxietyLevel" min={1} max={5} lowLabel="Never" highLabel="Always" qNum={23} />
                <SliderQuestion label="How often do you feel depressed?" name="depressionScreening" min={1} max={5} lowLabel="Never" highLabel="Every day" qNum={24} />
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Social & Background</h2>

                <SliderQuestion label="Social support system strength" name="socialSupport" min={1} max={5} lowLabel="Alone/No support" highLabel="Strong support network" qNum={25} />
                <YesNoButtons label="Do close friends/family also use the same substance?" name="peerInfluence" qNum={26} />

                <div>
                  <Label className="text-sm">
                    <span className="text-primary font-bold mr-2">Q27</span>
                    Employment status *
                  </Label>
                  <Select value={form.employmentStatus} onValueChange={(v) => updateForm("employmentStatus", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <YesNoButtons label="Family history of addiction/substance abuse?" name="familyHistory" qNum={28} />
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Review & Feedback</h2>
                  <p className="text-sm text-muted-foreground">Please review your answers and provide feedback</p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your answers will be saved and used to generate a personalized recovery plan.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Optional Feedback
                  </Label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={form.feedback}
                    onChange={(e) => updateForm("feedback", e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✓ Ready! Click <strong>Submit</strong> to generate your results.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border gap-3">
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < maxSteps - 1 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canNext()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "🔬 Submit Assessment"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-5">Your responses are private and used only for your personalized health report</p>
      </div>
    </div>
  )
}