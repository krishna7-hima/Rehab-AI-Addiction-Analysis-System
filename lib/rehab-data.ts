import type { RehabCentre, AddictionType } from "./types"

// Haversine distance calculation in km
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export function filterCentres(
  centres: RehabCentre[],
  options: {
    addictionType?: AddictionType
    city?: string
    userLat?: number
    userLng?: number
    maxDistanceKm?: number
  }
): (RehabCentre & { distance?: number })[] {
  let results = [...centres] as (RehabCentre & { distance?: number })[]

  if (options.addictionType) {
    results = results.filter((c) =>
      c.specialties.includes(options.addictionType!)
    )
  }

  if (options.city) {
    const q = options.city.toLowerCase()
    results = results.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    )
  }

  if (options.userLat !== undefined && options.userLng !== undefined) {
    results = results.map((c) => ({
      ...c,
      distance: calculateDistance(
        options.userLat!,
        options.userLng!,
        c.lat,
        c.lng
      ),
    }))

    if (options.maxDistanceKm) {
      results = results.filter(
        (c) => (c.distance ?? Infinity) <= options.maxDistanceKm!
      )
    }

    results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
  }

  return results
}

export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let ref = "RCA-"
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
]

// ─── Curated Rehab Centre Data ───

export const REHAB_CENTRES: RehabCentre[] = [
  {
    id: "rc-001",
    name: "Serenity Recovery Hospital",
    address: "1450 Recovery Drive, Suite 200",
    city: "New York",
    state: "NY",
    phone: "+1 (212) 555-0142",
    specialties: ["alcohol", "drugs"],
    rating: 4.8,
    reviewCount: 342,
    availableSlots: 8,
    lat: 40.7128,
    lng: -74.006,
    type: "hospital",
    description: "Premier addiction treatment center offering evidence-based therapies including CBT, DBT, and medication-assisted treatment.",
    amenities: ["24/7 Medical Staff", "Private Rooms", "Group Therapy", "Family Counseling", "Fitness Center"],
  },
  {
    id: "rc-002",
    name: "New Dawn Rehabilitation Centre",
    address: "825 Wellness Boulevard",
    city: "Los Angeles",
    state: "CA",
    phone: "+1 (310) 555-0198",
    specialties: ["alcohol", "drugs", "smoking"],
    rating: 4.7,
    reviewCount: 287,
    availableSlots: 5,
    lat: 34.0522,
    lng: -118.2437,
    type: "rehab",
    description: "Holistic recovery center combining traditional medicine with mindfulness practices and nutritional therapy.",
    amenities: ["Meditation Garden", "Yoga Studio", "Nutritionist", "Art Therapy", "Pool"],
  },
  {
    id: "rc-003",
    name: "Clarity Mind Clinic",
    address: "3200 Brain Health Way",
    city: "Chicago",
    state: "IL",
    phone: "+1 (312) 555-0276",
    specialties: ["drugs", "alcohol"],
    rating: 4.6,
    reviewCount: 198,
    availableSlots: 12,
    lat: 41.8781,
    lng: -87.6298,
    type: "clinic",
    description: "Specialized outpatient clinic focusing on substance abuse disorders with cutting-edge neurofeedback treatment.",
    amenities: ["Neurofeedback Lab", "Outpatient Programs", "Telehealth", "Support Groups", "Psychiatric Care"],
  },
  {
    id: "rc-004",
    name: "Breathe Free Lung & Recovery Center",
    address: "770 Pulmonary Park Road",
    city: "Houston",
    state: "TX",
    phone: "+1 (713) 555-0384",
    specialties: ["smoking", "drugs"],
    rating: 4.9,
    reviewCount: 156,
    availableSlots: 6,
    lat: 29.7604,
    lng: -95.3698,
    type: "clinic",
    description: "Dedicated smoking cessation and respiratory recovery center with pulmonary rehabilitation programs.",
    amenities: ["Pulmonary Rehab", "NRT Programs", "Breathing Therapy", "Support Groups", "Wellness Coaching"],
  },
  {
    id: "rc-005",
    name: "Harmony Life Hospital",
    address: "1600 Balance Street",
    city: "Phoenix",
    state: "AZ",
    phone: "+1 (602) 555-0419",
    specialties: ["food", "alcohol", "drugs"],
    rating: 4.5,
    reviewCount: 231,
    availableSlots: 10,
    lat: 33.4484,
    lng: -112.074,
    type: "hospital",
    description: "Comprehensive behavioral health hospital with specialized programs for eating disorders and dual-diagnosis treatment.",
    amenities: ["Eating Disorder Unit", "Dual Diagnosis", "Dietitian", "CBT Programs", "Family Therapy"],
  },
  {
    id: "rc-006",
    name: "Pacific Coast Recovery",
    address: "2800 Ocean View Drive",
    city: "San Francisco",
    state: "CA",
    phone: "+1 (415) 555-0523",
    specialties: ["alcohol", "drugs", "smoking"],
    rating: 4.8,
    reviewCount: 412,
    availableSlots: 3,
    lat: 37.7749,
    lng: -122.4194,
    type: "rehab",
    description: "Luxury residential treatment with panoramic ocean views, integrating trauma-informed care with adventure therapy.",
    amenities: ["Ocean Views", "Adventure Therapy", "Gourmet Nutrition", "Equine Therapy", "Alumni Network"],
  },
  {
    id: "rc-007",
    name: "Heartland Recovery Institute",
    address: "450 Prairie Health Lane",
    city: "Dallas",
    state: "TX",
    phone: "+1 (214) 555-0637",
    specialties: ["alcohol", "drugs", "food"],
    rating: 4.4,
    reviewCount: 175,
    availableSlots: 15,
    lat: 32.7767,
    lng: -96.797,
    type: "rehab",
    description: "Family-centered rehabilitation offering intensive outpatient and residential programs with faith-based options.",
    amenities: ["IOP Programs", "Residential Care", "Chapel", "Family Weekends", "Aftercare Planning"],
  },
  {
    id: "rc-008",
    name: "Metro Wellness & Addiction Clinic",
    address: "99 Health Hub Avenue",
    city: "Miami",
    state: "FL",
    phone: "+1 (305) 555-0741",
    specialties: ["alcohol", "smoking", "drugs", "food"],
    rating: 4.6,
    reviewCount: 298,
    availableSlots: 9,
    lat: 25.7617,
    lng: -80.1918,
    type: "clinic",
    description: "Full-spectrum addiction clinic offering MAT, behavioral therapy, and specialized programs for all addiction types.",
    amenities: ["MAT Programs", "Behavioral Therapy", "Nutrition Counseling", "Telehealth", "Peer Support"],
  },
  {
    id: "rc-009",
    name: "Mountain View Rehab & Healing",
    address: "5500 Summit Recovery Trail",
    city: "Denver",
    state: "CO",
    phone: "+1 (720) 555-0855",
    specialties: ["alcohol", "drugs"],
    rating: 4.7,
    reviewCount: 189,
    availableSlots: 7,
    lat: 39.7392,
    lng: -104.9903,
    type: "rehab",
    description: "Nature-immersive rehabilitation center utilizing wilderness therapy and experiential learning for lasting recovery.",
    amenities: ["Wilderness Therapy", "Hiking Programs", "Meditation Retreats", "Detox Unit", "Life Skills Training"],
  },
  {
    id: "rc-010",
    name: "Balanced Body Clinic",
    address: "180 Nutrition & Recovery Way",
    city: "Seattle",
    state: "WA",
    phone: "+1 (206) 555-0968",
    specialties: ["food", "alcohol"],
    rating: 4.9,
    reviewCount: 134,
    availableSlots: 4,
    lat: 47.6062,
    lng: -122.3321,
    type: "clinic",
    description: "Specialized clinic for eating disorders and food addiction with registered dietitians and behavioral health experts.",
    amenities: ["Dietitian Team", "Meal Planning", "Body Image Therapy", "Cooking Classes", "Mindful Eating Program"],
  },
  {
    id: "rc-011",
    name: "Boston Behavioral Health Center",
    address: "320 Commonwealth Recovery Ave",
    city: "Boston",
    state: "MA",
    phone: "+1 (617) 555-1042",
    specialties: ["drugs", "alcohol", "smoking"],
    rating: 4.5,
    reviewCount: 267,
    availableSlots: 11,
    lat: 42.3601,
    lng: -71.0589,
    type: "hospital",
    description: "Academic medical center affiliated treatment program with research-backed protocols and clinical trials access.",
    amenities: ["Research Programs", "Clinical Trials", "Psychiatric Unit", "Outpatient Programs", "Student Support"],
  },
  {
    id: "rc-012",
    name: "Sunrise Recovery Village",
    address: "8900 Hope Springs Road",
    city: "Atlanta",
    state: "GA",
    phone: "+1 (404) 555-1156",
    specialties: ["alcohol", "drugs", "smoking", "food"],
    rating: 4.3,
    reviewCount: 210,
    availableSlots: 20,
    lat: 33.749,
    lng: -84.388,
    type: "rehab",
    description: "Large-scale recovery campus with multiple treatment tracks, offering affordable care and sliding-scale payment options.",
    amenities: ["Sliding Scale Payment", "Multiple Tracks", "Recreation Center", "Vocational Training", "Sober Living"],
  },
]
