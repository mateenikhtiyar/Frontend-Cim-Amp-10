"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, userRole, isLoading } = useAuth()

  useEffect(() => {
    // Wait until auth state is loaded
    if (isLoading) return

    // If user is already logged in, redirect based on role
    if (isLoggedIn && userRole) {
      console.log("Home page - User is logged in with role:", userRole)

      switch (userRole) {
        case "buyer":
          router.push("/buyer/deals")
          break
        case "seller":
          router.push("/seller/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        default:
          // If role is unknown but user is logged in, redirect to select-role
          router.push("/select-role")
      }
    } else {
      // If not logged in, redirect to select-role page
      console.log("Home page - User is not logged in, redirecting to select-role")
      router.push("/select-role")
    }
  }, [isLoggedIn, userRole, router, isLoading])

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-[#3aafa9] border-r-[#3aafa9] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[#344054]">Loading...</p>
      </div>
    </div>
  )
}
