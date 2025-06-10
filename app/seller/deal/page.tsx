"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, Clock, LogOut, ArrowLeft, User, FileText, Download, Users, Clock3, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"
import SellerProtectedRoute from "@/components/seller/protected-route"

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

interface InvitationStatus {
  [buyerId: string]: {
    invitedAt: string
    respondedAt?: string
    response?: string
    notes?: string
    _id: string
  }
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
  invitationStatus?: InvitationStatus
}

interface Buyer {
  _id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  companyName: string
  status: string
  invitedAt: string
  lastActivity?: string
}

interface StatusSummary {
  deal: Deal
  buyersByStatus: {
    active: Buyer[]
    pending: Buyer[]
    rejected: Buyer[]
  }
  summary: {
    totalTargeted: number
    totalActive: number
    totalPending: number
    totalRejected: number
  }
}

export default function DealDetailsPage() {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null)
  const [loadingBuyers, setLoadingBuyers] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { logout } = useAuth()
  const dealId = searchParams.get("id")

  // Fetch seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const apiUrl = localStorage.getItem("apiUrl") || "http://168.231.74.35:3001"

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
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error)
      }
    }
    fetchSellerProfile()
  }, [])

  // Fetch deal details
  useEffect(() => {
    if (!dealId) {
      router.push("/seller/dashboard")
      return
    }

    const fetchDealDetails = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const apiUrl = localStorage.getItem("apiUrl") || "http://168.231.74.35:3001"

        if (!token) {
          router.push("/seller/login?error=no_token")
          return
        }

        const response = await fetch(`${apiUrl}/deals/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setDeal(data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching deal details:", err)
        setError(err.message || "Failed to load deal details")

        if (err.message.includes("Authentication") || err.message.includes("Forbidden")) {
          router.push("/seller/login?error=auth_failed")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDealDetails()
  }, [dealId, router])

  // Fetch status summary
  const fetchStatusSummary = async () => {
    try {
      setLoadingBuyers(true)
      const token = localStorage.getItem("token")
      const apiUrl = localStorage.getItem("apiUrl") || "http://168.231.74.35:3001"

      const response = await fetch(`${apiUrl}/deals/${dealId}/status-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        // Process invitation status to create buyer list
        const processedBuyers: Buyer[] = []

        if (data.deal?.invitationStatus) {
          // Get all buyer IDs
          const buyerIds = Object.keys(data.deal.invitationStatus)

          // Fetch buyer details for each buyer ID
          const buyerDetailsPromises = buyerIds.map(async (buyerId) => {
            try {
              const buyerResponse = await fetch(`${apiUrl}/buyers/${buyerId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              })

              if (buyerResponse.ok) {
                return await buyerResponse.json()
              } else {
                console.error(`Failed to fetch buyer ${buyerId}:`, buyerResponse.status)
                return null
              }
            } catch (error) {
              console.error(`Error fetching buyer ${buyerId}:`, error)
              return null
            }
          })

          // Wait for all buyer details to be fetched
          const buyerDetails = await Promise.all(buyerDetailsPromises)

          // Combine invitation status with buyer details
          for (let i = 0; i < buyerIds.length; i++) {
            const buyerId = buyerIds[i]
            const invitation = data.deal.invitationStatus[buyerId]
            const buyerInfo = buyerDetails[i]

            processedBuyers.push({
              _id: buyerId,
              buyerId: buyerId,
              buyerName: buyerInfo?.fullName || buyerInfo?.name || `Buyer ${buyerId.slice(-4)}`,
              buyerEmail: buyerInfo?.email || "Email not available",
              companyName: buyerInfo?.companyName || buyerInfo?.company || "Company not available",
              status: invitation.response || "pending",
              invitedAt: invitation.invitedAt,
              lastActivity: invitation.respondedAt,
            })
          }
        }

        // Categorize buyers by status
        const categorizedBuyers = {
          active: processedBuyers.filter((buyer) => buyer.status === "accepted" || buyer.status === "interested"),
          pending: processedBuyers.filter((buyer) => buyer.status === "pending" || !buyer.status),
          rejected: processedBuyers.filter((buyer) => buyer.status === "rejected" || buyer.status === "declined"),
        }

        // Update the data structure with processed buyers
        const updatedData = {
          ...data,
          buyersByStatus: categorizedBuyers,
          summary: {
            totalTargeted: processedBuyers.length,
            totalActive: categorizedBuyers.active.length,
            totalPending: categorizedBuyers.pending.length,
            totalRejected: categorizedBuyers.rejected.length,
          },
        }

        setStatusSummary(updatedData)
      } else {
        console.error("Failed to fetch status summary:", response.status)
      }
    } catch (error) {
      console.error("Error fetching status summary:", error)
    } finally {
      setLoadingBuyers(false)
    }
  }

  useEffect(() => {
    if (!dealId) return

    fetchStatusSummary()
  }, [dealId])

  const handleLogout = () => {
    logout()
    router.push("/seller/login")
  }

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string): string => {
    if (!status) {
      return "bg-gray-100 text-gray-700"
    }

    switch (status.toLowerCase()) {
      case "active":
      case "accepted":
      case "interested":
        return "bg-green-100 text-green-700"
      case "pending":
      case "invited":
      case "viewed":
        return "bg-blue-100 text-blue-700"
      case "rejected":
      case "passed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const downloadDocument = (doc: DealDocument) => {
    const apiUrl = localStorage.getItem("apiUrl") || "http://168.231.74.35:3001"
    const link = document.createElement("a")
    link.href = `${apiUrl}/uploads/deal-documents/${doc.filename}`
    link.download = doc.originalName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              variant="secondary"
              className="w-full justify-start gap-3 font-normal bg-teal-100 text-teal-700 hover:bg-teal-200"
              onClick={() => router.push("/seller/dashboard")}
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
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-4" onClick={() => router.push("/seller/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Deal Details</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-medium">{userProfile?.fullName || sellerProfile?.fullName || "User"}</div>
                <div className="text-sm text-gray-500">
                  {userProfile?.location || sellerProfile?.companyName || "Company"}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium overflow-hidden">
                {userProfile?.profilePicture || sellerProfile?.profilePicture ? (
                  <img
                    src={userProfile?.profilePicture || sellerProfile?.profilePicture || "/placeholder.svg"}
                    alt={userProfile?.fullName || sellerProfile?.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (sellerProfile?.fullName || "U").charAt(0)
                )}
              </div>
            </div>
          </header>

          {/* Deal Details Content */}
          <div className="p-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-red-500 text-lg mb-2">Error loading deal details</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => router.push("/seller/dashboard")}>Back to Dashboard</Button>
              </div>
            ) : deal ? (
              <>
                {/* Deal Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
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
                          {formatCurrency(
                            deal.financialDetails.netIncome,
                            deal.financialDetails.trailingRevenueCurrency,
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Asking Price: </span>
                        <span>
                          {formatCurrency(
                            deal.financialDetails.askingPrice,
                            deal.financialDetails.trailingRevenueCurrency,
                          )}
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
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-3">Documents</h3>
                    {deal.documents && deal.documents.length > 0 ? (
                      <div className="space-y-2">
                        {deal.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border border-gray-200 rounded"
                          >
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
                </div>

                {/* Buyer Status Summary */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium">Buyer Status Summary</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Showing invitation status and buyer details for targeted buyers.
                    </p>
                  </div>

                  <div className="p-6">
                    {loadingBuyers ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3aafa9] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading buyer status...</p>
                      </div>
                    ) : statusSummary ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-500 text-sm">Total Targeted</span>
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="text-2xl font-semibold">{statusSummary.summary.totalTargeted}</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-green-600 text-sm">Active</span>
                              <Users className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="text-2xl font-semibold">{statusSummary.summary.totalActive}</div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-blue-600 text-sm">Pending</span>
                              <Clock3 className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="text-2xl font-semibold">{statusSummary.summary.totalPending}</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-red-600 text-sm">Rejected</span>
                              <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="text-2xl font-semibold">{statusSummary.summary.totalRejected}</div>
                          </div>
                        </div>

                        {/* Active Buyers */}
                        {statusSummary.buyersByStatus.active.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-md font-medium mb-3 text-green-700">Active Buyers</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 font-medium text-gray-600">Buyer</th>
                                    <th className="pb-3 font-medium text-gray-600">Company</th>
                                    <th className="pb-3 font-medium text-gray-600">Status</th>
                                    <th className="pb-3 font-medium text-gray-600">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statusSummary.buyersByStatus.active.map((buyer) => (
                                    <tr key={buyer._id} className="border-b border-gray-100">
                                      <td className="py-4">
                                        <div className="flex items-center">
                                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                                            {buyer.buyerName &&
                                            buyer.buyerName !== `Buyer ${buyer.buyerId.slice(-4)}` ? (
                                              buyer.buyerName.charAt(0).toUpperCase()
                                            ) : (
                                              <User className="h-5 w-5" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">{buyer.buyerName}</p>
                                            <p className="text-sm text-gray-500">{buyer.buyerEmail}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={
                                            buyer.companyName === "Company not available" ? "text-gray-500 text-sm" : ""
                                          }
                                        >
                                          {buyer.companyName}
                                        </span>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
                                            buyer.status,
                                          )}`}
                                        >
                                          {buyer.status}
                                        </span>
                                      </td>
                                      <td className="py-4">{formatDate(buyer.invitedAt)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Pending Buyers */}
                        {statusSummary.buyersByStatus.pending.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-md font-medium mb-3 text-blue-700">Pending Buyers</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 font-medium text-gray-600">Buyer</th>
                                    <th className="pb-3 font-medium text-gray-600">Company</th>
                                    <th className="pb-3 font-medium text-gray-600">Status</th>
                                    <th className="pb-3 font-medium text-gray-600">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statusSummary.buyersByStatus.pending.map((buyer) => (
                                    <tr key={buyer._id} className="border-b border-gray-100">
                                      <td className="py-4">
                                        <div className="flex items-center">
                                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                                            {buyer.buyerName &&
                                            buyer.buyerName !== `Buyer ${buyer.buyerId.slice(-4)}` ? (
                                              buyer.buyerName.charAt(0).toUpperCase()
                                            ) : (
                                              <User className="h-5 w-5" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">{buyer.buyerName}</p>
                                            <p className="text-sm text-gray-500">{buyer.buyerEmail}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={
                                            buyer.companyName === "Company not available" ? "text-gray-500 text-sm" : ""
                                          }
                                        >
                                          {buyer.companyName}
                                        </span>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
                                            buyer.status,
                                          )}`}
                                        >
                                          {buyer.status}
                                        </span>
                                      </td>
                                      <td className="py-4">{formatDate(buyer.invitedAt)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Rejected Buyers */}
                        {statusSummary.buyersByStatus.rejected.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium mb-3 text-red-700">Rejected Buyers</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 font-medium text-gray-600">Buyer</th>
                                    <th className="pb-3 font-medium text-gray-600">Company</th>
                                    <th className="pb-3 font-medium text-gray-600">Status</th>
                                    <th className="pb-3 font-medium text-gray-600">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statusSummary.buyersByStatus.rejected.map((buyer) => (
                                    <tr key={buyer._id} className="border-b border-gray-100">
                                      <td className="py-4">
                                        <div className="flex items-center">
                                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                                            {buyer.buyerName &&
                                            buyer.buyerName !== `Buyer ${buyer.buyerId.slice(-4)}` ? (
                                              buyer.buyerName.charAt(0).toUpperCase()
                                            ) : (
                                              <User className="h-5 w-5" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">{buyer.buyerName}</p>
                                            <p className="text-sm text-gray-500">{buyer.buyerEmail}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={
                                            buyer.companyName === "Company not available" ? "text-gray-500 text-sm" : ""
                                          }
                                        >
                                          {buyer.companyName}
                                        </span>
                                      </td>
                                      <td className="py-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
                                            buyer.status,
                                          )}`}
                                        >
                                          {buyer.status}
                                        </span>
                                      </td>
                                      <td className="py-4">{formatDate(buyer.invitedAt)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* No buyers case */}
                        {statusSummary.summary.totalTargeted === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No buyers have been invited yet</p>
                            <Button
                              className="bg-teal-500 hover:bg-teal-600"
                              onClick={() => router.push(`/seller/dashboard?newDeal=${dealId}&success=true`)}
                            >
                              Invite Buyers
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Failed to load buyer status information</p>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/seller/dashboard?newDeal=${dealId}&success=true`)}
                        >
                          Back to Dashboard
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-gray-500 text-lg mb-2">Deal not found</div>
                <Button onClick={() => router.push("/seller/dashboard")}>Back to Dashboard</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </SellerProtectedRoute>
  )
}
