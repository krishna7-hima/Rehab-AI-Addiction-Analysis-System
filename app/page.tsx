"use client"

import Link from "next/link"
import { GuestButton } from "@/components/guest-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  FileText,
  Heart,
  Shield,
  Stethoscope,
} from "lucide-react"

const features = [
  {
    icon: Stethoscope,
    title: "Severity Assessment",
    description:
      "Advanced weighted scoring algorithm analyzes addiction patterns to classify severity from Low to Critical.",
  },
  {
    icon: Brain,
    title: "Organ Risk Prediction",
    description:
      "Hybrid rule-based analysis predicts risk percentages for liver, lungs, heart, and brain.",
  },
  {
    icon: BarChart3,
    title: "Disease Probability",
    description:
      "Logistic-model analysis calculates probability scores for stroke, cancer, heart disease, and diabetes.",
  },
  {
    icon: Heart,
    title: "Recovery Planning",
    description:
      "Personalized multi-week recovery plans with structured goals, activities, and progress milestones.",
  },
  {
    icon: Calendar,
    title: "Daily Tracking",
    description:
      "Log daily habits and receive real-time recovery scores, improvement percentages, and relapse risk indicators.",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description:
      "Generate comprehensive downloadable reports summarizing severity, risks, and recommendations.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground font-serif">
              RecoverAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Evidence-Based Recovery Analysis
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground font-serif md:text-5xl lg:text-6xl">
            Rehab AI : Addiction Analysis System
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Comprehensive severity assessment, organ risk prediction, disease
            probability analysis, and personalized recovery planning -- all
            powered by advanced algorithms.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
            <GuestButton />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">
              Complete Recovery Toolkit
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need for evidence-based addiction analysis and
              recovery tracking.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="border-border bg-card transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">
            Begin Your Recovery Journey
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Take the first step towards understanding your addiction severity
            and building a personalized plan for recovery.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8 gap-2 px-8">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground lg:px-8">
          <p>
            RecoverAI - AI Addiction Severity Analysis & Smart Recovery System.
            This tool is for educational purposes and does not replace
            professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
