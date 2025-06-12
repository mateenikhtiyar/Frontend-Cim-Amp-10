"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { sellerRegister } from "@/services/api"

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
}

export default function SellerRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<RegisterFormData & { general: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check for token and userId in URL parameters
  useEffect(() => {
    const urlToken = searchParams?.get("token")
    const urlUserId = searchParams?.get("userId") || searchParams?.get("userid") || searchParams?.get("id")

    if (urlToken) {
      const cleanToken = urlToken.trim()
      localStorage.setItem("token", cleanToken)
      localStorage.setItem("userRole", "seller")
      console.log("Register page - Token set from URL:", cleanToken.substring(0, 10) + "...")
    }

    if (urlUserId) {
      const cleanUserId = urlUserId.trim()
      localStorage.setItem("userId", cleanUserId)
      console.log("Register page - User ID set from URL:", cleanUserId)
    }

    // If token is provided, redirect to dashboard
    if (urlToken) {
      console.log("Register page - Redirecting to dashboard with token from URL")
      localStorage.setItem("userRole", "seller")
      router.push("/seller/dashboard")
      return
    }

    // Check if already logged in
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      console.log("Register page - Token found in localStorage, redirecting to dashboard")
      router.push("/seller/dashboard")
    }
  }, [searchParams, router])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors: Partial<RegisterFormData & { general: string }> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle traditional registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Register page - Submitting registration")

      // Use the API service
      const data = await sellerRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
      })

      // Set user role
      localStorage.setItem("userRole", "seller")

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      })

      // Redirect to dashboard page
      setTimeout(() => {
        router.push("/seller/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Registration error:", error)
      setErrors({ general: error.message || "Registration failed. Please try again." })
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    console.log("Register page - Redirecting to Google OAuth")
    window.location.href = "https://api.cimamplify.com/sellers/google/callback"
  }

  return (
    <div className="">
      <div className="flex h-screen bg-gradient-to-b from-[#C3C6BE] to-[#828673] overflow-hidden">
        {/* Left side with illustration */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center relative">
          <Image
            src="/sellerbg.svg"
            alt="Financial illustration with handshake and growth chart"
            width={500}
            height={500}
            priority
            className="z-10 bg-cover bg-center w-full h-full object-cover"
          />
        </div>

        {/* Right side - Registration form */}
        <div className="w-full md:w-2/3 bg-white rounded-l-[30px] flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-3">
            <h1 className="text-3xl font-bold mb-8 text-center">Create an Account</h1>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {/* Google signup button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md p-3 mb-6 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Create account with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=""
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder=""
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder=""
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=""
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-4 flex items-center focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder=""
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-4 flex items-center focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/seller/login" className="text-sm text-gray-600 hover:underline">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
