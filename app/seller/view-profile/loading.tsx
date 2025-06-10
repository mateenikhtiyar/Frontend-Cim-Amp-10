import { Skeleton } from "@/components/ui/skeleton"

export default function ViewProfileLoading() {
  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-white">
        <div className="p-6">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between p-4 bg-white">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-80" />
          <div className="flex items-center gap-3">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        {/* Profile Content Skeleton */}
        <div className="p-6">
          <div className="flex gap-8">
            {/* Profile Image Skeleton */}
            <Skeleton className="w-40 h-40 rounded-lg" />

            {/* Profile Information Skeleton */}
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>

          {/* Company Information Skeleton */}
          <div className="mt-10">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
