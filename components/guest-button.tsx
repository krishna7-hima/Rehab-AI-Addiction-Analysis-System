"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserX } from "lucide-react"
import { store } from "@/lib/store"
import { toast } from "sonner"

export function GuestButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="lg"
      className="gap-2 px-8"
      onClick={() => {
        store.guestLogin()
        toast.success("Welcome, Guest! Your data will be saved locally.")
        router.push("/dashboard")
      }}
    >
      <UserX className="h-4 w-4" />
      Try as Guest
    </Button>
  )
}
