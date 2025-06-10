"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function BuyerProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has buyer role
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token")
        const userRole = localStorage.getItem("userRole")

        console.log("BuyerProtectedRoute - Checking authentication")
        console.log("BuyerProtectedRoute - Token exists:", !!token)
        console.log("BuyerProtectedRoute - User role:", userRole)

        if (!token) {
          console.log("BuyerProtectedRoute - No token found, redirecting to login")
          router.push("/buyer/login")
          return false
        }

        if (userRole !== "buyer") {
          console.log(`BuyerProtectedRoute - User role is ${userRole}, not buyer, redirecting`)
          router.push("/select-role")
          return false
        }

        return true
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push("/buyer/login")
        return false
      }
    }

    const isAuth = checkAuth()
    setIsAuthorized(isAuth)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
