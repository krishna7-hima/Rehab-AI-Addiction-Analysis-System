"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  Ban,
  CheckCircle2,
  Coffee,
  Droplets,
  GlassWater,
  Heart,
  Lightbulb,
  Moon,
  Sun,
  Sunset,
  Target,
  UtensilsCrossed,
} from "lucide-react"
import { store } from "@/lib/store"
import { HospitalFinder } from "@/components/hospital-finder"
import type { RecoveryPlan } from "@/lib/types"

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking",
  drugs: "Substance",
  food: "Food/Eating",
}

const MEAL_ICONS: Record<string, typeof Sun> = {
  breakfast: Sun,
  lunch: Sunset,
  dinner: Moon,
  snack: Coffee,
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

export default function RecoveryPage() {
  const [plan, setPlan] = useState<RecoveryPlan | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPlan(store.getRecoveryPlan())
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground font-serif">
          No Recovery Plan Yet
        </h2>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Complete an assessment first to receive a personalized recovery plan
          tailored to your needs.
        </p>
        <Link href="/assessment" className="mt-6">
          <Button size="lg" className="gap-2">
            Take Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              Recovery Plan
            </h1>
            <p className="text-sm text-muted-foreground">
              Personalized {plan.weeks.length}-week structured recovery for{" "}
              {ADDICTION_LABELS[plan.addictionType] || plan.addictionType}{" "}
              addiction
            </p>
          </div>
        </div>
        <Badge
          variant={plan.severity === "Low" || plan.severity === "Moderate" ? "secondary" : "destructive"}
          className="self-start"
        >
          {plan.severity} Severity
        </Badge>
      </div>

      {/* Rehab Alert */}
      {plan.rehabRecommended && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-4 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Professional Treatment Recommended
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Based on your severity level ({plan.severity}), we strongly
                recommend consulting with a healthcare professional or
                considering a rehabilitation program. Use the{" "}
                <span className="font-medium text-foreground">Find Help Near You</span>{" "}
                section below to locate and book a specialist.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Plans with Nutrition */}
      <Accordion type="single" collapsible className="flex flex-col gap-4" defaultValue="week-1">
        {plan.weeks.map((week) => {
          const phase = week.week <= Math.ceil(plan.weeks.length * 0.3)
            ? "Early Phase"
            : week.week <= Math.ceil(plan.weeks.length * 0.7)
            ? "Mid Phase"
            : "Late Phase"
          const nutrition = week.nutrition

          return (
            <AccordionItem key={week.week} value={`week-${week.week}`} className="border-0">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>div>.badge-phase]:bg-primary [&[data-state=open]>div>.badge-phase]:text-primary-foreground">
                  <div className="flex w-full items-center justify-between pr-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {week.week}
                      </div>
                      <span className="text-base font-semibold text-foreground">
                        Week {week.week}
                      </span>
                    </div>
                    <Badge variant="outline" className="badge-phase text-xs transition-colors">
                      {phase}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="flex flex-col gap-6">
                    {/* Goals */}
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Target className="h-4 w-4 text-primary" />
                        Goals
                      </div>
                      <ul className="flex flex-col gap-2 pl-6">
                        {week.goals.map((goal, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-2" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Activities */}
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Heart className="h-4 w-4 text-accent" />
                        Daily Activities
                      </div>
                      <ul className="flex flex-col gap-2 pl-6">
                        {week.activities.map((activity, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{activity}</li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Tips */}
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Lightbulb className="h-4 w-4 text-chart-4" />
                        Tips
                      </div>
                      <ul className="flex flex-col gap-2 pl-6">
                        {week.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Nutrition Plan */}
                    <div>
                      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                        <UtensilsCrossed className="h-4 w-4 text-chart-5" />
                        Nutrition Plan
                        <Badge variant="secondary" className="text-xs capitalize">
                          {nutrition.phase} recovery
                        </Badge>
                      </div>

                      {/* Meal Grid */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {nutrition.meals.map((meal) => {
                          const MealIcon = MEAL_ICONS[meal.mealTime] || Apple
                          return (
                            <div
                              key={meal.mealTime}
                              className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-4/10">
                                  <MealIcon className="h-3.5 w-3.5 text-chart-4" />
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  {MEAL_LABELS[meal.mealTime]}
                                </span>
                              </div>
                              <ul className="mb-2 flex flex-col gap-1">
                                {meal.foods.map((food, fi) => (
                                  <li key={fi} className="flex items-start gap-1.5 text-xs text-foreground">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                    {food}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-xs italic text-muted-foreground leading-relaxed">
                                {meal.benefits}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      {/* Hydration Tip */}
                      <div className="mt-4 flex items-start gap-3 rounded-lg bg-primary/5 p-4">
                        <Droplets className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Hydration Tip</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {nutrition.hydrationTip}
                          </p>
                        </div>
                      </div>

                      {/* Foods to Avoid */}
                      <div className="mt-3 flex items-start gap-3 rounded-lg bg-destructive/5 p-4">
                        <Ban className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Foods to Avoid</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {nutrition.avoidFoods.map((food, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                              >
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Hospital / Rehab Finder */}
      <section>
        <HospitalFinder addictionType={plan.addictionType} />
      </section>
    </div>
  )
}
