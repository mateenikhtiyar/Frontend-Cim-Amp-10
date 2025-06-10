"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import type { Deal } from "@/types/deal"

interface DealFormProps {
  onClose: () => void
  onSubmit: (deal: Deal) => void
  initialData?: Partial<Deal>
}

export default function DealForm({ onClose, onSubmit, initialData }: DealFormProps) {
  const [formData, setFormData] = useState<Partial<Deal>>(
    initialData || {
      title: "",
      companyDescription: "",
      industry: "",
      geography: "",
      yearsInBusiness: 0,
      trailingRevenue: 0,
      trailingEBITDA: 0,
      revenueGrowth: 0,
      netIncome: 0,
      askingPrice: 0,
      businessMode: "",
      managementPreferences: "",
      documents: [],
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle numeric fields
    if (
      ["yearsInBusiness", "trailingRevenue", "trailingEBITDA", "revenueGrowth", "netIncome", "askingPrice"].includes(
        name,
      )
    ) {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : Number(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add validation here if needed
    onSubmit(formData as Deal)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#d0d5dd]">
          <h2 className="text-xl font-medium">{initialData ? "Edit Deal" : "Add New Deal"}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#3aafa9]">Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Deal Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Geography</label>
                <select
                  name="geography"
                  value={formData.geography}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  required
                >
                  <option value="">Select Geography</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Years in Business</label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  min="0"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#667085] mb-1">Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#3aafa9]">Financial</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Trailing 12-Month Revenue</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">$</span>
                  <input
                    type="number"
                    name="trailingRevenue"
                    value={formData.trailingRevenue}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Trailing 12-Month EBITDA</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">$</span>
                  <input
                    type="number"
                    name="trailingEBITDA"
                    value={formData.trailingEBITDA}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">3-Year Revenue Growth</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">$</span>
                  <input
                    type="number"
                    name="revenueGrowth"
                    value={formData.revenueGrowth}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Net Income</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">$</span>
                  <input
                    type="number"
                    name="netIncome"
                    value={formData.netIncome}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Asking Price</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">$</span>
                  <input
                    type="number"
                    name="askingPrice"
                    value={formData.askingPrice}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#667085] mb-1">Business Mode</label>
                <select
                  name="businessMode"
                  value={formData.businessMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  required
                >
                  <option value="">Select Business Mode</option>
                  <option value="Project-Based">Project-Based</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Retail">Retail</option>
                  <option value="Service">Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#667085] mb-1">Management Future Preferences</label>
                <input
                  type="text"
                  name="managementPreferences"
                  value={formData.managementPreferences}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3aafa9]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#3aafa9]">Documents</h3>
            <div className="border border-dashed border-[#3aafa9] rounded-md p-6 text-center">
              <p className="text-[#667085] mb-2">Drag and drop files here or click to browse</p>
              <button
                type="button"
                className="px-4 py-2 bg-[#3aafa9] text-white rounded-md"
                onClick={() => alert("Document upload functionality would be implemented here")}
              >
                Browse Files
              </button>
              <p className="text-xs text-[#667085] mt-2">Supported formats: PDF, DOC, DOCX, XLS, XLSX</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#d0d5dd]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#d0d5dd] rounded-md text-[#667085]"
            >
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-[#3aafa9] text-white rounded-md">
              {initialData ? "Update Deal" : "Add Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
