import type { AssessmentResult, DailyLog, RecoveryPlan } from "./types"
import { calculateWeeklyImprovement, calculateRelapseRisk } from "./ml-engine"

const ADDICTION_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  smoking: "Smoking / Tobacco",
  drugs: "Drugs / Substances",
  food: "Food / Eating",
}

export function generatePDFContent(
  assessment: AssessmentResult,
  logs: DailyLog[],
  plan: RecoveryPlan | null,
  userName: string
): string {
  const weeklyImprovement = calculateWeeklyImprovement(logs)
  const relapseRisk = calculateRelapseRisk(logs)
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  @page { margin: 40px; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; margin: 0; padding: 40px; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
  .header h1 { color: #2563eb; font-size: 28px; margin: 0; }
  .header p { color: #6b7280; font-size: 14px; margin: 4px 0; }
  .section { margin-bottom: 28px; }
  .section h2 { color: #2563eb; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-box { background: #f0f4ff; border-radius: 8px; padding: 14px; }
  .stat-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-box .value { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-top: 2px; }
  .stat-box .sub { font-size: 12px; color: #6b7280; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { background: #f0f4ff; color: #2563eb; font-weight: 600; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge-low { background: #d1fae5 !important; color: #065f46 !important; }
  .badge-moderate { background: #fef3c7 !important; color: #92400e !important; }
  .badge-high { background: #fee2e2 !important; color: #991b1b !important; }
  .badge-critical { background: #fca5a5 !important; color: #7f1d1d !important; }
  .bar { height: 16px; border-radius: 8px; background: #e5e7eb; margin-top: 4px; }
  .bar-fill { height: 100%; border-radius: 8px; display: block; }
  .bar-fill-red { background: #ef4444 !important; }
  .bar-fill-orange { background: #f59e0b !important; }
  .bar-fill-green { background: #10b981 !important; }
  .bar-fill-blue { background: #2563eb !important; }
  .bar-fill-purple { background: #8b5cf6 !important; }
  .disclaimer { margin-top: 40px; padding: 16px; background: #fef3c7 !important; border-radius: 8px; font-size: 12px; color: #92400e; }
  .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="header">
    <h1>RecoverAI Assessment Report</h1>
    <p>Generated on ${date} for ${userName}</p>
    <p>AI Addiction Severity Analysis & Smart Recovery System</p>
  </div>

  <div class="section">
    <h2>User Summary</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Name</div>
        <div class="value" style="font-size: 16px;">${userName}</div>
      </div>
      <div class="stat-box">
        <div class="label">Age</div>
        <div class="value">${assessment.input.age}</div>
      </div>
      <div class="stat-box">
        <div class="label">Addiction Type</div>
        <div class="value" style="font-size: 16px;">${ADDICTION_LABELS[assessment.input.addictionType] || assessment.input.addictionType}</div>
      </div>
      <div class="stat-box">
        <div class="label">Duration</div>
        <div class="value">${assessment.input.durationYears} years</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Severity Analysis</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Severity Score</div>
        <div class="value">${assessment.severityScore}/100</div>
        <div class="sub">
          <span class="badge badge-${assessment.severityLevel.toLowerCase()}">${assessment.severityLevel}</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="label">Recovery Estimate</div>
        <div class="value">${assessment.recoveryWeeks} weeks</div>
        <div class="sub">~${Math.round(assessment.recoveryWeeks / 4.3)} months</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Organ Risk Assessment</h2>
    <table>
      <thead>
        <tr><th>Organ</th><th>Risk Level</th><th>Visual</th></tr>
      </thead>
      <tbody>
        ${Object.entries(assessment.organRisk)
          .map(
            ([organ, risk]) => `
        <tr>
          <td style="text-transform: capitalize; font-weight: 500;">${organ}</td>
          <td>${risk}%</td>
          <td>
            <div class="bar">
              <div class="bar-fill ${risk > 60 ? "bar-fill-red" : risk > 30 ? "bar-fill-orange" : "bar-fill-green"}" style="width: ${risk}%; background: ${risk > 60 ? "#ef4444" : risk > 30 ? "#f59e0b" : "#10b981"} !important;"></div>
            </div>
          </td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Disease Risk Predictions</h2>
    <table>
      <thead>
        <tr><th>Disease</th><th>Probability</th><th>Visual</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Stroke</td>
          <td>${Math.round(assessment.diseaseRisk.stroke * 100)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-blue" style="width: ${assessment.diseaseRisk.stroke * 100}%; background: #2563eb !important;"></div></div></td>
        </tr>
        <tr>
          <td>Cancer</td>
          <td>${Math.round(assessment.diseaseRisk.cancer * 100)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-red" style="width: ${assessment.diseaseRisk.cancer * 100}%; background: #ef4444 !important;"></div></div></td>
        </tr>
        <tr>
          <td>Heart Disease</td>
          <td>${Math.round(assessment.diseaseRisk.heartDisease * 100)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-purple" style="width: ${assessment.diseaseRisk.heartDisease * 100}%; background: #8b5cf6 !important;"></div></div></td>
        </tr>
        <tr>
          <td>Diabetes</td>
          <td>${Math.round(assessment.diseaseRisk.diabetes * 100)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-orange" style="width: ${assessment.diseaseRisk.diabetes * 100}%; background: #f59e0b !important;"></div></div></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Recovery Tracking Summary</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Days Tracked</div>
        <div class="value">${logs.length}</div>
      </div>
      <div class="stat-box">
        <div class="label">Weekly Improvement</div>
        <div class="value">${weeklyImprovement >= 0 ? "+" : ""}${weeklyImprovement}%</div>
      </div>
      <div class="stat-box">
        <div class="label">Relapse Risk</div>
        <div class="value">${relapseRisk}%</div>
        <div class="sub">${relapseRisk <= 30 ? "Low" : relapseRisk <= 60 ? "Moderate" : "High"} risk</div>
      </div>
      <div class="stat-box">
        <div class="label">Average Recovery Score</div>
        <div class="value">${logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.recoveryScore, 0) / logs.length) : "N/A"}</div>
      </div>
    </div>
  </div>

  ${
    plan
      ? `
  <div class="section">
    <h2>Recommendations</h2>
    ${
      plan.rehabRecommended
        ? '<p style="color: #991b1b; font-weight: 600;">Professional rehabilitation treatment is strongly recommended based on your severity level.</p>'
        : ""
    }
    <ul style="padding-left: 20px;">
      ${plan.weeks[0]?.goals.map((g) => `<li>${g}</li>`).join("") || ""}
      ${plan.weeks[0]?.tips.map((t) => `<li>${t}</li>`).join("") || ""}
    </ul>
  </div>`
      : ""
  }

  <div class="disclaimer">
    <strong>Important Disclaimer:</strong> This report is generated by an AI algorithm for educational and informational purposes only.
    It does not constitute medical diagnosis or treatment advice. Always consult with qualified healthcare professionals
    for medical decisions regarding addiction and recovery.
  </div>

  <div class="footer">
    <p>RecoverAI - AI Addiction Severity Analysis & Smart Recovery System</p>
    <p>Report ID: ${assessment.id} | Generated: ${date}</p>
  </div>
</body>
</html>
  `.trim()
}
