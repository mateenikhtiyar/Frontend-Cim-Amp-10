"use client"
import Image from "next/image"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ChevronDown } from "lucide-react"
import { getGeoData, type Continent, type Region, type SubRegion } from "@/lib/geography-data"
import { getIndustryData, type Sector, type IndustryGroup, type Industry, type SubIndustry } from "@/lib/industry-data"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { submitDeal } from "@/services/api"

interface SellerFormData {
  dealTitle: string
  companyDescription: string
  geographySelections: string[]
  industrySelections: string[]
  yearsInBusiness: number
  trailingRevenue: number
  trailingEBITDA: number
  revenueGrowth: number
  currency: string
  netIncome: number
  askingPrice: number
  businessModels: string[]
  managementPreferences: string[]
  capitalAvailability: string
  minPriorAcquisitions: number
  minTransactionSize: number
  documents: File[]
}

interface GeoItem {
  id: string
  name: string
  path: string
}

interface IndustryItem {
  id: string
  name: string
  path: string
}

export default function SellerFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [geoData, setGeoData] = useState<Continent[]>([])
  const [industryData, setIndustryData] = useState<Sector[]>([])
  const [flatGeoData, setFlatGeoData] = useState<GeoItem[]>([])
  const [flatIndustryData, setFlatIndustryData] = useState<IndustryItem[]>([])
  const [geoSearchTerm, setGeoSearchTerm] = useState("")
  const [industrySearchTerm, setIndustrySearchTerm] = useState("")
  const [geoOpen, setGeoOpen] = useState(false)
  const [industryOpen, setIndustryOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<SellerFormData>({
    dealTitle: "",
    companyDescription: "",
    geographySelections: [],
    industrySelections: [],
    yearsInBusiness: 0,
    trailingRevenue: 0,
    trailingEBITDA: 0,
    revenueGrowth: 0,
    currency: "USD($)",
    netIncome: 0,
    askingPrice: 0,
    businessModels: [],
    managementPreferences: [],
    capitalAvailability: "ready",
    minPriorAcquisitions: 0,
    minTransactionSize: 0,
    documents: [],
  })

  // Flatten geography data for searchable dropdown
  const flattenGeoData = (items: Continent[] | Region[] | SubRegion[], parentPath = "", result: GeoItem[] = []) => {
    items.forEach((item) => {
      const path = parentPath ? `${parentPath} > ${item.name}` : item.name
      result.push({ id: item.id, name: item.name, path })

      if ("regions" in item && item.regions) {
        flattenGeoData(item.regions, path, result)
      }
      if ("subRegions" in item && item.subRegions) {
        flattenGeoData(item.subRegions, path, result)
      }
    })
    return result
  }

  // Flatten industry data for searchable dropdown
  const flattenIndustryData = (
    items: Sector[] | IndustryGroup[] | Industry[] | SubIndustry[],
    parentPath = "",
    result: IndustryItem[] = [],
  ) => {
    
    items.forEach((item) => {
      const path = parentPath ? `${parentPath} > ${item.name}` : item.name
      result.push({ id: item.id, name: item.name, path })

      if ("industryGroups" in item && item.industryGroups) {
        flattenIndustryData(item.industryGroups, path, result)
      }
      if ("industries" in item && item.industries) {
        flattenIndustryData(item.industries, path, result)
      }
      if ("subIndustries" in item && item.subIndustries) {
        flattenIndustryData(item.subIndustries, path, result)
      }
    })
    return result
  }

  // Fetch geography and industry data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoResponse, industryResponse] = await Promise.all([getGeoData(), getIndustryData()])
        setGeoData(geoResponse.continents)
        setIndustryData(industryResponse.sectors)

        // Flatten the hierarchical data for searchable dropdowns
        setFlatGeoData(flattenGeoData(geoResponse.continents))
        setFlatIndustryData(flattenIndustryData(industryResponse.sectors))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("userRole")

    if (!token || userRole !== "seller") {
      router.push("/seller/login")
    }
  }, [router])

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  // Handle select changes
  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  // Handle checkbox changes for business models and management preferences
  const handleCheckboxChange = (
    checked: boolean,
    value: string,
    fieldName: "businessModels" | "managementPreferences",
  ) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, [fieldName]: [...prev[fieldName], value] }
      } else {
        return { ...prev, [fieldName]: prev[fieldName].filter((item) => item !== value) }
      }
    })
  }

  // Handle geography selection - single selection only
  const handleGeoSelection = (id: string) => {
    setFormData((prev) => {
      // If the same item is clicked, deselect it
      if (prev.geographySelections.includes(id)) {
        return {
          ...prev,
          geographySelections: [],
        }
      }
      // Otherwise, replace the current selection with the new one
      return {
        ...prev,
        geographySelections: [id],
      }
    })
    setGeoOpen(false)
  }

  // Handle industry selection
  const handleIndustrySelection = (id: string) => {
    setFormData((prev) => {
      // If already selected, toggle off
      if (prev.industrySelections.includes(id)) {
        return {
          ...prev,
          industrySelections: prev.industrySelections.filter((itemId) => itemId !== id),
        }
      }
      // Otherwise add to selections
      return {
        ...prev,
        industrySelections: [...prev.industrySelections, id],
      }
    })
    setIndustryOpen(false)
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size exceeds 10MB limit")
        return
      }

      setSelectedFile(file)
      setFileError(null)

      // Add to documents array
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, file],
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.dealTitle.trim()) throw new Error("Deal title is required")
      if (!formData.companyDescription.trim()) throw new Error("Company description is required")
      if (formData.geographySelections.length === 0) throw new Error("Please select a geography")
      if (formData.industrySelections.length === 0) throw new Error("Please select at least one industry")

      // Get token and sellerId from localStorage
      const token = localStorage.getItem("token")
      const sellerId = localStorage.getItem("userId")
      if (!token || !sellerId) throw new Error("Authentication required")

      // Map business models to booleans
      const businessModel = {
        recurringRevenue: formData.businessModels.includes("recurring-revenue"),
        projectBased: formData.businessModels.includes("project-based"),
        assetLight: formData.businessModels.includes("asset-light"),
        assetHeavy: formData.businessModels.includes("asset-heavy"),
      }

      // Map management preferences to booleans
      const managementPreferences = {
        retiringDivesting: formData.managementPreferences.includes("retiring-divesting"),
        staffStay: formData.managementPreferences.includes("key-staff-stay"),
      }

      // Compose the payload
      const payload = {
        title: formData.dealTitle,
        companyDescription: formData.companyDescription,
        dealType: "acquisition", // or let user select
        status: "draft",
        visibility: selectedReward || "seed",
        industrySector: flatIndustryData.find((item) => item.id === formData.industrySelections[0])?.name || "",
        geographySelection: flatGeoData.find((item) => item.id === formData.geographySelections[0])?.name || "",
        yearsInBusiness: formData.yearsInBusiness,
        financialDetails: {
          trailingRevenueCurrency: formData.currency,
          trailingRevenueAmount: formData.trailingRevenue,
          trailingEBITDACurrency: formData.currency,
          trailingEBITDAAmount: formData.trailingEBITDA,
          avgRevenueGrowth: formData.revenueGrowth,
          netIncome: formData.netIncome,
          askingPrice: formData.askingPrice,
        },
        businessModel,
        managementPreferences,
        buyerFit: {
          capitalAvailability:
            formData.capitalAvailability === "ready" ? "Ready to deploy immediately" : "Need to raise",
          minPriorAcquisitions: formData.minPriorAcquisitions,
          minTransactionSize: formData.minTransactionSize,
        },
        targetedBuyers: [],
        tags: [],
        isPublic: false,
        isFeatured: false,
        stakePercentage: 100,
        documents: [],
      }

      console.log("Submitting deal payload:", payload)

      // Submit to API (add token if needed)
      await submitDeal(payload)

      toast({
        title: "Success",
        description: "Your deal has been submitted successfully.",
      })

      setTimeout(() => {
        router.push("/seller/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Form submission error:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get selected geography name (single selection)
  const getSelectedGeoNames = () => {
    if (formData.geographySelections.length === 0) return ""
    const item = flatGeoData.find((item) => item.id === formData.geographySelections[0])
    return item ? item.name : formData.geographySelections[0]
  }

  // Get selected industry names
  const getSelectedIndustryNames = () => {
    return formData.industrySelections
      .map((id) => {
        const item = flatIndustryData.find((item) => item.id === id)
        return item ? item.name : id
      })
      .join(", ")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3aafa9]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl bg-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seller Rewards */}
        <div className="bg-[#f0f7fa] p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Seller Rewards - Click to choose</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seed Option */}
            <Card
              className={`cursor-pointer border ${selectedReward === "seed" ? "border-[#3aafa9]" : "border-gray-200"} overflow-hidden`}
              onClick={() => setSelectedReward("seed")}
            >
              <div className="flex flex-col h-full">
                <div className="p-4">
                  <div className=" flex justify-between overflow-hidden">
                    <h3 className="font-semibold  text-[#3aafa9]">Seed</h3>

                    <Image width={100} height={100} src="/seed.svg" alt="seed" className="w-20 h-20 " />
                  </div>{" "}
                  <p className="text-sm mt-2 text-gray-600">
                    This deal will be marketed solely on other deal sites. Most of our buyers chase deals from this
                    level.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <div className="p-4">
                      <div className="bg-[#3aafa9] text-white text-xs rounded-md px-3 py-3 inline-block">
                        $10 Amazon Gift Card for posting with us
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bloom Option */}
            <Card
              className={`cursor-pointer border ${selectedReward === "bloom" ? "border-[#3aafa9]" : "border-gray-200"} overflow-hidden`}
              onClick={() => setSelectedReward("bloom")}
            >
              <div className="flex flex-col h-full">
                <div className="p-4">
                  <div className=" flex justify-between overflow-hidden">
                    <h3 className="font-semibold  text-[#3aafa9]">Bloom</h3>

                    <Image width={100} height={100} src="/bloom.svg" alt="bloom" className="w-20 h-20 " />
                  </div>{" "}
                  <p className="text-sm mt-2 text-gray-600">
                    This deal will be posted exclusively on CIM Amplify for two weeks and no other deal sites. We'll
                    actively work to match directly to buyers you would otherwise not reach.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <div className="p-4">
                      <div className="bg-[#3aafa9] text-white text-xs rounded-md px-3 py-3 inline-block">
                        $25 Amazon Gift Card for posting with us PLUS $5 per $1M in transaction value if acquired via
                        CIM Amplify
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Fruit Option */}
            <Card
              className={`cursor-pointer border ${selectedReward === "fruit" ? "border-[#3aafa9]" : "border-gray-200"} overflow-hidden`}
              onClick={() => setSelectedReward("fruit")}
            >
              <div className="flex flex-col h-full">
                <div className="p-4">
                  <div className=" flex justify-between overflow-hidden">
                    <h3 className="font-semibold  text-[#3aafa9]">Fruit</h3>

                    <Image width={100} height={100} src="/fruit.svg" alt="Fruit" className="w-20 h-20 " />
                  </div>

                  <p className="text-sm mt-2 text-gray-600">
                    This deal will be posted exclusively on CIM Amplify when a buyer you select matches with you. Feel
                    free to choose on CIM Amplify.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <div className="p-4">
                      <div className="bg-[#3aafa9] text-white text-xs rounded-md px-3 py-3 inline-block">
                        $50 Amazon Gift Card for posting with us PLUS $10 per $1M in transaction value if acquired via
                        CIM Amplify
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Overview Section */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Overview</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="dealTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Title
              </label>
              <Input
                id="dealTitle"
                name="dealTitle"
                value={formData.dealTitle}
                onChange={handleInputChange}
                placeholder="Add title"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description
              </label>
              <Textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleInputChange}
                placeholder="Make sure to be very specific about what the company does"
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Geography Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geography Selector</label>
                <Popover open={geoOpen} onOpenChange={setGeoOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={geoOpen}
                      className="w-full justify-between"
                    >
                      {formData.geographySelections.length > 0 ? getSelectedGeoNames() : "Search here..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search geography..."
                        value={geoSearchTerm}
                        onValueChange={setGeoSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {flatGeoData
                            .filter(
                              (item) =>
                                item.name.toLowerCase().includes(geoSearchTerm.toLowerCase()) ||
                                item.path.toLowerCase().includes(geoSearchTerm.toLowerCase()),
                            )
                            .map((item) => (
                              <CommandItem key={item.id} value={item.id} onSelect={() => handleGeoSelection(item.id)}>
                                <div className="flex items-center mr-2">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${formData.geographySelections.includes(item.id) ? "bg-[#3aafa9] border-[#3aafa9]" : "border-gray-300"}`}
                                  >
                                    {formData.geographySelections.includes(item.id) && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                  </div>
                                </div>
                                <span>{item.path}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Industry Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry Selector</label>
                <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={industryOpen}
                      className="w-full justify-between"
                    >
                      {formData.industrySelections.length > 0 ? getSelectedIndustryNames() : "Select Industry"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search industry..."
                        value={industrySearchTerm}
                        onValueChange={setIndustrySearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {flatIndustryData
                            .filter(
                              (item) =>
                                item.name.toLowerCase().includes(industrySearchTerm.toLowerCase()) ||
                                item.path.toLowerCase().includes(industrySearchTerm.toLowerCase()),
                            )
                            .map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => handleIndustrySelection(item.id)}
                              >
                                <Checkbox checked={formData.industrySelections.includes(item.id)} className="mr-2" />
                                <span>{item.path}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Number of years in business
              </label>
              <Input
                id="yearsInBusiness"
                type="number"
                min="0"
                value={formData.yearsInBusiness || ""}
                onChange={(e) => handleNumberChange(e, "yearsInBusiness")}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Financials Section */}
        <section className="bg-[#f9f9f9] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Financials</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trailingRevenue" className="block text-sm font-medium text-gray-700 mb-1">
                  Trailing 12 Month Revenue
                </label>
                <div className="flex">
                  <Input
                    id="trailingRevenue"
                    type="number"
                    min="0"
                    value={formData.trailingRevenue || ""}
                    onChange={(e) => handleNumberChange(e, "trailingRevenue")}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Select value={formData.currency} onValueChange={(value) => handleSelectChange(value, "currency")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD($)">USD($)</SelectItem>
                    <SelectItem value="EUR(€)">EUR(€)</SelectItem>
                    <SelectItem value="GBP(£)">GBP(£)</SelectItem>
                    <SelectItem value="CAD($)">CAD($)</SelectItem>
                    <SelectItem value="AUD($)">AUD($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trailingEBITDA" className="block text-sm font-medium text-gray-700 mb-1">
                  Trailing 12 Month EBITDA
                </label>
                <Input
                  id="trailingEBITDA"
                  type="number"
                  min="0"
                  value={formData.trailingEBITDA || ""}
                  onChange={(e) => handleNumberChange(e, "trailingEBITDA")}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="revenueGrowth" className="block text-sm font-medium text-gray-700 mb-1">
                  Average 3 year revenue growth in %
                </label>
                <Input
                  id="revenueGrowth"
                  type="number"
                  min="0"
                  value={formData.revenueGrowth || ""}
                  onChange={(e) => handleNumberChange(e, "revenueGrowth")}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Optional Financial Information */}
        <section className="bg-[#f9f9f9] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Optional Financial Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="netIncome" className="block text-sm font-medium text-gray-700 mb-1">
                Net Income (Optional)
              </label>
              <Input
                id="netIncome"
                type="number"
                min="0"
                value={formData.netIncome || ""}
                onChange={(e) => handleNumberChange(e, "netIncome")}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="askingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Asking Price (Optional)
              </label>
              <Input
                id="askingPrice"
                type="number"
                min="0"
                value={formData.askingPrice || ""}
                onChange={(e) => handleNumberChange(e, "askingPrice")}
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Business Models</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring-revenue"
                  checked={formData.businessModels.includes("recurring-revenue")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked === true, "recurring-revenue", "businessModels")
                  }
                />
                <label htmlFor="recurring-revenue" className="text-sm">
                  Recurring Revenue
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="project-based"
                  checked={formData.businessModels.includes("project-based")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked === true, "project-based", "businessModels")
                  }
                />
                <label htmlFor="project-based" className="text-sm">
                  Project-Based
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="asset-light"
                  checked={formData.businessModels.includes("asset-light")}
                  onCheckedChange={(checked) => handleCheckboxChange(checked === true, "asset-light", "businessModels")}
                />
                <label htmlFor="asset-light" className="text-sm">
                  Asset Light
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="asset-heavy"
                  checked={formData.businessModels.includes("asset-heavy")}
                  onCheckedChange={(checked) => handleCheckboxChange(checked === true, "asset-heavy", "businessModels")}
                />
                <label htmlFor="asset-heavy" className="text-sm">
                  Asset Heavy
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Management Future Preferences</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="retiring-divesting"
                  checked={formData.managementPreferences.includes("retiring-divesting")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked === true, "retiring-divesting", "managementPreferences")
                  }
                />
                <label htmlFor="retiring-divesting" className="text-sm">
                  Retiring to divesting
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="key-staff-stay"
                  checked={formData.managementPreferences.includes("key-staff-stay")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked === true, "key-staff-stay", "managementPreferences")
                  }
                />
                <label htmlFor="key-staff-stay" className="text-sm">
                  Other Key Staff Will Stay
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer Fit / Ability to Close */}
        <section className="bg-[#f9f9f9] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Buyer Fit / Ability to Close</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Capital Availability</label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="ready-capital"
                  name="capitalAvailability"
                  checked={formData.capitalAvailability === "ready"}
                  onChange={() => handleSelectChange("ready", "capitalAvailability")}
                  className="h-4 w-4 text-[#3aafa9] focus:ring-[#3aafa9]"
                />
                <label htmlFor="ready-capital" className="text-sm">
                  Ready to deploy immediately
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="need-raise"
                  name="capitalAvailability"
                  checked={formData.capitalAvailability === "need-raise"}
                  onChange={() => handleSelectChange("need-raise", "capitalAvailability")}
                  className="h-4 w-4 text-[#3aafa9] focus:ring-[#3aafa9]"
                />
                <label htmlFor="need-raise" className="text-sm">
                  Need to raise
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minPriorAcquisitions" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Number of Prior Acquisitions
              </label>
              <Input
                id="minPriorAcquisitions"
                type="number"
                min="0"
                value={formData.minPriorAcquisitions || ""}
                onChange={(e) => handleNumberChange(e, "minPriorAcquisitions")}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="minTransactionSize" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Transaction Size ($)
              </label>
              <Input
                id="minTransactionSize"
                type="number"
                min="0"
                value={formData.minTransactionSize || ""}
                onChange={(e) => handleNumberChange(e, "minTransactionSize")}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-[#f9f9f9] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Documents</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Buyers have agreed to a bulletproof global NDA allowing them to see directly to your CIM or similar.
            </p>

            <div className="mb-4 flex flex-col items-center">
              <p className="text-sm mb-2">Click to upload</p>
              <p className="text-xs text-gray-500 mb-4">.PDF, .DOCX, .XLSX, .PPTX, .HTML</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-300"
              >
                Select File
              </Button>
              <input ref={fileInputRef} id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
            </div>

            {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>}

            {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}

            <p className="text-xs text-gray-500 mt-2">
              Upload your Confidential Information Memorandum or other deal documents.
            </p>
          </div>

          
        </section>

        {/* Seller Matching and Buyer Selection */}
        <section className="bg-[#f9f9f9] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Seller Matching and Buyer Selection</h2>

          <div>
            <p className="text-sm text-gray-600 mb-4">
              After submitting your deal you will be given a list of buyers to choose from and some information about
              those buyers.
            </p>

            
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#3aafa9] hover:bg-[#2a9d8f] text-white px-8 py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>

      <Toaster />
    </div>
  )
}
