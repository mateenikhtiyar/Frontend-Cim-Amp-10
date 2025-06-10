"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SellerProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return

    const checkAuthentication = () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem("token")
        const userRole = localStorage.getItem("userRole")

        console.log("SellerProtectedRoute - Checking authentication")
        console.log("SellerProtectedRoute - Token exists:", !!token)
        console.log("SellerProtectedRoute - User role:", userRole)

        if (!token) {
          console.log("SellerProtectedRoute - No token found, redirecting to login")
          router.push("/seller/login")
          return
        }

        // If userRole is set but not 'seller', redirect to appropriate page
        if (userRole && userRole !== "seller") {
          console.log(`SellerProtectedRoute - User role is ${userRole}, not seller, redirecting`)
          if (userRole === "buyer") {
            router.push("/buyer/dashboard")
          } else if (userRole === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/select-role")
          }
          return
        }

        // If we get here, user is authenticated as a seller
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error checking authentication:", error)
        // In case of error, redirect to login
        router.push("/seller/login")
      }
    }

    checkAuthentication()
  }, [router])

  // Initial server-side render - show minimal loading state
  if (typeof window === "undefined") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    )
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-500">Verifying authentication...</span>
      </div>
    )
  }

  // If authenticated, render children
  return <>{children}</>
}
