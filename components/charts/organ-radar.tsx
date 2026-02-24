"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { OrganRisk } from "@/lib/types"

interface OrganRadarProps {
  data: OrganRisk
}

export function OrganRadar({ data }: OrganRadarProps) {
  const chartData = [
    { organ: "Liver", risk: data.liver },
    { organ: "Lungs", risk: data.lungs },
    { organ: "Heart", risk: data.heart },
    { organ: "Brain", risk: data.brain },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="organ"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          formatter={(value: number) => [`${value}%`, "Risk Level"]}
        />
        <Radar
          name="Risk"
          dataKey="risk"
          stroke="hsl(var(--chart-1))"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
