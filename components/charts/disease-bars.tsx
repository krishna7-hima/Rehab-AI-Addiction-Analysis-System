"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { DiseaseRisk } from "@/lib/types"

interface DiseaseBarsProps {
  data: DiseaseRisk
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-4))",
]

export function DiseaseBars({ data }: DiseaseBarsProps) {
  const chartData = [
    { disease: "Stroke", probability: Math.round(data.stroke * 100) },
    { disease: "Cancer", probability: Math.round(data.cancer * 100) },
    { disease: "Heart Disease", probability: Math.round(data.heartDisease * 100) },
    { disease: "Diabetes", probability: Math.round(data.diabetes * 100) },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          dataKey="disease"
          type="category"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          formatter={(value: number) => [`${value}%`, "Probability"]}
        />
        <Bar dataKey="probability" radius={[0, 6, 6, 0]} barSize={28}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
