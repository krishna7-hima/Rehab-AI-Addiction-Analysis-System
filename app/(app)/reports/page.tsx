"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Download, FileText, Printer } from "lucide-react"
import { toast } from "sonner"
import { store } from "@/lib/store"
import { generatePDFContent } from "@/lib/pdf-generator"
import type { AssessmentResult, DailyLog, RecoveryPlan } from "@/lib/types"

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking / Tobacco",
  drugs: "Drugs / Substances",
  food: "Food / Eating",
}

export default function ReportsPage() {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [plan, setPlan] = useState<RecoveryPlan | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAssessment(store.getLatestAssessment())
    setLogs(store.getDailyLogs())
    setPlan(store.getRecoveryPlan())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const user = store.getUser()

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground font-serif">
          No Report Available
        </h2>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Complete an assessment first to generate a downloadable report.
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

  function handleDownload() {
    if (!assessment) return

    const html = generatePDFContent(
      assessment,
      logs,
      plan,
      user?.name || "User"
    )

    // Open in new window for printing as PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
      toast.success("Report opened. Use Print > Save as PDF to download.")
    } else {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.")
    }
  }

  function handlePrint() {
    if (!assessment) return

    const html = generatePDFContent(
      assessment,
      logs,
      plan,
      user?.name || "User"
    )

    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
      iframe.onload = () => {
        iframe.contentWindow?.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }
    }
  }

  const allAssessments = store.getAssessments()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden sticky top-0 bg-background z-10 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              View and download your assessment reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Latest Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest Assessment Report</CardTitle>
          <CardDescription>
            {new Date(assessment.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Severity
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
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
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Type
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {ADDICTION_LABELS[assessment.input.addictionType]}
              </p>
              <p className="text-sm text-muted-foreground">
                {assessment.input.durationYears} years
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recovery Est.
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {assessment.recoveryWeeks}w
              </p>
              <p className="text-sm text-muted-foreground">
                ~{Math.round(assessment.recoveryWeeks / 4.3)} months
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Days Tracked
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {logs.length}
              </p>
              <p className="text-sm text-muted-foreground">daily entries</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Organ Risks Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Organ Risk Summary
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(assessment.organRisk).map(([organ, risk]) => (
                <div key={organ} className="flex items-center gap-4">
                  <span className="w-16 text-sm font-medium capitalize text-foreground">
                    {organ}
                  </span>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${risk}%`,
                          backgroundColor:
                            risk > 60
                              ? "hsl(var(--destructive))"
                              : risk > 30
                              ? "hsl(var(--chart-4))"
                              : "hsl(var(--chart-2))",
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {risk}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Disease Risks Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Disease Risk Summary
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Stroke", value: assessment.diseaseRisk.stroke },
                { label: "Cancer", value: assessment.diseaseRisk.cancer },
                {
                  label: "Heart Disease",
                  value: assessment.diseaseRisk.heartDisease,
                },
                { label: "Diabetes", value: assessment.diseaseRisk.diabetes },
              ].map((disease) => (
                <div key={disease.label} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium text-foreground">
                    {disease.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{
                          width: `${Math.round(disease.value * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {Math.round(disease.value * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      {allAssessments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment History</CardTitle>
            <CardDescription>
              All {allAssessments.length} assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {allAssessments
                .slice()
                .reverse()
                .map((a, i) => (
                  <div key={a.id}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {ADDICTION_LABELS[a.input.addictionType]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {a.input.durationYears}y | Frequency:{" "}
                          {a.input.frequencyPerWeek}x/week
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {a.severityScore}
                        </p>
                        <Badge
                          variant={
                            a.severityLevel === "Low"
                              ? "secondary"
                              : a.severityLevel === "Moderate"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {a.severityLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
