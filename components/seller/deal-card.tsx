import type { Deal } from "@/types/deal"

interface DealCardProps {
  deal: Deal
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <div className="bg-white border border-[#d0d5dd] rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-[#d0d5dd]">
        <h2 className="text-xl font-medium text-[#3aafa9]">Deal Details</h2>
      </div>

      {/* Overview Section */}
      <div className="p-4 border-b border-[#d0d5dd]">
        <h3 className="text-lg font-medium mb-3">Overview</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-[#667085]">Deal Title: </span>
            <span>{deal.title}</span>
          </div>
          <div>
            <span className="text-[#667085]">Company Description: </span>
            <span>{deal.companyDescription}</span>
          </div>
          <div>
            <span className="text-[#667085]">Industry: </span>
            <span>{deal.industry}</span>
          </div>
          <div>
            <span className="text-[#667085]">Geography: </span>
            <span>{deal.geography}</span>
          </div>
          <div>
            <span className="text-[#667085]">Number of Years in Business: </span>
            <span>{deal.yearsInBusiness}</span>
          </div>
        </div>
      </div>

      {/* Financial Section */}
      <div className="p-4 border-b border-[#d0d5dd]">
        <h3 className="text-lg font-medium mb-3">Financial</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-[#667085]">Trailing 12-Month Revenue: </span>
            <span>${deal.trailingRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#667085]">Trailing 12-Month EBITDA: </span>
            <span>${deal.trailingEBITDA.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#667085]">Average 3-YEAR REVENUE GROWTH IN %: </span>
            <span>${deal.revenueGrowth.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#667085]">Net Income: </span>
            <span>${deal.netIncome.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#667085]">Asking Price: </span>
            <span>${deal.askingPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#667085]">Business Mode: </span>
            <span>{deal.businessMode}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[#667085]">Management Future Preferences: </span>
            <span>{deal.managementPreferences}</span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="p-4 border-b border-[#d0d5dd]">
        <h3 className="text-lg font-medium mb-3">Documents</h3>
        {deal.documents && deal.documents.length > 0 ? (
          <div className="border border-dashed border-[#3aafa9] rounded-md p-3 text-center text-[#667085]">
            {deal.documents[0]}
          </div>
        ) : (
          <div className="border border-dashed border-[#3aafa9] rounded-md p-3 text-center text-[#667085]">
            No documents
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex p-4 gap-2">
        <button className="flex-1 py-2 border border-[#d0d5dd] rounded-md text-[#667085]">Edit</button>
        <button className="flex-1 py-2 bg-[#e35153]/10 text-[#e35153] border border-[#e35153] rounded-md">
          Off Market Deals
        </button>
        <button className="flex-1 py-2 bg-[#3aafa9] text-white rounded-md">Activity</button>
      </div>
    </div>
  )
}
