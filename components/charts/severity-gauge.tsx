"use client"

import { useEffect, useState } from "react"
import type { SeverityLevel } from "@/lib/types"

interface SeverityGaugeProps {
  score: number
  level: SeverityLevel
  size?: number
}

const LEVEL_COLORS: Record<SeverityLevel, string> = {
  Low: "stroke-chart-2",
  Moderate: "stroke-chart-4",
  High: "stroke-chart-1",
  Critical: "stroke-destructive",
}

const LEVEL_TEXT_COLORS: Record<SeverityLevel, string> = {
  Low: "text-chart-2",
  Moderate: "text-chart-4",
  High: "text-chart-1",
  Critical: "text-destructive",
}

export function SeverityGauge({ score, level, size = 200 }: SeverityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="drop-shadow-sm"
        role="img"
        aria-label={`Severity score: ${score} out of 100, classified as ${level}`}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          className={LEVEL_COLORS[level]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="fill-foreground text-4xl font-bold"
          style={{ fontSize: "40px", fontWeight: 700 }}
        >
          {animatedScore}
        </text>
        <text
          x="100"
          y="120"
          textAnchor="middle"
          className="fill-muted-foreground text-sm"
          style={{ fontSize: "14px" }}
        >
          out of 100
        </text>
      </svg>
      <span
        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${LEVEL_TEXT_COLORS[level]} bg-secondary`}
      >
        {level} Severity
      </span>
    </div>
  )
}
