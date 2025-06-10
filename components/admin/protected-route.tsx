"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function AdminProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("userRole")

      if (!token) {
        router.push("/admin/login")
        return false
      }

      if (userRole !== "admin") {
        router.push("/access-denied")
        return false
      }

      return true
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-24 w-full" />
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
