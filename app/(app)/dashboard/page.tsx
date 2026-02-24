"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ClipboardList,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { store } from "@/lib/store"
import { calculateWeeklyImprovement, calculateRelapseRisk } from "@/lib/ml-engine"
import { SeverityGauge } from "@/components/charts/severity-gauge"
import { OrganRadar } from "@/components/charts/organ-radar"
import { DiseaseBars } from "@/components/charts/disease-bars"
import { RecoveryProgress } from "@/components/charts/recovery-progress"
import type { AssessmentResult, DailyLog } from "@/lib/types"

export default function DashboardPage() {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAssessment(store.getLatestAssessment())
    setLogs(store.getDailyLogs())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const user = store.getUser()
  const weeklyImprovement = calculateWeeklyImprovement(logs)
  const relapseRisk = calculateRelapseRisk(logs)

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground font-serif">
          Welcome, {user?.name || "there"}
        </h2>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Start by completing an addiction severity assessment to receive
          personalized insights and a recovery plan.
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Last assessment:{" "}
            {new Date(assessment.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href="/assessment">
          <Button variant="outline" size="sm" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <p className="text-lg font-bold text-foreground">
                {assessment.severityScore}/100
              </p>
              <Badge
                variant={
                  assessment.severityLevel === "Low"
                    ? "secondary"
                    : assessment.severityLevel === "Moderate"
                    ? "outline"
                    : "destructive"
                }
                className="mt-1"
              >
                {assessment.severityLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recovery Est.</p>
              <p className="text-lg font-bold text-foreground">
                {assessment.recoveryWeeks} weeks
              </p>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(assessment.recoveryWeeks / 4.3)} months
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
              {weeklyImprovement >= 0 ? (
                <TrendingUp className="h-5 w-5 text-chart-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Change</p>
              <p className="text-lg font-bold text-foreground">
                {weeklyImprovement >= 0 ? "+" : ""}
                {weeklyImprovement}%
              </p>
              <p className="text-xs text-muted-foreground">
                {logs.length} days tracked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relapse Risk</p>
              <p className="text-lg font-bold text-foreground">
                {relapseRisk}%
              </p>
              <p className="text-xs text-muted-foreground">
                {relapseRisk <= 30
                  ? "Low risk"
                  : relapseRisk <= 60
                  ? "Moderate risk"
                  : "High risk"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Severity Score</CardTitle>
            <CardDescription>
              Weighted severity analysis result
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <SeverityGauge
              score={assessment.severityScore}
              level={assessment.severityLevel}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organ Risk Analysis</CardTitle>
            <CardDescription>
              Predicted risk distribution across major organs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganRadar data={assessment.organRisk} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disease Probability</CardTitle>
            <CardDescription>
              Logistic-model disease risk predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DiseaseBars data={assessment.diseaseRisk} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recovery Progress</CardTitle>
            <CardDescription>
              Daily recovery scores and mood trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecoveryProgress logs={logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
