"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Import the RepairsTable component with SSR disabled
const RepairsTable = dynamic(() => import("@/components/garage/repairs-table").then((mod) => mod.RepairsTable), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-4 border-b pb-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
          </div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 py-4 border-b">
                {Array(8)
                  .fill(0)
                  .map((_, j) => (
                    <Skeleton key={j} className="h-6" />
                  ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  ),
})

export function ClientWrapper() {
  return <RepairsTable />
}
