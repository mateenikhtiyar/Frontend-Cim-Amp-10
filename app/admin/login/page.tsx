"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // This is a simplified admin login for demonstration
      // In a real app, you would validate credentials against your backend
      console.log("Admin login attempt:", { email, password, rememberMe })

      // For demo purposes, we'll simulate a successful login
      // In production, replace with actual API call
      if (email && password) {
        // Store authentication data
        localStorage.setItem("token", "admin-demo-token")
        localStorage.setItem("userId", "admin-user-id")
        localStorage.setItem("userRole", "admin")

        // Show success message
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in as an admin.",
        })

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 1000)
      } else {
        throw new Error("Please enter both email and password")
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Failed to log in. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-600 to-blue-800 items-center justify-center">
        <div className="max-w-md text-center">
          <Image
            src="/images/cim-amplify-logo.png"
            alt="CIM Amplify Logo"
            width={200}
            height={80}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-white mb-6">Admin Portal</h1>
          <p className="text-white/80 text-lg mb-8">
            Manage your platform, users, and transactions from a centralized dashboard.
          </p>
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt="Admin Illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4 lg:hidden">
              <Image src="/images/cim-amplify-logo.png" alt="CIM Amplify Logo" width={150} height={60} />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/admin/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Need help? Contact{" "}
              <a href="mailto:support@cimamplify.com" className="text-blue-600 hover:text-blue-800">
                support@cimamplify.com
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
