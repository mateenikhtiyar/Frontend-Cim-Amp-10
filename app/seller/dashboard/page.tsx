"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, Clock, LogOut, Search, Plus, Pencil, Check, X, Upload, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import SellerProtectedRoute from "@/components/seller/protected-route"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Updated interfaces to match API structure
interface SellerProfile {
  _id: string
  fullName: string
  email: string
  companyName: string
  role: string
  profilePicture: string | null
}

interface DealDocument {
  filename: string
  originalName: string
  path: string
  size: number
  mimetype: string
  uploadedAt: string
}

interface Deal {
  _id: string
  id?: string
  title: string
  companyDescription: string
  dealType: string
  status: string
  visibility?: string
  industrySector: string
  geographySelection: string
  yearsInBusiness: number
  employeeCount?: number
  financialDetails: {
    trailingRevenueCurrency?: string
    trailingRevenueAmount?: number
    trailingEBITDACurrency?: string
    trailingEBITDAAmount?: number
    avgRevenueGrowth?: number
    netIncome?: number
    askingPrice?: number
    finalSalePrice?: number
  }
  businessModel: {
    recurringRevenue?: boolean
    projectBased?: boolean
    assetLight?: boolean
    assetHeavy?: boolean
  }
  managementPreferences: {
    retiringDivesting?: boolean
    staffStay?: boolean
  }
  buyerFit: {
    capitalAvailability?: string
    minPriorAcquisitions?: number
    minTransactionSize?: number
  }
  targetedBuyers: string[]
  interestedBuyers: string[]
  tags: string[]
  isPublic: boolean
  isFeatured: boolean
  stakePercentage?: number
  documents: DealDocument[]
  timeline: {
    createdAt: string
    updatedAt: string
    publishedAt?: string
    completedAt?: string
  }
}

// Updated interface to match the actual API response structure
interface MatchedBuyer {
  _id: string // This is the company profile ID
  buyerId: string // This is the actual buyer ID we need to send
  buyerName: string
  buyerEmail: string
  companyName: string
  preferences: {
    stopSendingDeals: boolean
    dontShowMyDeals: boolean
    dontSendDealsToMyCompetitors: boolean
    allowBuyerLikeDeals: boolean
  }
  targetCriteria: {
    countries: string[]
    industrySectors: string[]
    revenueMin?: number
    revenueMax?: number
    ebitdaMin?: number
    ebitdaMax?: number
    transactionSizeMin?: number
    transactionSizeMax?: number
    revenueGrowth?: number
    minStakePercent?: number
    minYearsInBusiness?: number
    preferredBusinessModels: string[]
    managementTeamPreference: string[]
    description?: string
  }
  totalMatchScore: number
  matchPercentage: number
  matchDetails: {
    industryMatch: boolean
    geographyMatch: boolean
    revenueMatch: boolean
    ebitdaMatch: boolean
    transactionSizeMatch: boolean
    businessModelMatch: boolean
    managementMatch: boolean
    yearsMatch: boolean
  }
}

function DealCard({
  deal,
  onDocumentUpload,
  handleOffMarketClick,
  handleCompleteDealClick,
}: {
  deal: Deal
  onDocumentUpload: (dealId: string) => void
  handleOffMarketClick: (deal: Deal) => void
  handleCompleteDealClick: (deal: Deal) => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Helper functions
  const getBusinessModel = (model: Deal["businessModel"]): string => {
    const models = []
    if (model.recurringRevenue) models.push("Recurring Revenue")
    if (model.projectBased) models.push("Project-Based")
    if (model.assetLight) models.push("Asset Light")
    if (model.assetHeavy) models.push("Asset Heavy")
    return models.length > 0 ? models[0] : "Not specified"
  }

  const getManagementPreferences = (prefs: Deal["managementPreferences"]): string => {
    if (prefs.retiringDivesting && prefs.staffStay) return "Retiring to diversity"
    if (prefs.retiringDivesting) return "Owner(s) Departing"
    if (prefs.staffStay) return "Management Team Staying"
    return "Not specified"
  }

  const formatCurrency = (amount = 0, currency = "USD($)"): string => {
    const currencySymbol = currency.includes("USD")
      ? "$"
      : currency.includes("EUR")
        ? "€"
        : currency.includes("GBP")
          ? "£"
          : "$"
    return `${currencySymbol}${amount.toLocaleString()}`
  }

  const handleDocumentUploadInner = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()

    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      const response = await fetch(`${apiUrl}/deals/${deal._id}/upload-documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      toast({
        title: "Documents uploaded successfully",
        description: `Uploaded ${result.uploadedFiles} document(s)`,
      })

      // Trigger refresh
      onDocumentUpload(deal._id)
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadDocument = (doc: DealDocument) => {
    const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

    // Create a download link
    const link = document.createElement("a")
    link.href = `${apiUrl}/uploads/deal-documents/${doc.filename}`
    link.download = doc.originalName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-[#3aafa9]">Deal Details</h2>
      </div>

      {/* Overview Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium mb-3">Overview</h3>
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-gray-500">Deal Title: </span>
            <span>{deal.title}</span>
          </div>
          <div>
            <span className="text-gray-500">Company Description: </span>
            <span>{deal.companyDescription}</span>
          </div>
          <div>
            <span className="text-gray-500">Industry: </span>
            <span>{deal.industrySector}</span>
          </div>
          <div>
            <span className="text-gray-500">Geography: </span>
            <span>{deal.geographySelection}</span>
          </div>
          <div>
            <span className="text-gray-500">Number of Years in Business: </span>
            <span>{deal.yearsInBusiness}</span>
          </div>
          <div>
            <span className="text-gray-500">Status: </span>
            <span className="capitalize">{deal.status}</span>
          </div>
        </div>
      </div>

      {/* Financial Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium mb-3">Financial</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Trailing 12-Month Revenue: </span>
            <span>
              {formatCurrency(
                deal.financialDetails.trailingRevenueAmount,
                deal.financialDetails.trailingRevenueCurrency,
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Trailing 12-Month EBITDA: </span>
            <span>
              {formatCurrency(
                deal.financialDetails.trailingEBITDAAmount,
                deal.financialDetails.trailingRevenueCurrency,
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Average 3-YEAR REVENUE GROWTH IN %: </span>
            <span>{deal.financialDetails.avgRevenueGrowth || 0}%</span>
          </div>
          <div>
            <span className="text-gray-500">Net Income: </span>
            <span>
              {formatCurrency(deal.financialDetails.netIncome, deal.financialDetails.trailingRevenueCurrency)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Asking Price: </span>
            <span>
              {formatCurrency(deal.financialDetails.askingPrice, deal.financialDetails.trailingRevenueCurrency)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Business Model: </span>
            <span>{getBusinessModel(deal.businessModel)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Management Future Preferences: </span>
            <span>{getManagementPreferences(deal.managementPreferences)}</span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Documents</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3aafa9]"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={handleDocumentUploadInner}
          />
        </div>

        {deal.documents && deal.documents.length > 0 ? (
          <div className="space-y-2">
            {deal.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{doc.originalName}</span>
                  <span className="text-xs text-gray-400">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadDocument(doc)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#3aafa9] rounded-md p-3 text-center text-gray-500">
            No documents uploaded yet
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex p-4 gap-2">
        <Button variant="outline" className="flex-1 py-2 border border-gray-200 text-gray-500">
          Edit
        </Button>
        {deal.status === "active" && (
          <Button
            variant="outline"
            className="flex-1 py-2 bg-green-50 text-green-600 border border-green-200"
            onClick={() => handleCompleteDealClick(deal)}
          >
            Complete Deal
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 py-2 bg-red-50 text-red-500 border border-red-200"
          onClick={() => handleOffMarketClick(deal)}
        >
          Off Market
        </Button>
        <Button
          className="flex-1 py-2 bg-[#3aafa9] text-white"
          onClick={() => router.push(`/seller/deal?id=${deal._id}`)}
        >
          Activity
        </Button>
      </div>
    </div>
  )
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [recentlyCreatedDeal, setRecentlyCreatedDeal] = useState<Deal | null>(null)
  const [matchedBuyers, setMatchedBuyers] = useState<MatchedBuyer[]>([])
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([])
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const [profileName, setProfileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectAllDropdownOpen, setSelectAllDropdownOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loadingBuyers, setLoadingBuyers] = useState(false)
  const [sending, setSending] = useState(false)
  const [showBuyersForNewDeal, setShowBuyersForNewDeal] = useState(false)

  const [offMarketDialogOpen, setOffMarketDialogOpen] = useState(false)
  const [currentDialogStep, setCurrentDialogStep] = useState(1)
  const [selectedDealForOffMarket, setSelectedDealForOffMarket] = useState<Deal | null>(null)
  const [offMarketData, setOffMarketData] = useState({
    dealSold: null as boolean | null,
    transactionValue: "",
    buyerFromCIM: null as boolean | null,
  })

  const [completeDealDialogOpen, setCompleteDealDialogOpen] = useState(false)
  const [selectedDealForCompletion, setSelectedDealForCompletion] = useState<Deal | null>(null)
  const [completionData, setCompletionData] = useState({
    finalSalePrice: "",
  })

  // Add this state near the other state declarations
  const [buyerActivity, setBuyerActivity] = useState<any[]>([])
  const [selectedWinningBuyer, setSelectedWinningBuyer] = useState<string>("")
  const [buyerActivityLoading, setBuyerActivityLoading] = useState(false)

  const searchParams = useSearchParams()
  const { logout } = useAuth()

  // Fetch seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

        const response = await fetch(`${apiUrl}/sellers/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSellerProfile(data)
          setUserProfile({
            fullName: data.fullName,
            location: data.companyName,
            phone: data.email,
            profilePicture: data.profilePicture,
          })
          setProfileName(data.fullName)
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error)
      }
    }
    fetchSellerProfile()
  }, [])

  // Check for newly created deal
  useEffect(() => {
    const newDealId = searchParams?.get("newDeal")
    const dealSuccess = searchParams?.get("success")

    console.log("🔍 Checking for new deal:", { newDealId, dealSuccess, dealsLength: deals.length })

    if (newDealId && dealSuccess === "true") {
      // Find the deal in our deals list
      const foundDeal = deals.find((deal) => deal._id === newDealId)
      console.log("🎯 Found deal for new deal ID:", foundDeal ? "Yes" : "No", foundDeal?._id)

      if (foundDeal) {
        setRecentlyCreatedDeal(foundDeal)
        setShowBuyersForNewDeal(true)
        console.log("✅ Set recently created deal from URL:", foundDeal._id)
      }
    } else if (deals.length > 0) {
      // Check if we have a very recently created deal (within last 2 minutes)
      const mostRecentDeal = deals[0] // Deals are sorted by creation date
      const dealAge = new Date().getTime() - new Date(mostRecentDeal.timeline.createdAt).getTime()
      const twoMinutesInMs = 2 * 60 * 1000

      // Check if we've already shown buyers for this deal
      const shownBuyersKey = `buyers_shown_${mostRecentDeal._id}`
      const hasShownBuyers = localStorage.getItem(shownBuyersKey)

      console.log("🕒 Deal age check:", {
        dealId: mostRecentDeal._id,
        dealAge: Math.round(dealAge / 1000) + " seconds",
        isRecent: dealAge < twoMinutesInMs,
        hasShownBuyers: !!hasShownBuyers,
      })

      if (dealAge < twoMinutesInMs && !hasShownBuyers) {
        setRecentlyCreatedDeal(mostRecentDeal)
        setShowBuyersForNewDeal(true)
        // Mark that we've shown buyers for this deal
        localStorage.setItem(shownBuyersKey, "true")
        console.log("✅ Set recently created deal from timing:", mostRecentDeal._id)
      }
    }
  }, [searchParams, deals])

  // Debug logging for buyer display conditions
  useEffect(() => {
    console.log("🐛 Buyer Display Debug:", {
      recentlyCreatedDeal: !!recentlyCreatedDeal,
      recentlyCreatedDealId: recentlyCreatedDeal?._id,
      showBuyersForNewDeal,
      matchedBuyersLength: matchedBuyers.length,
      shouldShowBuyers: showBuyersForNewDeal && matchedBuyers.length > 0,
      searchParams: {
        newDeal: searchParams?.get("newDeal"),
        success: searchParams?.get("success"),
      },
    })
  }, [recentlyCreatedDeal, showBuyersForNewDeal, matchedBuyers.length, searchParams])

  // Fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

        if (!token) {
          router.push("/seller/login?error=no_token")
          return
        }

        const response = await fetch(`${apiUrl}/deals/my-deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          // Sort deals by creation date (most recent first)
          const sortedDeals = data
            .map((deal: any) => ({ ...deal, id: deal._id }))
            .sort((a, b) => new Date(b.timeline.createdAt).getTime() - new Date(a.timeline.createdAt).getTime())
          setDeals(sortedDeals)
        } else {
          setDeals([])
        }

        setError(null)
      } catch (err: any) {
        console.error("Error fetching deals:", err)
        setError(err.message || "Failed to load deals")
        setDeals([])
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [router, refreshTrigger])

  // Fetch matching buyers for deals
  useEffect(() => {
    if (deals.length > 0) {
      const fetchMatchingBuyers = async () => {
        try {
          setLoadingBuyers(true)
          const token = localStorage.getItem("token")
          const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

          console.log(
            "🔍 Fetching matching buyers for deals:",
            deals.map((d) => d._id),
          )

          const buyerPromises = deals.map(async (deal) => {
            try {
              console.log(`📞 Fetching buyers for deal: ${deal._id}`)
              const response = await fetch(`${apiUrl}/deals/${deal._id}/matching-buyers`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              })

              if (response.ok) {
                const buyers = await response.json()
                console.log(`✅ Raw buyers response for deal ${deal._id}:`, buyers)

                // Process each buyer to ensure we have the correct structure
                return buyers.map((buyer: any) => {
                  console.log("🔍 Processing individual buyer:", {
                    _id: buyer._id,
                    buyerId: buyer.buyerId,
                    buyerName: buyer.buyerName,
                    companyName: buyer.companyName,
                  })

                  // Validate that we have the buyer ID
                  if (!buyer.buyerId) {
                    console.error("❌ Missing buyerId in buyer data:", buyer)
                  }

                  return {
                    ...buyer,
                    // The API already provides buyerName and buyerEmail directly
                  }
                })
              } else {
                console.error(`❌ Failed to fetch buyers for deal ${deal._id}:`, response.status, response.statusText)
              }
              return []
            } catch (error) {
              console.error(`❌ Error fetching buyers for deal ${deal._id}:`, error)
              return []
            }
          })

          const results = await Promise.all(buyerPromises)
          const allBuyers = results.flat()

          // Remove duplicates based on _id
          const uniqueBuyers = allBuyers.filter(
            (buyer, index, self) => index === self.findIndex((b) => b._id === buyer._id),
          )

          console.log(
            "✅ Final processed matched buyers:",
            uniqueBuyers.map((b) => ({
              _id: b._id,
              buyerId: b.buyerId,
              companyName: b.companyName,
            })),
          )

          setMatchedBuyers(uniqueBuyers)
        } catch (error) {
          console.error("❌ Error fetching matching buyers:", error)
          toast({
            title: "Error loading buyers",
            description: "Failed to load matching buyers. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingBuyers(false)
        }
      }

      fetchMatchingBuyers()
    }
  }, [deals])

  const handleLogout = () => {
    logout()
    router.push("/seller/login")
  }

  const filteredDeals = deals.filter(
    (deal) =>
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.companyDescription.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleBuyerSelection = (buyerId: string) => {
    console.log("🔄 Toggling buyer selection:", buyerId)
    setSelectedBuyers((prev) => {
      const newSelection = prev.includes(buyerId) ? prev.filter((id) => id !== buyerId) : [...prev, buyerId]
      console.log("✅ Updated selected buyers:", newSelection)
      return newSelection
    })
  }

  const selectAllBuyers = () => {
    const allBuyerIds = matchedBuyers.map((buyer) => buyer._id)
    console.log("🔄 Selecting all buyers:", allBuyerIds)
    setSelectedBuyers(allBuyerIds)
    setSelectAllDropdownOpen(false)
  }

  const deselectAllBuyers = () => {
    console.log("🔄 Deselecting all buyers")
    setSelectedBuyers([])
    setSelectAllDropdownOpen(false)
  }

  const handleSendInvite = async (buyerIds?: string[]) => {
    const targetBuyers = buyerIds || selectedBuyers

    if (targetBuyers.length === 0) {
      toast({
        title: "No buyers selected",
        description: "Please select at least one buyer to send an invite",
        variant: "destructive",
      })
      return
    }

    // Use the most recently created deal, or the first active deal
    const dealId = recentlyCreatedDeal?._id || deals.find((deal) => deal.status === "active")?._id || deals[0]?._id

    if (!dealId) {
      toast({
        title: "No deal available",
        description: "No active deal found to send invites for.",
        variant: "destructive",
      })
      return
    }

    try {
      setSending(true)
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in again",
          variant: "destructive",
        })
        router.push("/seller/login")
        return
      }

      console.log("🚀 Starting invite process...")
      console.log("📋 Target buyer profile IDs:", targetBuyers)

      // Extract the correct buyer IDs from the matched buyers data
      const actualBuyerIds = targetBuyers
        .map((selectedProfileId) => {
          const buyerProfile = matchedBuyers.find((b) => b._id === selectedProfileId)

          console.log(`🔍 Processing buyer profile ID: ${selectedProfileId}`)
          console.log("📄 Found buyer profile:", {
            _id: buyerProfile?._id,
            buyerId: buyerProfile?.buyerId,
            companyName: buyerProfile?.companyName,
          })

          if (!buyerProfile) {
            console.error(`❌ No buyer profile found for ID: ${selectedProfileId}`)
            return null
          }

          if (!buyerProfile.buyerId) {
            console.error(`❌ No buyerId found in profile:`, buyerProfile)
            return null
          }

          const actualBuyerId = buyerProfile.buyerId
          console.log(`✅ Extracted buyer ID: ${actualBuyerId} from profile ID: ${selectedProfileId}`)

          return actualBuyerId
        })
        .filter(Boolean) // Remove any null values

      console.log("🎯 Final buyer IDs to send to API:", actualBuyerIds)

      if (actualBuyerIds.length === 0) {
        console.error("❌ No valid buyer IDs found!")
        toast({
          title: "Error",
          description: "No valid buyer IDs found. Please try again.",
          variant: "destructive",
        })
        return
      }

      const requestBody = { buyerIds: actualBuyerIds }
      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2))
      console.log("🌐 API URL:", `${apiUrl}/deals/${dealId}/target-buyers`)

      const response = await fetch(`${apiUrl}/deals/${dealId}/target-buyers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }

        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Success response:", result)

      toast({
        title: "Invites sent successfully",
        description: `Sent invites to ${actualBuyerIds.length} buyer(s)`,
      })

      // Mark that invites have been sent for this deal
      if (recentlyCreatedDeal) {
        localStorage.setItem(`invites_sent_${recentlyCreatedDeal._id}`, "true")
      }

      // Hide buyers section after sending invites
      setShowBuyersForNewDeal(false)
      setRecentlyCreatedDeal(null)

      // Clear selected buyers if using bulk selection
      if (!buyerIds) {
        setSelectedBuyers([])
      }

      // Optionally redirect to deal details
      setTimeout(() => {
        router.push(`/seller/deal?id=${dealId}`)
      }, 2000)
    } catch (error: any) {
      console.error("❌ Error sending invites:", error)
      toast({
        title: "Error sending invites",
        description: error.message || "Failed to send invites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleSingleInvite = async (buyerId: string) => {
    await handleSendInvite([buyerId])
  }

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      const response = await fetch(`${apiUrl}/sellers/upload-profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      setUserProfile((prev: any) => ({
        ...prev,
        profilePicture: result.profilePicture,
      }))

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateName = async () => {
    if (profileName.trim()) {
      try {
        const token = localStorage.getItem("token")
        const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

        const response = await fetch(`${apiUrl}/sellers/${sellerProfile?._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fullName: profileName }),
        })

        if (response.ok) {
          setUserProfile((prev: any) => ({
            ...prev,
            fullName: profileName,
          }))
          setEditingProfile(null)
          toast({
            title: "Name updated",
            description: "Your name has been updated successfully",
          })
        }
      } catch (error) {
        toast({
          title: "Update failed",
          description: "Failed to update name",
          variant: "destructive",
        })
      }
    }
  }

  const handleDocumentUpload = (dealId: string) => {
    // Refresh deals to show updated documents
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleOffMarketClick = (deal: Deal) => {
    setSelectedDealForOffMarket(deal)
    setCurrentDialogStep(1)
    setOffMarketDialogOpen(true)
    setOffMarketData({
      dealSold: null,
      transactionValue: "",
      buyerFromCIM: null,
    })
  }

  const handleCompleteDealClick = (deal: Deal) => {
    setSelectedDealForCompletion(deal)
    setCompletionData({
      finalSalePrice: "",
    })
    setCompleteDealDialogOpen(true)
  }

  const handleDialogResponse = (key: string, value: boolean) => {
    setOffMarketData((prev) => ({ ...prev, [key]: value }))
    if (key === "dealSold") {
      setCurrentDialogStep(2)
    }
  }

  // Replace the handleCompleteDealSubmit function with this updated version
  const handleCompleteDealSubmit = async () => {
    if (!selectedDealForCompletion || !completionData.finalSalePrice) {
      toast({
        title: "Missing information",
        description: "Please provide final sale price",
        variant: "destructive",
      })
      return
    }

    // Ensure we have a selected buyer
    if (!selectedWinningBuyer) {
      toast({
        title: "Buyer required",
        description: "Please select a winning buyer to complete the deal",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      // Close the deal with the selected buyer
      const closeResponse = await fetch(`${apiUrl}/deals/${selectedDealForCompletion._id}/close`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          finalSalePrice: Number.parseFloat(completionData.finalSalePrice),
          winningBuyerId: selectedWinningBuyer, // Use the selected buyer ID
        }),
      })

      if (!closeResponse.ok) {
        const errorText = await closeResponse.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to complete deal: ${closeResponse.statusText}`)
      }

      // Remove the deal from the deals list
      setDeals((prevDeals) => prevDeals.filter((deal) => deal._id !== selectedDealForCompletion._id))

      setCompleteDealDialogOpen(false)
      toast({
        title: "Deal completed successfully",
        description: "The deal has been marked as completed and removed from your active deals",
      })
    } catch (error: any) {
      console.error("Error completing deal:", error)
      toast({
        title: "Error completing deal",
        description: error.message || "Failed to complete deal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Replace the handleOffMarketSubmit function with this updated version
  const handleOffMarketSubmit = async () => {
    if (!selectedDealForOffMarket || !offMarketData.transactionValue) {
      toast({
        title: "Missing information",
        description: "Please provide transaction value",
        variant: "destructive",
      })
      return
    }

    // If buyer is from CIM, ensure a buyer is selected
    if (offMarketData.buyerFromCIM === true && !selectedWinningBuyer) {
      toast({
        title: "Buyer required",
        description: "Please select a buyer from the list",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      // Prepare winningBuyerId: only send if buyerFromCIM is true
      const body: any = {
        finalSalePrice: Number.parseFloat(offMarketData.transactionValue),
      }
      if (offMarketData.buyerFromCIM === true) {
        body.winningBuyerId = selectedWinningBuyer
      }

      // Close the deal
      const closeResponse = await fetch(`${apiUrl}/deals/${selectedDealForOffMarket._id}/close`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!closeResponse.ok) {
        const errorText = await closeResponse.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to close deal: ${closeResponse.statusText}`)
      }

      // Remove the deal from the deals list
      setDeals((prevDeals) => prevDeals.filter((deal) => deal._id !== selectedDealForOffMarket._id))

      setOffMarketDialogOpen(false)
      toast({
        title: "Deal closed successfully",
        description: "The deal has been marked as closed and removed from your active deals",
      })
    } catch (error: any) {
      console.error("Error closing deal:", error)
      toast({
        title: "Error closing deal",
        description: error.message || "Failed to close deal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchDealStatusSummary = async (dealId: string) => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://localhost:3001"

      const response = await fetch(`${apiUrl}/deals/${dealId}/status-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Deal status summary:", data)

        // Extract buyer IDs from the deal data
        const allBuyerIds = [...data.deal.targetedBuyers, ...data.deal.interestedBuyers]

        // Remove duplicates
        const uniqueBuyerIds = [...new Set(allBuyerIds)]

        // Fetch individual buyer details
        const buyerDetailsPromises = uniqueBuyerIds.map(async (buyerId) => {
          try {
            const buyerResponse = await fetch(`${apiUrl}/buyers/${buyerId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (buyerResponse.ok) {
              const buyerData = await buyerResponse.json()

              // Determine status based on invitation status
              let status = "pending"
              const invitationStatus = data.deal.invitationStatus[buyerId]
              if (invitationStatus) {
                if (invitationStatus.response === "accepted") {
                  status = "active"
                } else if (invitationStatus.response === "rejected") {
                  status = "rejected"
                }
              }

              return {
                buyerId: buyerId,
                buyerName: buyerData.fullName || buyerData.name || "Unknown Buyer",
                companyName: buyerData.companyName || "Unknown Company",
                buyerEmail: buyerData.email || "",
                status: status,
                invitationStatus: invitationStatus,
              }
            }
          } catch (error) {
            console.error(`Error fetching buyer ${buyerId}:`, error)
            return null
          }
        })

        const buyerDetails = await Promise.all(buyerDetailsPromises)
        const validBuyerDetails = buyerDetails.filter((buyer) => buyer !== null)

        setBuyerActivity(validBuyerDetails)

        // If there's an active buyer, pre-select them
        const activeBuyer = validBuyerDetails.find((buyer) => buyer.status === "active")
        if (activeBuyer) {
          setSelectedWinningBuyer(activeBuyer.buyerId)
        }

        return validBuyerDetails
      }
    } catch (error) {
      console.error("Error fetching deal status summary:", error)
    }
    return []
  }

  // Update the useEffect that fetches buyer activity for off-market dialog:
  useEffect(() => {
    if (offMarketDialogOpen && selectedDealForOffMarket && offMarketData.buyerFromCIM === true) {
      setBuyerActivity([]) // Reset before fetching
      setBuyerActivityLoading(true)
      fetchDealStatusSummary(selectedDealForOffMarket._id).finally(() => setBuyerActivityLoading(false))
    }
  }, [offMarketDialogOpen, selectedDealForOffMarket, offMarketData.buyerFromCIM])

  // Update the useEffect for complete deal dialog:
  useEffect(() => {
    if (completeDealDialogOpen && selectedDealForCompletion) {
      setBuyerActivity([]) // Reset before fetching
      setBuyerActivityLoading(true)
      fetchDealStatusSummary(selectedDealForCompletion._id).finally(() => setBuyerActivityLoading(false))
    }
  }, [completeDealDialogOpen, selectedDealForCompletion])

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
              variant="secondary"
              className="w-full justify-start gap-3 font-normal bg-teal-100 text-teal-700 hover:bg-teal-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.5 6L12 1.5L7.5 6M3.75 8.25H20.25M5.25 8.25V19.5C5.25 19.9142 5.58579 20.25 6 20.25H18C18.4142 20.25 18.75 19.9142 18.75 19.5V8.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>My Deals</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal"
              onClick={() => router.push("/seller/view-profile")}
            >
              <Eye className="h-5 w-5" />
              <span>View Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal"
              onClick={() => router.push("/seller/history")}
            >
              <Clock className="h-5 w-5" />
              <span>History</span>
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
        <div className="flex-1 space-y-4 p-4">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-3 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Active Deals</h1>

            <div className="flex items-center justify-start gap-60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search here..."
                  className="pl-10 w-80 bg-gray-100 border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium flex items-center">
                    {editingProfile === "name" ? (
                      <div className="flex items-center">
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="mr-2 w-40"
                        />
                        <Button variant="ghost" size="icon" onClick={handleUpdateName} className="h-6 w-6 mr-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingProfile(null)} className="h-6 w-6">
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {userProfile?.fullName || sellerProfile?.fullName || "User"}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProfile("name")}
                          className="ml-1 h-6 w-6"
                        >
                          <Pencil className="h-3 w-3 text-gray-400" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {userProfile?.location || sellerProfile?.companyName || "Company"}
                  </div>
                </div>
                <div className="relative h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium overflow-hidden">
                  {userProfile?.profilePicture || sellerProfile?.profilePicture ? (
                    <img
                      src={userProfile?.profilePicture || sellerProfile?.profilePicture || "/placeholder.svg"}
                      alt={userProfile?.fullName || sellerProfile?.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (sellerProfile?.fullName || "U").charAt(0)
                  )}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="bg-white p-1 rounded-full">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                      </div>
                    ) : (
                      <Pencil className="h-4 w-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-4 mt-6">
            {/* Recently Created Deal Section */}
            {recentlyCreatedDeal && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow p-6 mb-1">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-medium text-teal-500">You have successfully created your deal</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-3 font-medium text-gray-600">Title</th>
                          <th className="pb-3 font-medium text-gray-600">Description</th>
                          <th className="pb-3 font-medium text-gray-600">Industry</th>
                          <th className="pb-3 font-medium text-gray-600">Geography</th>
                          <th className="pb-3 font-medium text-gray-600">Years</th>
                          <th className="pb-3 font-medium text-gray-600">Revenue</th>
                          {/* <th className="pb-3 font-medium text-gray-600">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">{recentlyCreatedDeal.title}</td>
                          <td className="py-2">{recentlyCreatedDeal.companyDescription}</td>
                          <td className="py-2">{recentlyCreatedDeal.industrySector}</td>
                          <td className="py-2">{recentlyCreatedDeal.geographySelection}</td>
                          <td className="py-2">{recentlyCreatedDeal.yearsInBusiness}</td>
                          <td className="py-2">${recentlyCreatedDeal.financialDetails.trailingRevenueAmount}</td>
                          <td className="py-2">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="text-teal-500">
                                {/* <Eye className="h-4 w-4" /> */}
                              </Button>
                              <Button variant="ghost" size="icon" className="text-teal-500">
                                {/* <Pencil className="h-4 w-4" /> */}
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                {/* <X className="h-4 w-4" /> */}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Matched Buyers Section */}
            {loadingBuyers ? (
              <div className="bg-white rounded-lg shadow p-3">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3aafa9] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading matching buyers...</p>
                </div>
              </div>
            ) : showBuyersForNewDeal && matchedBuyers.length > 0 ? (
              // Show matched buyers for newly created deals
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6 space-x-4">
                  <h2 className="text-lg font-medium">
                    Your deal has been matched to the following buyers. Please pick the buyers you wish to engage
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="space-x-4 flex">
                      <Button
                        variant="default"
                        className="bg-teal-500 hover:bg-teal-600"
                        onClick={() => handleSendInvite()}
                        disabled={selectedBuyers.length === 0 || sending}
                      >
                        {sending ? "Sending..." : `Send Invite${selectedBuyers.length > 1 ? "s" : ""}`}
                        {selectedBuyers.length > 0 && ` (${selectedBuyers.length})`}
                      </Button>
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="flex items-center"
                          onClick={() => setSelectAllDropdownOpen(!selectAllDropdownOpen)}
                        >
                          Select All{" "}
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </Button>
                        {selectAllDropdownOpen && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={selectAllBuyers}
                              >
                                Select All
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={deselectAllBuyers}
                              >
                                Deselect All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      className="bg-[#3aafa9] hover:bg-[#2a9d8f]"
                      onClick={() => router.push("/seller/seller-form")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Deal
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedBuyers.map((buyer) => (
                    <div key={buyer._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 flex items-start">
                        <Checkbox
                          id={`buyer-${buyer._id}`}
                          checked={selectedBuyers.includes(buyer._id)}
                          onCheckedChange={() => toggleBuyerSelection(buyer._id)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-teal-500">Buyer Details</h3>
                            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                              {buyer.matchPercentage || "N/A"}% Match
                            </span>
                          </div>

                          <div className="mb-6">
                            <h4 className="font-medium mb-2">Overview</h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-gray-500">Name: </span>
                                {buyer.buyerName || "Unknown"}
                              </div>
                              <div>
                                <span className="text-gray-500">Email: </span>
                                {buyer.buyerEmail || "Not provided"}
                              </div>
                              <div>
                                <span className="text-gray-500">Company: </span>
                                {buyer.companyName || "Unknown Company"}
                              </div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <h4 className="font-medium mb-2">Target Criteria</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div>
                                <span className="text-gray-500">Revenue Range: </span>$
                                {buyer.targetCriteria?.revenueMin?.toLocaleString() || 0} - $
                                {buyer.targetCriteria?.revenueMax?.toLocaleString() || "∞"}
                              </div>
                              <div>
                                <span className="text-gray-500">EBITDA Range: </span>$
                                {buyer.targetCriteria?.ebitdaMin?.toLocaleString() || 0} - $
                                {buyer.targetCriteria?.ebitdaMax?.toLocaleString() || "∞"}
                              </div>
                              <div>
                                <span className="text-gray-500">Transaction Size: </span>$
                                {buyer.targetCriteria?.transactionSizeMin?.toLocaleString() || 0} - $
                                {buyer.targetCriteria?.transactionSizeMax?.toLocaleString() || "∞"}
                              </div>
                              <div>
                                <span className="text-gray-500">Revenue Growth: </span>
                                {buyer.targetCriteria?.revenueGrowth || "Any"}%
                              </div>
                              <div>
                                <span className="text-gray-500">Min Years in Business: </span>
                                {buyer.targetCriteria?.minYearsInBusiness || "Any"}
                              </div>
                              <div>
                                <span className="text-gray-500">Business Models: </span>
                                {buyer.targetCriteria?.preferredBusinessModels?.join(", ") || "Any"}
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Management Preferences: </span>
                                {buyer.targetCriteria?.managementTeamPreference?.join(", ") || "Any"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 text-right">
                        <Button
                          variant="default"
                          className="bg-teal-500 hover:bg-teal-600"
                          onClick={() => handleSingleInvite(buyer._id)}
                          disabled={sending}
                        >
                          {sending ? "Sending..." : "Send Invite"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Deals Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 flex justify-between items-center">
                <div className="relative w-2/3">
                  <Input
                    type="text"
                    placeholder="Search deal with Title"
                    className="border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="default"
                  className="bg-[#3aafa9] hover:bg-[#2a9d8f]"
                  onClick={() => router.push("/seller/seller-form")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Deal
                </Button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-lg shadow p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-20 w-full mb-4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error && deals.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-red-500 text-lg mb-2">Error loading deals</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => setRefreshTrigger((prev) => prev + 1)}>Try Again</Button>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-500 text-lg mb-4">
                      {searchTerm ? "No deals match your search" : "You don't have any deals yet"}
                    </div>
                    <Button onClick={() => router.push("/seller/seller-form")}>Create Your First Deal</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDeals.map((deal) => (
                      <DealCard
                        key={deal._id}
                        deal={deal}
                        onDocumentUpload={handleDocumentUpload}
                        handleOffMarketClick={handleOffMarketClick}
                        handleCompleteDealClick={handleCompleteDealClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Off Market Dialog */}
        <Dialog open={offMarketDialogOpen} onOpenChange={setOffMarketDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {currentDialogStep === 1 ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-lg font-medium">Did the deal sell?</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="outline" onClick={() => handleDialogResponse("dealSold", false)} className="px-8">
                    No
                  </Button>
                  <Button
                    onClick={() => handleDialogResponse("dealSold", true)}
                    className="px-8 bg-teal-500 hover:bg-teal-600"
                  >
                    Yes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-teal-500 text-lg font-medium">
                    Please answer these questions
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Did the deal sell */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Did the deal sell?</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={offMarketData.dealSold === false ? "default" : "outline"}
                        onClick={() => setOffMarketData((prev) => ({ ...prev, dealSold: false }))}
                        className="flex-1"
                      >
                        No
                      </Button>
                      <Button
                        variant={offMarketData.dealSold === true ? "default" : "outline"}
                        onClick={() => setOffMarketData((prev) => ({ ...prev, dealSold: true }))}
                        className="flex-1 bg-teal-500 hover:bg-teal-600"
                      >
                        Yes
                      </Button>
                    </div>
                  </div>

                  {/* Transaction value */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">What was the transaction value?</Label>
                    <Input
                      value={offMarketData.transactionValue}
                      onChange={(e) => setOffMarketData((prev) => ({ ...prev, transactionValue: e.target.value }))}
                      placeholder="Enter transaction value"
                      className="w-full"
                    />
                  </div>

                  {/* Buyer from CIM Amplify */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Did the buyer come from CIM Amplify?</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={offMarketData.buyerFromCIM === false ? "default" : "outline"}
                        onClick={() => setOffMarketData((prev) => ({ ...prev, buyerFromCIM: false }))}
                        className="flex-1"
                      >
                        No
                      </Button>
                      <Button
                        variant={offMarketData.buyerFromCIM === true ? "default" : "outline"}
                        onClick={() => setOffMarketData((prev) => ({ ...prev, buyerFromCIM: true }))}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white hover:text-white"
                      >
                        Yes
                      </Button>
                    </div>
                  </div>

                  {/* Show buyers list if buyer came from CIM Amplify */}
                  {offMarketData.buyerFromCIM === true && (
                    <div>
                      <Label className="text-base font-medium mb-3 block">Select the buyer:</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {buyerActivityLoading ? (
                          <div className="text-center text-gray-500 py-4">Loading buyer activity...</div>
                        ) : buyerActivity.length > 0 ? (
                          buyerActivity.map((buyer) => (
                            <div
                              key={buyer.buyerId}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                                selectedWinningBuyer === buyer.buyerId
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedWinningBuyer(buyer.buyerId)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                  <img
                                    src="/placeholder.svg?height=40&width=40"
                                    alt={buyer.buyerName || "Buyer"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{buyer.buyerName || "Unknown Buyer"}</div>
                                  <div className="text-xs text-gray-500">{buyer.companyName || "Unknown Company"}</div>
                                </div>
                              </div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  buyer.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {buyer.status || "Unknown"}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-amber-600 text-sm mt-2">
                            No buyers found. Please ensure there are interested buyers before completing the deal.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit buttons */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setOffMarketDialogOpen(false)}>
                      Skip
                    </Button>
                    <Button onClick={handleOffMarketSubmit} className="bg-teal-500 hover:bg-teal-600">
                      Submit
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* Complete Deal Dialog */}
        <Dialog open={completeDealDialogOpen} onOpenChange={setCompleteDealDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-green-600 text-lg font-medium">Complete Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="text-center text-gray-600">
                Mark this deal as completed and update the final sale price.
              </div>

              {/* Final Sale Price */}
              <div>
                <Label className="text-base font-medium mb-3 block">Final Sale Price</Label>
                <Input
                  type="number"
                  value={completionData.finalSalePrice}
                  onChange={(e) => setCompletionData((prev) => ({ ...prev, finalSalePrice: e.target.value }))}
                  placeholder="Enter final sale price"
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Original asking price: $
                  {selectedDealForCompletion?.financialDetails.askingPrice?.toLocaleString() || 0}
                </div>
              </div>

              {/* Buyer Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Select Winning Buyer</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {buyerActivity.length > 0 ? (
                    buyerActivity.map((buyer) => (
                      <div
                        key={buyer.buyerId}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                          selectedWinningBuyer === buyer.buyerId ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                        onClick={() => setSelectedWinningBuyer(buyer.buyerId)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                            <img
                              src="/placeholder.svg?height=40&width=40"
                              alt={buyer.buyerName || "Buyer"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{buyer.buyerName || "Unknown Buyer"}</div>
                            <div className="text-xs text-gray-500">{buyer.companyName || "Unknown Company"}</div>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            buyer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {buyer.status || "Unknown"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">Loading buyer activity...</div>
                  )}
                </div>
                {buyerActivity.length === 0 && (
                  <div className="text-center text-amber-600 text-sm mt-2">
                    No buyers found. Please ensure there are interested buyers before completing the deal.
                  </div>
                )}
              </div>

              {/* Submit buttons */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCompleteDealDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteDealSubmit}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!completionData.finalSalePrice || !selectedWinningBuyer}
                >
                  Complete Deal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </SellerProtectedRoute>
  )
}
