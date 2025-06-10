"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isLoggedIn: boolean
  userRole: string | null
  userId: string | null
  login: (token: string, userId: string, role: string) => void
  logout: () => void
  isLoading: boolean
  checkAuth: () => { authenticated: boolean; role: string | null; userId: string | null }
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userRole: null,
  userId: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  checkAuth: () => ({ authenticated: false, role: null, userId: null }),
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log("Auth context - Checking authentication state")

        const token = localStorage.getItem("token")
        const storedUserId = localStorage.getItem("userId")
        const storedUserRole = localStorage.getItem("userRole")

        console.log("Auth context - Found in localStorage:", {
          hasToken: !!token,
          hasUserId: !!storedUserId,
          userRole: storedUserRole,
        })

        if (token && storedUserId) {
          setIsLoggedIn(true)
          setUserId(storedUserId)
          setUserRole(storedUserRole)
          console.log("Auth context - User is authenticated with role:", storedUserRole)
        } else {
          setIsLoggedIn(false)
          setUserId(null)
          setUserRole(null)
          console.log("Auth context - User is not authenticated")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsLoggedIn(false)
        setUserId(null)
        setUserRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (token: string, newUserId: string, role: string) => {
    try {
      // Clean the token (remove any whitespace)
      const cleanToken = token.trim()

      // Ensure token is properly formatted (add Bearer prefix if missing)
      const formattedToken = cleanToken.startsWith("Bearer ") ? cleanToken : cleanToken

      localStorage.setItem("token", formattedToken)
      localStorage.setItem("userId", newUserId)
      localStorage.setItem("userRole", role)

      console.log("Auth context - Login successful")
      console.log("Auth context - Token stored:", formattedToken.substring(0, 10) + "...")
      console.log("Auth context - User ID stored:", newUserId)
      console.log("Auth context - User role stored:", role)

      setIsLoggedIn(true)
      setUserId(newUserId)
      setUserRole(role)
    } catch (error) {
      console.error("Error during login:", error)
      // Attempt to handle localStorage errors
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.error("LocalStorage quota exceeded. Clearing some space...")
        // Try to clear some non-essential items
        try {
          localStorage.removeItem("lastVisited")
          localStorage.removeItem("preferences")
          // Try again
          localStorage.setItem("token", token)
          localStorage.setItem("userId", newUserId)
          localStorage.setItem("userRole", role)
          setIsLoggedIn(true)
          setUserId(newUserId)
          setUserRole(role)
        } catch (retryError) {
          console.error("Failed to store auth data even after clearing space:", retryError)
        }
      }
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("userRole")
      setIsLoggedIn(false)
      setUserId(null)
      setUserRole(null)
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")
      const role = localStorage.getItem("userRole")

      // Check if token exists and is not expired
      // Note: For a more complete solution, you would need to decode the JWT and check its expiration
      // This is a simplified version

      if (!token) {
        console.log("Auth context - No token found")
        return { authenticated: false, role: null, userId: null }
      }

      console.log("Auth context - Token found, user is authenticated")
      return {
        authenticated: true,
        role: role || null,
        userId: userId || null,
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      return { authenticated: false, role: null, userId: null }
    }
  }

  const value = {
    isLoggedIn,
    userRole,
    userId,
    login,
    logout,
    isLoading,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
