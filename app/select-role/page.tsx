"use client"
import Image from "next/image"
import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function SelectRolePage() {
  const router = useRouter()
  const { isLoggedIn, userRole, isLoading } = useAuth()

  // Handle redirection for already logged-in users
  useEffect(() => {
    if (!isLoading) {
      console.log("SelectRole - Auth state:", { isLoggedIn, userRole })

      // If user is already logged in, redirect to appropriate dashboard
      if (isLoggedIn && userRole) {
        switch (userRole) {
          case "buyer":
            console.log("SelectRole - User is already a buyer, redirecting to deals")
            router.push("/buyer/deals")
            break
          case "seller":
            console.log("SelectRole - User is already a seller, redirecting to dashboard")
            router.push("/seller/dashboard")
            break
          case "admin":
            console.log("SelectRole - User is an admin, redirecting to admin dashboard")
            router.push("/admin/dashboard")
            break
          default:
            // If role is unknown, stay on this page
            console.log("SelectRole - User has unknown role:", userRole)
        }
      }
    }
  }, [isLoggedIn, userRole, router, isLoading])

  // Handler for buyer profile button click
  const handleBuyerProfileClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (isLoggedIn && userRole === "buyer") {
      console.log("SelectRole - Buyer clicked profile button, redirecting to deals")
      router.push("/buyer/deals")
    } else {
      console.log("SelectRole - Non-buyer clicked profile button, redirecting to register")
      router.push("/buyer/register")
    }
  }

  // Handler for seller button click
  const handleSellerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (isLoggedIn && userRole === "seller") {
      console.log("SelectRole - Seller clicked button, redirecting to dashboard")
      router.push("/seller/dashboard")
    } else {
      console.log("SelectRole - Non-seller clicked button, redirecting to register")
      router.push("/seller/register")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#C6D6D6] items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="w-16 h-16 border-4 border-t-[#3aafa9] border-r-[#3aafa9] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#C6D6D6] overflow-hidden">
      {/* Left side with chart graphic */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative">
        <Image
          src="/Bg.svg"
          alt="Financial illustration with handshake and growth chart"
          width={500}
          height={500}
          priority
          className="z-10 bg-cover bg-center w-full h-full object-cover"
        />
      </div>

      {/* Right side with content */}
      <div className="w-full md:w-2/3 bg-white rounded-l-[40px] flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-8 items-center justify-center flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-black text-center leading-tight">
            Connect Buyers and Sellers in the Deal Marketplace
          </h1>

          <p className="text-[#667085] text-lg text-center md:text-center">
            Streamline your deal flow process with our platform. Connect with qualified buyers or find the perfect
            investment opportunity.
          </p>

          <div className="flex flex-col w-full max-w-md space-y- gap-4 pt-7">
            <a
              href="/seller/register"
              onClick={handleSellerClick}
              className="bg-[#3aafa9] hover:bg-white text-white hover:text-[#2a9d8f] hover:border-[#2a9d8f] border font-medium py-4 px-6 rounded-full text-center transition-colors"
            >
              Fill out a Seller profile
            </a>
            <a
              href="/buyer/register"
              onClick={handleBuyerProfileClick}
              className="border border-[#3aafa9] text-[#3aafa9] hover:text-white hover:bg-[#3aafa9] font-medium py-4 px-6 rounded-full text-center transition-colors"
            >
              Fill out a buyer profile
            </a>
            {/* <Link
              href="/admin/login"
              className="text-[#667085] hover:text-[#3aafa9] font-medium py-2 text-center transition-colors text-sm"
            >
              Admin Login
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  )
}
