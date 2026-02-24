"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Apple,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Frown,
  GlassWater,
  Meh,
  Moon,
  Pill,
  Plus,
  Smile,
  Trash2,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { store } from "@/lib/store"
import {
  calculateDailyRecoveryScore,
  calculateWeeklyImprovement,
  calculateRelapseRisk,
} from "@/lib/ml-engine"
import type { DailyLog, Reminder, ReminderCategory } from "@/lib/types"

const MOOD_ICONS = [Frown, Frown, Meh, Smile, Smile]
const MOOD_LABELS = ["Very Low", "Low", "Neutral", "Good", "Great"]

const CATEGORY_ICONS: Record<ReminderCategory, typeof Bell> = {
  food: Apple,
  exercise: Dumbbell,
  medication: Pill,
  sleep: Moon,
  hydration: GlassWater,
  custom: Bell,
}

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  food: "Meal",
  exercise: "Exercise",
  medication: "Medication",
  sleep: "Sleep",
  hydration: "Hydration",
  custom: "Custom",
}

const CATEGORY_COLORS: Record<ReminderCategory, string> = {
  food: "bg-chart-4/10 text-chart-4",
  exercise: "bg-chart-2/10 text-chart-2",
  medication: "bg-chart-5/10 text-chart-5",
  sleep: "bg-primary/10 text-primary",
  hydration: "bg-chart-1/10 text-chart-1",
  custom: "bg-muted text-muted-foreground",
}

const DEFAULT_REMINDERS: Omit<Reminder, "id">[] = [
  { label: "Breakfast - Follow nutrition plan", time: "08:00", category: "food", enabled: true },
  { label: "Morning hydration - 2 glasses of water", time: "08:30", category: "hydration", enabled: true },
  { label: "Lunch - Recovery-friendly meal", time: "12:30", category: "food", enabled: true },
  { label: "Afternoon exercise session", time: "15:00", category: "exercise", enabled: true },
  { label: "Take prescribed medication", time: "16:00", category: "medication", enabled: true },
  { label: "Dinner - Follow nutrition plan", time: "19:00", category: "food", enabled: true },
  { label: "Evening hydration check", time: "20:00", category: "hydration", enabled: true },
  { label: "Wind down for sleep", time: "22:00", category: "sleep", enabled: true },
]

export default function TrackerPage() {
  const [consumed, setConsumed] = useState(false)
  const [sleepHours, setSleepHours] = useState(7)
  const [exerciseMinutes, setExerciseMinutes] = useState(15)
  const [moodScore, setMoodScore] = useState(3)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [mounted, setMounted] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default")
  const [addReminderOpen, setAddReminderOpen] = useState(false)
  const [newReminderLabel, setNewReminderLabel] = useState("")
  const [newReminderTime, setNewReminderTime] = useState("12:00")
  const [newReminderCategory, setNewReminderCategory] = useState<ReminderCategory>("custom")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const firedRef = useRef<Set<string>>(new Set())

  // Initialize
  useEffect(() => {
    setLogs(store.getDailyLogs())
    const saved = store.getReminders()
    if (saved.length === 0) {
      // Seed default reminders
      const defaults = DEFAULT_REMINDERS.map((r) => ({
        ...r,
        id: crypto.randomUUID(),
      }))
      store.setReminders(defaults)
      setReminders(defaults)
    } else {
      setReminders(saved)
    }
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission)
    }
    setMounted(true)
  }, [])

  // Notification checker
  const checkReminders = useCallback(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const todayKey = now.toISOString().split("T")[0]

    reminders.forEach((reminder) => {
      if (!reminder.enabled) return
      const firedKey = `${todayKey}-${reminder.id}`
      if (firedRef.current.has(firedKey)) return
      if (reminder.time === currentTime) {
        new Notification("RecoverAI Reminder", {
          body: reminder.label,
          icon: "/icon.svg",
          tag: reminder.id,
        })
        firedRef.current.add(firedKey)
      }
    })
  }, [reminders])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(checkReminders, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [checkReminders])

  async function requestNotifPermission() {
    if (typeof Notification === "undefined") {
      toast.error("Browser notifications are not supported")
      return
    }
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === "granted") {
      toast.success("Notifications enabled! You will receive reminders.")
    } else {
      toast.error("Notification permission denied")
    }
  }

  function handleToggleReminder(id: string) {
    store.toggleReminder(id)
    setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  function handleDeleteReminder(id: string) {
    store.removeReminder(id)
    setReminders(reminders.filter((r) => r.id !== id))
    toast.success("Reminder removed")
  }

  function handleAddReminder() {
    if (!newReminderLabel || !newReminderTime) {
      toast.error("Please fill in all fields")
      return
    }
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      label: newReminderLabel,
      time: newReminderTime,
      category: newReminderCategory,
      enabled: true,
    }
    store.addReminder(reminder)
    setReminders([...reminders, reminder])
    setNewReminderLabel("")
    setNewReminderTime("12:00")
    setNewReminderCategory("custom")
    setAddReminderOpen(false)
    toast.success("Reminder added")
  }

  if (!mounted) return null

  const weeklyImprovement = calculateWeeklyImprovement(logs)
  const relapseRisk = calculateRelapseRisk(logs)
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time))
  const now = new Date()
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const upcomingReminders = sortedReminders.filter((r) => r.enabled && r.time >= currentTimeStr)
  const pastReminders = sortedReminders.filter((r) => r.enabled && r.time < currentTimeStr)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const recoveryScore = calculateDailyRecoveryScore({
      consumed,
      sleepHours,
      exerciseMinutes,
      moodScore,
    })

    const log: DailyLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      consumed,
      sleepHours,
      exerciseMinutes,
      moodScore,
      recoveryScore,
    }

    setTimeout(() => {
      store.addDailyLog(log)
      setLogs([...logs, log])
      toast.success(`Logged! Recovery score: ${recoveryScore}/100`)
      setLoading(false)
      setConsumed(false)
      setSleepHours(7)
      setExerciseMinutes(15)
      setMoodScore(3)
    }, 400)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-serif">
            Daily Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Log your daily habits, manage reminders, and track recovery progress
          </p>
        </div>
      </div>

      {/* Today's Schedule - Reminders Timeline */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-serif">{"Today's Schedule"}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {upcomingReminders.length} upcoming
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {notifPermission !== "granted" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={requestNotifPermission}
                >
                  <Bell className="h-3.5 w-3.5" />
                  Enable Alerts
                </Button>
              )}
              {notifPermission === "granted" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Bell className="h-3 w-3" />
                  Alerts On
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReminders.filter((r) => r.enabled).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No active reminders. Add some below to stay on track.
            </p>
          ) : (
            <div className="relative flex flex-col gap-0">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />

              {/* Past reminders */}
              {pastReminders.map((reminder) => {
                const CatIcon = CATEGORY_ICONS[reminder.category]
                return (
                  <div key={reminder.id} className="relative flex items-center gap-4 py-2 opacity-50">
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${CATEGORY_COLORS[reminder.category]}`}>
                      <CatIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-foreground line-through">{reminder.label}</p>
                        <p className="text-xs text-muted-foreground">{reminder.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">Done</Badge>
                    </div>
                  </div>
                )
              })}

              {/* Now marker */}
              {pastReminders.length > 0 && upcomingReminders.length > 0 && (
                <div className="relative flex items-center gap-4 py-2">
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">Now - {currentTimeStr}</p>
                  </div>
                </div>
              )}

              {/* Upcoming reminders */}
              {upcomingReminders.map((reminder) => {
                const CatIcon = CATEGORY_ICONS[reminder.category]
                return (
                  <div key={reminder.id} className="relative flex items-center gap-4 py-2">
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${CATEGORY_COLORS[reminder.category]}`}>
                      <CatIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{reminder.label}</p>
                        <p className="text-xs text-muted-foreground">{reminder.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {CATEGORY_LABELS[reminder.category]}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{"Today's Log"}</CardTitle>
            <CardDescription>
              Record your daily habits for{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Consumed */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="consumed" className="font-medium">
                    Consumed Today?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Did you use the addictive substance today?
                  </p>
                </div>
                <Switch
                  id="consumed"
                  checked={consumed}
                  onCheckedChange={setConsumed}
                />
              </div>

              {/* Sleep */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  Sleep Hours: {sleepHours}
                </Label>
                <Slider
                  value={[sleepHours]}
                  onValueChange={([v]) => setSleepHours(v)}
                  min={0}
                  max={14}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0h</span>
                  <span>7-9h optimal</span>
                  <span>14h</span>
                </div>
              </div>

              {/* Exercise */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="exercise" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Exercise Minutes
                </Label>
                <Input
                  id="exercise"
                  type="number"
                  min={0}
                  max={300}
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                />
              </div>

              {/* Mood */}
              <div className="flex flex-col gap-3">
                <Label>Mood: {MOOD_LABELS[moodScore - 1]}</Label>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const Icon = MOOD_ICONS[score - 1]
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setMoodScore(score)}
                        className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                          moodScore === score
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{score}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging..." : "Submit Log"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats & Recent Logs */}
        <div className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Weekly Change</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {weeklyImprovement >= 0 ? "+" : ""}{weeklyImprovement}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">Relapse Risk</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{relapseRisk}%</p>
                <Badge
                  variant={
                    relapseRisk <= 30 ? "secondary" : relapseRisk <= 60 ? "outline" : "destructive"
                  }
                  className="mt-1"
                >
                  {relapseRisk <= 30 ? "Low" : relapseRisk <= 60 ? "Moderate" : "High"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Entries</CardTitle>
              <CardDescription>Last 7 daily logs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No entries yet. Start by logging today.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentLogs.map((log, i) => (
                    <div key={log.id}>
                      {i > 0 && <Separator className="mb-3" />}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              log.consumed ? "bg-destructive/10" : "bg-chart-2/10"
                            }`}
                          >
                            {log.consumed ? (
                              <Frown className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(log.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sleep: {log.sleepHours}h | Exercise: {log.exerciseMinutes}min | Mood: {log.moodScore}/5
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{log.recoveryScore}</p>
                          <p className="text-xs text-muted-foreground">score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-serif">Manage Reminders</CardTitle>
                <CardDescription>Customize your daily recovery reminders</CardDescription>
              </div>
            </div>
            <Dialog open={addReminderOpen} onOpenChange={setAddReminderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif">Add New Reminder</DialogTitle>
                  <DialogDescription>
                    Create a custom reminder for your recovery schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rem-label">Reminder Label</Label>
                    <Input
                      id="rem-label"
                      placeholder="e.g. Take vitamins, Call support person..."
                      value={newReminderLabel}
                      onChange={(e) => setNewReminderLabel(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rem-time">Time</Label>
                      <Input
                        id="rem-time"
                        type="time"
                        value={newReminderTime}
                        onChange={(e) => setNewReminderTime(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Category</Label>
                      <Select
                        value={newReminderCategory}
                        onValueChange={(v) => setNewReminderCategory(v as ReminderCategory)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CATEGORY_LABELS) as ReminderCategory[]).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddReminder} className="mt-2 w-full">
                    Add Reminder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {sortedReminders.map((reminder) => {
              const CatIcon = CATEGORY_ICONS[reminder.category]
              return (
                <div
                  key={reminder.id}
                  className={`flex items-center gap-3 rounded-lg border border-border p-3 transition-opacity ${
                    !reminder.enabled ? "opacity-50" : ""
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[reminder.category]}`}>
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{reminder.label}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {reminder.time}
                      <span className="capitalize">
                        {CATEGORY_LABELS[reminder.category]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleReminder(reminder.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                    >
                      {reminder.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
