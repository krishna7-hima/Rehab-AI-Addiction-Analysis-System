"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity } from "lucide-react"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [guestMode, setGuestMode] = useState(false)

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [guestData, setGuestData] = useState({
    name: "",
    age: "",
    gender: "male",
    weight: "",
    height: "",
  })

  // ✅ Auto open guest form if coming from home
  useEffect(() => {
    if (searchParams.get("guest") === "true") {
      setGuestMode(true)
    }
  }, [searchParams])

  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  function handleGuestChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setGuestData((prev) => ({ ...prev, [name]: value }))
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { email, password } = loginData

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)

    setTimeout(() => {
      const name = email.split("@")[0]

      store.login(email, name, 25, "male", 70, 170)

      toast.success("Welcome back!")
      router.push("/assessment")
      setLoading(false)
    }, 500)
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { name, age, gender, weight, height } = guestData

    if (!name.trim() || !age || !weight || !height) {
      toast.error("Please fill all guest details")
      return
    }

    const ageNum = Number(age)
    const weightNum = Number(weight)
    const heightNum = Number(height)

    if (ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
      toast.error("Please enter valid numeric values")
      return
    }

    store.guestLogin(
      name.trim(),
      ageNum,
      gender as "male" | "female" | "other",
      weightNum,
      heightNum
    )

    toast.success("Guest profile created successfully")
    router.push("/assessment")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif">
              RecoverAI
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">
              {guestMode ? "Guest Profile" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {guestMode
                ? "Enter your basic details to continue"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!guestMode ? (
              <>
                {/* LOGIN FORM */}
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Password</Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>

                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setGuestMode(true)}
                >
                  Continue as Guest
                </Button>
              </>
            ) : (
              <>
                {/* GUEST FORM */}
                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
                  <Input
                    name="name"
                    placeholder="Full Name"
                    value={guestData.name}
                    onChange={handleGuestChange}
                  />

                  <Input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={guestData.age}
                    onChange={handleGuestChange}
                  />

                  <select
                    name="gender"
                    value={guestData.gender}
                    onChange={handleGuestChange}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  <Input
                    name="weight"
                    type="number"
                    placeholder="Weight (kg)"
                    value={guestData.weight}
                    onChange={handleGuestChange}
                  />

                  <Input
                    name="height"
                    type="number"
                    placeholder="Height (cm)"
                    value={guestData.height}
                    onChange={handleGuestChange}
                  />

                  <Button type="submit">
                    Continue to Assessment
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setGuestMode(false)}
                  >
                    Back to Login
                  </Button>
                </form>
              </>
            )}

            {!guestMode && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Register
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}