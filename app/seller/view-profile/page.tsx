"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSellerProfile } from "@/services/api"
import { Pencil, HandshakeIcon, History, Settings, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import SellerProtectedRoute from "@/components/seller/protected-route"

interface SellerProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  title?: string
  companyName?: string
  website?: string
  location?: string
}

export default function ViewProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return

    const fetchProfile = async () => {
      try {
        setLoading(true)

        // Check if token exists
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("View Profile - No authentication token found, redirecting to login")
          router.push("/seller/login?error=no_token")
          return
        }

        console.log("View Profile - Attempting to fetch profile")
        const data = await getSellerProfile()
        console.log("Profile data:", data)
        setProfile(data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError(err.message || "Failed to load profile")
        toast({
          title: "Error",
          description: err.message || "Failed to load profile",
          variant: "destructive",
        })

        // If authentication error, redirect to login
        if (
          err.message === "Authentication expired" ||
          err.message === "No authentication token found" ||
          err.message === "Failed to fetch profile: 403"
        ) {
          console.log("View Profile - Authentication error, redirecting to login")
          router.push("/seller/login?error=auth_failed")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/seller/login")
  }

  return (
    <SellerProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="mb-8">
            <Link href="/seller/dashboard">
              <Image src="/logo.svg" alt="CIM Amplify Logo" width={150} height={50} className="h-auto" />
            </Link>
          </div>

          <nav className="flex-1 space-y-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal"
              onClick={() => router.push("/seller/dashboard")}
            >
              <HandshakeIcon className="h-5 w-5" />
              <span>My Deals</span>
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start gap-3 font-normal bg-teal-100 text-teal-700 hover:bg-teal-200"
            >
              <Pencil className="h-5 w-5" />
              <span>View Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal"
              onClick={() => router.push("/seller/history")}
            >
              <History className="h-5 w-5" />
              <span>History</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal"
              onClick={() => router.push("/seller/settings")}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
             <Button
            variant="ghost"
            className="w-full justify-start gap-3 font-normal text-red-600 hover:text-red-700 hover:bg-red-50 mt-auto"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
          </nav>

         
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h1 className="text-4xl font-semibold text-gray-800">Profile</h1>

            <div className="flex items-center gap-6">
              

              <div className="flex items-center gap-3">
                {loading ? (
                  <>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="font-medium">{profile?.fullName || "User"}</div>
                      <div className="text-sm text-gray-500">{profile?.location || "Location"}</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                      {profile?.fullName ? profile.fullName.charAt(0) : "U"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Profile content */}
          <div className="p-8">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-6">
                  <Skeleton className="h-40 w-40 rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <div className="text-red-500 text-lg mb-2">Error loading profile</div>
                  <p className="text-gray-600">{error}</p>
                  <Button className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {/* Profile header */}
                <div className="p-6 flex gap-6">
                  <div className="h-40 w-40 rounded-lg bg-gray-200 overflow-hidden">
                    <Image
                      src="/dp.jpg"
                      alt={profile?.fullName || "Profile"}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold">{profile?.fullName || "User"}</h2>
                      <button className="text-gray-400 hover:text-gray-600">
                        {/* <Pencil className="h-4 w-4" /> */}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-teal-600">{profile?.title || "CEO"}</div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {/* <Pencil className="h-4 w-4" /> */}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-600">
                          <span className="inline-block w-5">📧</span> {profile?.email || "Email not provided"}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {/* <Pencil className="h-4 w-4" /> */}
                        </button>
                      </div>

                      {/* <div className="flex items-center gap-2">
                        <div className="text-gray-600">
                          <span className="inline-block w-5">📞</span> {profile?.phone || "Phone not provided"}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Company information */}
                <div className="border-t border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Company Information</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Company Name:</div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{profile?.companyName || "Not provided"}</div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1"></div>
                     {/* <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {profile?.website ? (
                            <a
                              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>  */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </SellerProtectedRoute>
  )
}
