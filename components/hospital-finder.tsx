"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  MapPin,
  MapPinned,
  Navigation,
  Phone,
  Search,
  Star,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { store } from "@/lib/store"
import {
  REHAB_CENTRES,
  TIME_SLOTS,
  filterCentres,
  generateReferenceNumber,
} from "@/lib/rehab-data"
import type { AddictionType, Booking, RehabCentre } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  rehab: "Rehabilitation",
  clinic: "Clinic",
}

interface HospitalFinderProps {
  addictionType: AddictionType
}

export function HospitalFinder({ addictionType }: HospitalFinderProps) {
  const [searchCity, setSearchCity] = useState("")
  const [userLat, setUserLat] = useState<number | undefined>()
  const [userLng, setUserLng] = useState<number | undefined>()
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedCentre, setSelectedCentre] = useState<RehabCentre | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null)

  useEffect(() => {
    setBookings(store.getBookings())
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      setLocationStatus("denied")
      return
    }
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocationStatus("granted")
        toast.success("Location detected! Showing nearest centres.")
      },
      () => {
        setLocationStatus("denied")
        toast.error("Location access denied. You can search by city instead.")
      },
      { timeout: 10000 }
    )
  }, [])

  const filteredCentres = filterCentres(REHAB_CENTRES, {
    addictionType,
    city: searchCity || undefined,
    userLat,
    userLng,
  })

  function handleBookSlot() {
    if (!selectedCentre || !bookingDate || !bookingTime || !patientName || !patientPhone) {
      toast.error("Please fill in all booking details")
      return
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      hospitalId: selectedCentre.id,
      hospitalName: selectedCentre.name,
      date: bookingDate,
      timeSlot: bookingTime,
      patientName,
      patientPhone,
      status: "confirmed",
      referenceNumber: generateReferenceNumber(),
      createdAt: new Date().toISOString(),
    }

    store.addBooking(booking)
    setBookings([...bookings, booking])
    setBookingSuccess(booking)
    toast.success(`Booking confirmed! Ref: ${booking.referenceNumber}`)
  }

  function handleCancelBooking(id: string) {
    store.cancelBooking(id)
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)))
    toast.success("Booking cancelled")
  }

  function resetBookingForm() {
    setSelectedCentre(null)
    setBookingDate("")
    setBookingTime("")
    setPatientName("")
    setPatientPhone("")
    setBookingSuccess(null)
    setBookingOpen(false)
  }

  // Get min date for booking (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const activeBookings = bookings.filter((b) => b.status !== "cancelled")

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">
              Find Help Near You
            </CardTitle>
            <CardDescription>
              Hospitals, rehabilitation centres, and clinics specializing in your recovery
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="find" className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="find" className="flex-1 gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Find Centres
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              My Bookings
              {activeBookings.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {activeBookings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="flex flex-col gap-6">
            {/* Search Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  Search by City or Name
                </Label>
                <Input
                  placeholder="e.g. New York, Los Angeles, Serenity..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
              <Button
                variant={locationStatus === "granted" ? "secondary" : "outline"}
                className="gap-2 shrink-0"
                onClick={requestLocation}
                disabled={locationStatus === "loading"}
              >
                <Navigation className="h-4 w-4" />
                {locationStatus === "loading"
                  ? "Detecting..."
                  : locationStatus === "granted"
                  ? "Location Active"
                  : "Use My Location"}
              </Button>
            </div>

            {locationStatus === "denied" && (
              <p className="text-xs text-muted-foreground">
                Location access was denied. Search by city name above to find nearby centres.
              </p>
            )}

            {/* Results */}
            <div className="flex flex-col gap-4">
              {filteredCentres.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-12 text-center">
                  <MapPinned className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No centres found. Try a different search or clear filters.
                  </p>
                </div>
              ) : (
                filteredCentres.map((centre) => (
                  <Card key={centre.id} className="overflow-hidden border-border transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Info */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">
                                  {centre.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {TYPE_LABELS[centre.type]}
                                </Badge>
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {centre.address}, {centre.city}, {centre.state}
                              </p>
                            </div>
                            {"distance" in centre && centre.distance !== undefined && (
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                {centre.distance} km
                              </Badge>
                            )}
                          </div>

                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {centre.description}
                          </p>

                          {/* Rating & Specialties */}
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                              <span className="text-sm font-medium text-foreground">{centre.rating}</span>
                              <span className="text-xs text-muted-foreground">({centre.reviewCount})</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex flex-wrap gap-1.5">
                              {centre.specialties.map((s) => (
                                <Badge
                                  key={s}
                                  variant={s === addictionType ? "default" : "secondary"}
                                  className="text-xs capitalize"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {centre.amenities.slice(0, 4).map((a) => (
                              <span
                                key={a}
                                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                              >
                                {a}
                              </span>
                            ))}
                            {centre.amenities.length > 4 && (
                              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                                +{centre.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Column */}
                        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border bg-muted/30 p-5 lg:w-52 lg:border-l lg:border-t-0">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Available Slots</p>
                            <p className="text-2xl font-bold text-foreground">{centre.availableSlots}</p>
                          </div>

                          <Dialog
                            open={bookingOpen && selectedCentre?.id === centre.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setSelectedCentre(centre)
                                setBookingSuccess(null)
                              }
                              setBookingOpen(open)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Book a Slot
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              {bookingSuccess ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
                                    <Check className="h-8 w-8 text-chart-2" />
                                  </div>
                                  <DialogHeader className="text-center">
                                    <DialogTitle className="font-serif">
                                      Booking Confirmed!
                                    </DialogTitle>
                                    <DialogDescription>
                                      Your appointment has been scheduled
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Card className="w-full">
                                    <CardContent className="flex flex-col gap-3 p-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Reference</span>
                                        <div className="flex items-center gap-2">
                                          <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-bold text-foreground">
                                            {bookingSuccess.referenceNumber}
                                          </code>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => {
                                              navigator.clipboard.writeText(bookingSuccess!.referenceNumber)
                                              toast.success("Reference copied!")
                                            }}
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Centre</span>
                                        <span className="font-medium text-foreground">{bookingSuccess.hospitalName}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium text-foreground">
                                          {new Date(bookingSuccess.date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Time</span>
                                        <span className="font-medium text-foreground">{bookingSuccess.timeSlot}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Button onClick={resetBookingForm} className="w-full">
                                    Done
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <DialogHeader>
                                    <DialogTitle className="font-serif">
                                      Book Appointment
                                    </DialogTitle>
                                    <DialogDescription>
                                      {centre.name} - {centre.city}, {centre.state}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex flex-col gap-4 pt-2">
                                    <div className="flex flex-col gap-2">
                                      <Label htmlFor="bk-name">Patient Name</Label>
                                      <Input
                                        id="bk-name"
                                        placeholder="Your full name"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <Label htmlFor="bk-phone">Phone Number</Label>
                                      <Input
                                        id="bk-phone"
                                        type="tel"
                                        placeholder="+1 (xxx) xxx-xxxx"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <Label htmlFor="bk-date">Preferred Date</Label>
                                      <Input
                                        id="bk-date"
                                        type="date"
                                        min={minDate}
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <Label>Preferred Time</Label>
                                      <Select value={bookingTime} onValueChange={setBookingTime}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a time slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {TIME_SLOTS.map((slot) => (
                                            <SelectItem key={slot} value={slot}>
                                              {slot}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button onClick={handleBookSlot} className="mt-2 w-full gap-2">
                                      <Check className="h-4 w-4" />
                                      Confirm Booking
                                    </Button>
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>

                          <a href={`tel:${centre.phone}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              Call Now
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="flex flex-col gap-4">
            {bookings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No bookings yet. Find a centre and book your first appointment.
                </p>
              </div>
            ) : (
              [...bookings]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((booking) => (
                  <Card key={booking.id} className={booking.status === "cancelled" ? "opacity-60" : ""}>
                    <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">{booking.hospitalName}</h4>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                            className="text-xs capitalize"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.timeSlot}
                          </span>
                        </div>
                        <code className="mt-0.5 text-xs font-mono text-muted-foreground">
                          Ref: {booking.referenceNumber}
                        </code>
                      </div>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive self-start"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
