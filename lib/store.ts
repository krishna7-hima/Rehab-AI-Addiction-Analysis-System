import type {
  AppState,
  UserProfile,
  AssessmentResult,
  DailyLog,
  RecoveryPlan,
  Reminder,
  Booking,
} from "./types"

const STORAGE_KEY = "addiction-recovery-app"

function defaultState(): AppState {
  return {
    user: null,
    assessments: [],
    dailyLogs: [],
    currentPlan: null,
    reminders: [],
    bookings: [],
  }
}

function getState(): AppState {
  if (typeof window === "undefined") return defaultState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)

      return {
        ...defaultState(),
        ...parsed,
      }
    }
  } catch {
    // ignore corrupted data
  }

  return defaultState()
}

function setState(state: AppState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const store = {
  getState,

  // ─────────────────────────────
  // AUTH
  // ─────────────────────────────

  login(
    email: string,
    name: string,
    age: number,
    gender: "male" | "female" | "other",
    weight: number,
    height: number
  ): UserProfile {
    const state = getState()

    const user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
      age,
      gender,
      weight,
      height,
      isGuest: false,
    }

    state.user = user
    setState(state)

    return user
  },

  register(
    email: string,
    name: string,
    _password: string,
    age: number,
    gender: "male" | "female" | "other",
    weight: number,
    height: number
  ): UserProfile {
    // Password ignored because local demo auth
    return this.login(email, name, age, gender, weight, height)
  },

  guestLogin(
    name: string = "Guest",
    age: number = 21,
    gender: "male" | "female" | "other" = "other",
    weight: number = 60,
    height: number = 165
  ): UserProfile {
    const state = getState()

    const user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email: "guest@recoverai.local",
      age,
      gender,
      weight,
      height,
      isGuest: true,
    }

    state.user = user
    setState(state)

    return user
  },

  upgradeGuest(
    email: string,
    name: string,
    _password: string,
    age: number,
    gender: "male" | "female" | "other",
    weight: number,
    height: number
  ): UserProfile {
    const state = getState()

    if (state.user) {
      state.user.name = name
      state.user.email = email
      state.user.age = age
      state.user.gender = gender
      state.user.weight = weight
      state.user.height = height
      state.user.isGuest = false

      setState(state)
      return state.user
    }

    return this.login(email, name, age, gender, weight, height)
  },

  logout() {
    const state = getState()
    state.user = null
    setState(state)
  },

  getUser(): UserProfile | null {
    return getState().user
  },

  // ─────────────────────────────
  // ASSESSMENTS
  // ─────────────────────────────

  addAssessment(result: AssessmentResult) {
    const state = getState()
    state.assessments.push(result)
    setState(state)
  },

  getAssessments(): AssessmentResult[] {
    return getState().assessments
  },

  getLatestAssessment(): AssessmentResult | null {
    const assessments = this.getAssessments()
    return assessments.length > 0
      ? assessments[assessments.length - 1]
      : null
  },

  // ─────────────────────────────
  // DAILY LOGS
  // ─────────────────────────────

  addDailyLog(log: DailyLog) {
    const state = getState()
    state.dailyLogs.push(log)
    setState(state)
  },

  getDailyLogs(): DailyLog[] {
    return getState().dailyLogs
  },

  // ─────────────────────────────
  // RECOVERY PLAN
  // ─────────────────────────────

  setRecoveryPlan(plan: RecoveryPlan) {
    const state = getState()
    state.currentPlan = plan
    setState(state)
  },

  getRecoveryPlan(): RecoveryPlan | null {
    return getState().currentPlan
  },

  // ─────────────────────────────
  // REMINDERS
  // ─────────────────────────────

  getReminders(): Reminder[] {
    return getState().reminders
  },

  addReminder(reminder: Reminder) {
    const state = getState()
    state.reminders.push(reminder)
    setState(state)
  },

  removeReminder(id: string) {
    const state = getState()
    state.reminders = state.reminders.filter((r) => r.id !== id)
    setState(state)
  },

  toggleReminder(id: string) {
    const state = getState()
    state.reminders = state.reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    )
    setState(state)
  },

  setReminders(reminders: Reminder[]) {
    const state = getState()
    state.reminders = reminders
    setState(state)
  },

  // ─────────────────────────────
  // BOOKINGS
  // ─────────────────────────────

  getBookings(): Booking[] {
    return getState().bookings
  },

  addBooking(booking: Booking) {
    const state = getState()
    state.bookings.push(booking)
    setState(state)
  },

  cancelBooking(id: string) {
    const state = getState()
    state.bookings = state.bookings.map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    )
    setState(state)
  },

  // ─────────────────────────────
  // CLEAR STORAGE
  // ─────────────────────────────

  clearAll() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
}