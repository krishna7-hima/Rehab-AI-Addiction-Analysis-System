"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserX } from "lucide-react"

/**
 * Guest flow should collect basic profile details (name/age/gender/height/weight)
 * to run assessment and generate plans.
 * We route to /login?guest=true where the guest form already exists.
 */
export function GuestButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="lg"
      className="gap-2 px-8"
      onClick={() => {
        router.push("/login?guest=true")
      }}
    >
      <UserX className="h-4 w-4" />
      Try as Guest
    </Button>
  )
}
